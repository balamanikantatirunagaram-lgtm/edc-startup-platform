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
