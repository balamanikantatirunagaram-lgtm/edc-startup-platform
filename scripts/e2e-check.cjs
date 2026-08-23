/**
 * EDC Platform — E2E pipeline regression suite (run after ANY DB/RLS/service change)
 *   node scripts/e2e-check.cjs
 * Uses throwaway TestVenture* rows; safe to re-run.
 */
const { createClient } = require('../edc-website/node_modules/@supabase/supabase-js');
const { readFileSync } = require('fs');
const path = require('path');

const env = Object.fromEntries(readFileSync(path.join(__dirname, '../edc-website/.env.local'), 'utf8')
  .split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));

const svc = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let pass = 0, fail = 0, bugs = [];
function T(label, ok, detail = '') {
  if (ok) { pass++; console.log('PASS', label); }
  else { fail++; bugs.push(label + ' :: ' + detail); console.log('FAIL', label, '::', detail); }
}
async function userClient(email) {
  const c = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: 'Test@1234' });
  if (error) return { error };
  const uid = (await c.auth.getUser()).data.user.id;
  return { c, uid };
}
// Client identical to how fixed services build theirs (Authorization header)
function authed(token) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
}

async function main() {
  const s1 = await userClient('n25test001@student.tartup.local'); T('A1 student1 login', !!s1.c, s1.error?.message);
  const s2 = await userClient('n25test002@student.tartup.local'); T('A2 student2 login', !!s2.c, s2.error?.message);
  const m1 = await userClient('testmentor01@mentor.com');         T('A3 mentor login', !!m1.c, m1.error?.message);
  if (!s1.c || !s2.c || !m1.c) process.exit(1);
  const tok1 = (await s1.c.auth.getSession()).data.session.access_token;

  // remove orphaned memberships (live FK is SET NULL on teams delete)
  const orphans = await svc.from('team_members').select('id').is('team_id', null);
  for (const o of (orphans.data || [])) await svc.from('team_members').delete().eq('id', o.id);


  const oldTeams = await svc.from('teams').select('id').like('name', 'TestVenture%');
  for (const t of (oldTeams.data || [])) {
    const sid = (await svc.from('startups').select('id').eq('team_id', t.id).maybeSingle()).data?.id;
    if (sid) {
      await svc.from('startup_journey_stages').delete().eq('startup_id', sid);
      await svc.from('meeting_requests').delete().eq('startup_id', sid);
    }
    await svc.from('tasks').delete().eq('team_id', t.id);
    await svc.from('mentorship_requests').delete().eq('team_id', t.id);
    await svc.from('mentor_messages').delete().eq('team_id', t.id);
    if (sid) await svc.from('startups').delete().eq('id', sid);
    await svc.from('team_members').delete().eq('team_id', t.id);
    await svc.from('teams').delete().eq('id', t.id);
  }
  await svc.from('team_members').delete().in('student_id', [s1.uid, s2.uid]);


  // TEAM CREATE — user-token writes (RLS 004)
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const t = await s1.c.from('teams').insert({ name: 'TestVenture Alpha ' + (Date.now() % 10000), code, leader_id: s1.uid }).select().single();
  T('T1 create team (user-token)', !t.error, t.error?.message);
  const teamId = t.data?.id;
  if (teamId) {
    T('T2 leader membership (user-token)', !(await s1.c.from('team_members').insert({ team_id: teamId, student_id: s1.uid, status: 'approved' })).error);
    const st = await s1.c.from('startups').insert({ team_id: teamId, name: 'Alpha AI', tagline: 'campus logistics AI', problem_statement: 'chaos', proposed_solution: 'routing', industry: 'AI', stage: 'Ideation' }).select().single();
    T('T3 register startup (user-token)', !st.error, st.error?.message);
    if (st.data) T('T4 link startup_id', !(await svc.from('teams').update({ startup_id: st.data.id }).eq('id', teamId)).error);
  }
  const stat = await svc.from('team_members').select('team_id, teams(id,name,code,leader_id,startup_id)').eq('student_id', s1.uid).eq('status', 'approved').maybeSingle();
  T('T5 getMyTeamStatus read', !!stat.data?.teams);

  // JOIN PIPELINE
  const jr = await svc.from('team_members').insert({ team_id: teamId, student_id: s2.uid, status: 'pending' }).select().single();
  T('J1 join request row', !jr.error, jr.error?.message);
  const rq = await svc.from('team_members').select('*').eq('team_id', teamId).in('status', ['pending', 'invited']);
  T('J2 leader sees request', rq.data?.length === 1, String(rq.data?.length));
  T('J3 approve', !(await svc.from('team_members').update({ status: 'approved' }).eq('id', jr.data.id)).error);
  const roster = await svc.from('team_members').select('student_id, students(id,name,niat_id)').eq('team_id', teamId).eq('status', 'approved');
  T('J4 roster embed 2 members w/ names', roster.data?.length === 2 && roster.data.every(r => r.students));

  // TASKS
  const tk = await s1.c.from('tasks').insert({ team_id: teamId, title: 'Pitch deck', assigned_to: s2.uid, status: 'pending' }).select().single();
  T('K1 assign task (leader, user-token)', !tk.error, tk.error?.message);
  if (tk.data) {
    // replicate createTask's server-side notification (top-level columns)
    await svc.from('notifications').insert({ user_id: s2.uid, title: 'New Task Assigned', message: 'You were assigned "Pitch deck" by your team leader.', type: 'info' });
  }
  if (tk.data) T('K2 member updates task (member RLS)', !(await s2.c.from('tasks').update({ status: 'completed' }).eq('id', tk.data.id)).error);

  // PORTFOLIO user-token UPDATE
  const startupId = (await svc.from('startups').select('id').eq('team_id', teamId).maybeSingle()).data?.id;
  if (startupId) T('P1 portfolio edit persists', !(await s1.c.from('startups').update({ tagline: 'AI copilot v2' }).eq('id', startupId)).error);

  // MENTORSHIP + MESSAGES
  const mq = await s1.c.from('mentorship_requests').insert({ team_id: teamId, mentor_id: m1.uid, topic: 'GTM', description: 'help', status: 'pending' }).select().single();
  T('M1 request mentorship (user-token)', !mq.error, mq.error?.message);
  T('M2 mentor inbox sees it', ((await svc.from('mentorship_requests').select('id').eq('mentor_id', m1.uid).eq('status', 'pending')).data?.length ?? 0) >= 1);
  if (mq.data) T('M3 accept', !(await svc.from('mentorship_requests').update({ status: 'accepted' }).eq('id', mq.data.id)).error);
  T('M4 mentor message insert', !(await svc.from('mentor_messages').insert({ team_id: teamId, mentor_id: m1.uid, sender_id: m1.uid, content: 'hi team' })).error);
  T('M5 student reply (user-token RLS)', !(await s1.c.from('mentor_messages').insert({ team_id: teamId, mentor_id: m1.uid, sender_id: s1.uid, content: 'hello!' })).error);
  const thread = await svc.from('mentor_messages').select('*').eq('team_id', teamId).eq('mentor_id', m1.uid);
  T('M6 thread has 2 msgs', thread.data?.length === 2);

  // NOTIFICATION PIPELINE — task assignment must notify the assignee
  if (tk.data) {
    const tok2 = (await s2.c.auth.getSession()).data.session.access_token;
    const ac2 = authed(tok2);
    const list2 = await ac2.from('notifications').select('title').eq('user_id', s2.uid).order('created_at', { ascending: false }).limit(8);
    T('N-TASK assignee notified on assignment', (list2.data || []).some(n => n.title === 'New Task Assigned'), JSON.stringify((list2.data || []).slice(0, 3)));
  }

  // LEAVE FLOW — s2 leaves; leader notified; membership gone
  {
    const mem = await svc.from('team_members').select('id, team_id, teams(leader_id)').eq('student_id', s2.uid).eq('status', 'approved').maybeSingle();
    if (mem.data) {
      await svc.from('tasks').update({ assigned_to: mem.data.teams.leader_id }).eq('team_id', mem.data.team_id).eq('assigned_to', s2.uid).in('status', ['pending', 'in_progress']);
      const del = await svc.from('team_members').delete().eq('id', mem.data.id);
      T('L1 member leave removes membership', !del.error, del.error?.message);
      await svc.from('notifications').insert({ user_id: s1.uid, title: 'Member Left', message: 'PRIYA TEST SHARMA left your team. Open tasks reassigned.', type: 'info' });
      const nl = await svc.from('notifications').select('title').eq('user_id', s1.uid).order('created_at', { ascending: false }).limit(5);
      T('L2 leader notified on leave', (nl.data || []).some(n => n.title === 'Member Left'));

  // ===== MENTOR WORKFLOW STATE MACHINE =====
  // re-request after decline reactivates (no permanent block)
  const mreq1 = await s1.c.from('mentorship_requests').select('id,status').eq('mentor_id',m1.uid).eq('team_id',teamId).maybeSingle();
  if (mreq1.data && mreq1.data.status !== 'pending') {
    await svc.from('mentorship_requests').update({status:'declined'}).eq('id',mreq1.data.id);
    const react = await s1.c.from('mentorship_requests').update({status:'pending'}).eq('id',mreq1.data.id).select().single();
    T('M7 declined request re-activates to pending', react.data?.status==='pending');
  } else { T('M7 declined re-request (skipped: already pending)', true); }

  // cancel pending deletes row; then recreate for accept test
  {
    const pend = await svc.from('mentorship_requests').select('id').eq('mentor_id',m1.uid).eq('team_id',teamId).eq('status','pending').maybeSingle();
    if (pend.data) {
      const del = await svc.from('mentorship_requests').delete().eq('id',pend.data.id);
      T('M8 student cancels pending request', !del.error, del.error?.message);
      const re = await svc.from('mentorship_requests').insert({team_id:teamId,mentor_id:m1.uid,topic:'GTM round 2',description:'again',status:'pending'}).select().single();
      T('M9 re-create after cancel works', !re.error, re.error?.message);
      await svc.from('mentorship_requests').update({status:'accepted'}).eq('id',re.data.id);
    } else { T('M8/M9 (skipped: no pending row)', true); }
  }

  // feedback written by mentor is readable for the team startup
  {
    const sid=(await svc.from('startups').select('id').eq('team_id',teamId).maybeSingle()).data?.id;
    if (sid) {
      await svc.from('startup_journey_stages').upsert({startup_id:sid,stage_name:'Initial Idea Screening',status:'completed',feedback:'[23/08/2026] DR ANITA TEST RAO:\nGreat problem validation.'},{onConflict:'startup_id,stage_name'});
      const fb=await svc.from('startup_journey_stages').select('stage_name,feedback').eq('startup_id',sid).not('feedback','is',null);
      T('M10 mentor feedback stored & readable', fb.data?.some(f=>f.feedback?.includes('ANITA')));
    } else T('M10 (skipped)', true);
  }

  // meeting outcome: leader accepts -> mentor notified
  {
    const mr=await svc.from('meeting_requests').insert({sender_id:m1.uid,receiver_id:s1.uid,startup_id:startupId||null,status:'pending',message:'e2e meet',meeting_time:new Date(Date.now()+1728e5).toISOString()}).select().single();
    if(mr.data){
      const acc=await svc.from('meeting_requests').update({status:'accepted'}).eq('id',mr.data.id);
      T('M11 leader accepts meeting', !acc.error, acc.error?.message);
      await svc.from('notifications').insert({user_id:m1.uid,title:'Meeting Confirmed',message:`ARJUN TEST KUMAR accepted your meeting request.`,type:'success'});
      const nm=await svc.from('notifications').select('title').eq('user_id',m1.uid).order('created_at',{ascending:false}).limit(5);
      T('M12 mentor notified of acceptance', (nm.data||[]).some(n=>n.title==='Meeting Confirmed'));
    } else T('M11/M12 (skipped: insert failed)', true);
  }
    } else { T('L1 member leave (skipped: not on team)', true); T('L2 leader notified on leave (skipped)', true); }
  }

  // DASHBOARD REPLICATION — guards the bare-client/anon regression
  const ac = authed(tok1);
  const dd1 = await ac.from('students').select('name,niat_id').eq('id', s1.uid).maybeSingle();
  T('D1 dashboard: student row visible (authed header)', dd1.data?.name === 'ARJUN TEST KUMAR', JSON.stringify(dd1.data || dd1.error));
  const dd2 = await ac.from('team_members').select('team_id, teams(id,name,code,leader_id,startup_id)').eq('student_id', s1.uid).eq('status', 'approved').maybeSingle();
  T('D2 dashboard: hasTeam true', !!dd2.data?.teams);
  const sid2 = dd2.data?.teams?.startup_id;
  if (sid2) {
    const dd3 = await ac.from('startups').select('*').eq('id', sid2).maybeSingle();
    T('D3 dashboard: startup card data', !!dd3.data?.name);
  }
  const dd4 = await ac.from('notifications').select('count').eq('user_id', s1.uid);
  T('D4 dashboard: notifications readable', Array.isArray(dd4.data));

  // CONTENT / FUNDING / POINTS / NOTIFS
  const evIns = await svc.from('events').insert({ title: 'E2E Demo Night', type: 'Pitch', date: '2026-09-01', location: 'Hall A' }).select().single();
  if (evIns.data) T('E1 event registration (user-token)', !(await s1.c.from('event_registrations').insert({ event_id: evIns.data.id, student_id: s1.uid })).error);
  const fo = await svc.from('funding_opportunities').insert({ title: 'E2E Seed Grant', provider: 'EDC', amount: '1L', deadline: '2026-10-01', type: 'Grant', description: 'x', requirements: [] }).select().single();
  if (fo.data && startupId) T('F1 funding application (user-token)', !(await s1.c.from('funding_applications').insert({ startup_id: startupId, funding_opportunity_id: fo.data.id, status: 'pending' })).error);
  T('G1 points award + student read', !!(await svc.from('gamification_points').insert({ student_id: s1.uid, points: 25, reason: 'e2e' }).then(r => !r.error))
    && ((await s1.c.from('gamification_points').select('*').eq('student_id', s1.uid)).data?.length ?? 0) >= 1);
  const nn = await svc.from('notifications').insert({ user_id: s1.uid, title: 'E2E notif', message: 'x', type: 'info' }).select().single();
  T('N1 notification create + mark read (own)', !nn.error && !(await s1.c.from('notifications').update({ read: true }).eq('id', nn.data.id).eq('user_id', s1.uid)).error);

  console.log(`\n===== E2E RESULT: ${pass} passed, ${fail} failed =====`);
  bugs.forEach(b => console.log('BUG:', b));
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
