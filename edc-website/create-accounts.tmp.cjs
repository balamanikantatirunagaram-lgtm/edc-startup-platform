const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');

const env = Object.fromEntries(readFileSync('@supabase/supabase-js/.env.local','utf8')
  .split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));

async function main(){
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {auth:{persistSession:false,autoRefreshToken:false}});

const accounts = [
  // students (login format: <NIATID>@student.tartup.local)
  { email:'n25test001@student.tartup.local', pass:'Test@1234', meta:{ name:'ARJUN TEST KUMAR', niat_id:'N25TEST001', role:'student' } },
  { email:'n25test002@student.tartup.local', pass:'Test@1234', meta:{ name:'PRIYA TEST SHARMA', niat_id:'N25TEST002', role:'student' } },
  { email:'n25test003@student.tartup.local', pass:'Test@1234', meta:{ name:'RAVI TEST TEJA', niat_id:'N25TEST003', role:'student' } },
  // mentors
  { email:'testmentor01@mentor.com', pass:'Test@1234', meta:{ name:'DR ANITA TEST RAO', username:'anita.rao', role:'mentor', title:'AI Researcher', company:'Google' } },
  { email:'testmentor02@mentor.com', pass:'Test@1234', meta:{ name:'VIKRAM TEST MEHTA', username:'vikram.mehta', role:'mentor', title:'VC Partner', company:'Sequoia' } },
  // investor
  { email:'testinvestor01@investor.com', pass:'Test@1234', meta:{ name:'NEHA TEST CAPITAL', username:'neha.capital', role:'investor', company_name:'Test Capital Partners' } },
];

for (const a of accounts) {
  const { data, error } = await admin.auth.admin.createUser({
    email:a.email, password:a.pass, email_confirm:true, user_metadata:a.meta
  });
  if (error) {
    if (error.message.includes('already')) console.log('EXISTS ', a.email);
    else console.log('FAIL   ', a.email, error.message);
  } else console.log('CREATED', a.email, data.user.id);
}

// mentors marketing/profile rows matching auth ids
const { data: users } = await admin.auth.admin.listUsers({ page:1, perPage:500 });
const byEmail = Object.fromEntries(users.users.map(u=>[u.email,u.id]));
const profiles = [
  { lookup:'testmentor01@mentor.com', row:{ name:'DR ANITA TEST RAO', role:'AI Researcher', company:'Google', expertise:['Machine Learning','Product Strategy'], availability:'Weekends' } },
  { lookup:'testmentor02@mentor.com', row:{ name:'VIKRAM TEST MEHTA', role:'VC Partner', company:'Sequoia', expertise:['Fundraising','B2B SaaS'], availability:'Evenings' } },
];
for (const p of profiles) {
  const id = byEmail[p.lookup]; if(!id){console.log('no auth id for',p.lookup);continue;}
  const { error } = await admin.from('mentors').upsert({ id, ...p.row });
  console.log(error?'PROFILE FAIL '+error.message : 'PROFILE OK '+p.lookup);
}
// investor profile row
const invId = byEmail['testinvestor01@investor.com'];
if (invId) {
  const { error } = await admin.from('investor_profiles').upsert({ id:invId, company_name:'Test Capital Partners', investment_stage:['Seed','Series A'], portfolio_size:12 });
  console.log(error?'INVESTOR PROFILE FAIL '+error.message:'INVESTOR PROFILE OK');
}

}
main().catch(e=>{console.error(e);process.exit(1)});
