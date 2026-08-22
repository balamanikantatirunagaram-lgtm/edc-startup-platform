# Startup Flow Redesign — Context & Completed Work

## 1. Context & Completed Work
- Portals sidebar group removed from both **edc-website** & **mentor-web**; cross-portal links moved into header profile dropdowns (Mentor Portal, Admin Portal, Student Portal) so all 3 sites stay connected.
- New components created in `edc-website/src/components/startup/`:
  - **StartupHero.tsx** — gradient hero: avatar initials, name, tagline, status badge, copyable team code chip, member count.
  - **StartupStats.tsx** — 4-stat strip (Team Size, Tasks Done w/ progress bar, Join Requests, Mentors Connected).
  - **JourneyTimeline.tsx** — vertical timeline of the 11 milestones with connecting line + reached-state checkmarks + "Full Tracker" CTA.
  - **TeamMemberCard.tsx** — avatar initials, leader crown badge, hover-reveal remove button.
  - **TaskItem.tsx** — status-colored task card (amber/blue/green), assignee avatar, compact status select.

## 2. My Startup Page — New Layout (`/startup`)
Data source (unchanged): `getMyStartup()` returns `{name, tagline, problem, solution, targetCustomers, businessModel, revenueModel, status, teamMembers[{id,name,role}], attachments{pitchDeck, website, demoVideo}}`; plus tasks, join requests, job applications, mentorship requests.

```
┌─ StartupHero ────────────────────────────────┐
├─ StartupStats ───────────────────────────────┤
├─ Tabs (pill style): Portfolio | Journey | Team | Tasks | Mentors | Jobs(leader)
│   • Portfolio: 2-col grid — Problem/Solution/Business Model display
│     left + Quick Links card right; edit form inline; Danger Zone
│     as separate destructive-bordered card at bottom
│   • Journey: <JourneyTimeline/>
│   • Team: TeamMemberCard list + QR card w/ copy code;
│     leader-only invite search + pending join requests
│   • Tasks: assign form (leader, polished grid) + tasks grouped
│     by status (Pending → In Progress → Completed) via TaskItem
│   • Jobs: application cards with resume link + accept/reject
│   • Mentors: mentor cards with avatar, status pill, Message CTA
└──────────────────────────────────────────────┘
```

Preserved functionality (zero changes): `loadEverything()`, 30s auto-refresh of join requests, portfolio edit/save/delete, member search/invite/remove, task create/status change, job app accept/reject/reset, mentor messaging links, no-team empty state.

## 3. Team Connect Page Upgrade (`/team`)
- Hero header with icon + "How it works" 3-step strip (Get code → Request → Leader approves).
- Invitations card: avatar-accented rows with Approve/Decline buttons.
- Pending requests card: styled status pills.
- Join card: large mono code input + QR scanner tab (unchanged logic); Create Team CTA stays prominent.
- All handlers unchanged: `joinTeam`, `respondToInvitation`, redirect-if-has-team flow.

## 4. Pipelines / Connections
- DB: same Supabase project via REST (`students`, `teams`, `team_members`, `startups`, `tasks`, `mentorship_requests`, `job_postings`/`applications`).
- Other sites: mentor portal receives mentorship requests/messages from this page's Mentors tab; web-admin reviews startups registered via this flow; portal switch links live in header dropdowns.
- Verification: `tsc --noEmit` + `next build` on edc-website (and quick check on mentor-web after sidebar edits).

## 5. Team Joining Pipeline — Full Workflow Map & Fixes (2026-08-22)

### Workflow map
```
CREATE TEAM (leader)                    JOIN VIA CODE (student)              INVITE (leader → student)
  createTeam():                          joinTeam(code):                      inviteStudent():
    no existing approved team?            team code valid?                     student free?
    insert teams (+code)                  no approved team anywhere?           insert/reactivate row
    insert team_members leader            pending/invited for team?            status='invited'
      (admin client, error surfaced)      insert OR reactivate rejected        → notify student
    insert startups, link startup_id      status='pending' → notify leader
                                                 │
   ┌─────────────────────────────────────────────┴──────────────────────────┐
   │ getTeamRequests() shows pending+invited rows to leader (/startup Team) │
   │ getMyInvitations() shows invited rows to student (/team)               │
   └─────────────────────────────────────────────┬──────────────────────────┘
                                                 ▼
                              handleTeamRequest(id, approved|rejected)
                                auth = team.leader_id == caller OR target student
                                update team_members.status
                                if approved:
                                  auto-reject all other pending/invited rows of that student
                                  notify student ("approved!")
                                  notify leader if a student ACCEPTED an invite
                                                 ▼
                       Read paths: getMyTeamStatus() / getMyStartup()
                       memberships (status=approved) → students hydrated
                       → roster drives Team tab, task assignee select, stats
```

DB invariants: `UNIQUE(team_id, student_id)` on team_members; partial unique index allows only ONE `status='approved'` row per student.

### Bugs found & fixed
1. **Invisible members (root cause):** `team_members.student_id` FK targets `auth.users`, NOT `public.students`. PostgREST embeds `students(...)` failed with PGRST200 → `getMyStartup()` returned an empty roster even though approvals succeeded in DB. Fixed with a manual 2-step query (memberships → batch profile fetch) in **both** edc-website and mentor-web `startup.service.ts`.
2. **Re-join after rejection broke:** old `rejected` row blocked re-insert (`23505`). `joinTeam()` now reactivates the row to `pending`; `inviteStudent()` reactivates to `invited`.
3. **Silent leader-membership failure:** `createTeam()` inserted the leader's `team_members` row via the RLS-bound auth client and ignored errors → switched to admin client + surfaced failure.
4. **Notification gaps:** invites now notify the student; invite acceptance now notifies the leader; approval notifications resolve real team names.
5. **Root DB fix (recommended):** run `migrations/001_add_team_members_students_fk.sql` in Supabase SQL Editor — adds `fk_team_members_student` so FK embeds work platform-wide (web-admin etc.), with orphan backfill. Code fix works without it; migration makes everything consistent.

### Verification performed
- Live REST simulation of fixed read path resolved all 5 approved members of team `80850e46…`.
- `tsc --noEmit` + `next build` green on edc-website; mentor-web typecheck green.

