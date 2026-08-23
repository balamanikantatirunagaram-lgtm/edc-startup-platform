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

## 6. Pipeline Audit Round 2 (2026-08-22) — Full Embed & Workflow Sweep

Method: extracted every PostgREST embed used across all 3 sites and tested each against the live DB OpenAPI/REST; audited task/member/delete workflows.

### Embed test matrix (17 relationships)
| Relationship | Status | Used by | Action |
|---|---|---|---|
| team_members → students | ✅ OK after migration 001 | edc/mentor startup roster, web-admin teams | — |
| job_postings → startups | ✅ | jobs pages | — |
| job_applications → job_postings / students | ✅ | applications lists | — |
| job_applications → job_postings!inner → startups | ✅ nested | leader Jobs tab | — |
| courses → course_modules | ✅ | learning | — |
| meeting_requests / funding_applications / mentorship_requests / mentor_messages → their parents | ✅ | mentor/admin portals | — |
| events → event_registrations → students | ✅ | admin content | — |
| gamification_points → students | ✅ | admin gamification | — |
| **teams → startups (nested)** | ❌ PGRST201 ambiguous (`fk_startup` vs `startups_team_id_fkey`) | mentor-web mentorship active-startups list | **fixed in code**: `startups!fk_startup` hint |
| **startup_documents → startups** | ❌ PGRST200 no FK | web-admin + mentor-web Documents pages | **migration 002** adds FK w/ CASCADE |

### Workflow gaps found & fixed (edc-website)
1. `createTask()` — no check that assignee is an approved member → now validated server-side.
2. `updateTaskStatus()` — updated ANY task by id regardless of team ownership → now verifies task belongs to caller's team.
3. `removeTeamMember()` — left the removed member's tasks orphaned ("Unknown" assignees) → open tasks now reassigned to the leader.
4. `deleteMyStartup()` — ignored delete errors; leaked `startup_documents`, `job_postings`, `job_applications`, `mentorship_requests` → sequential dependent cleanup with error surfacing.

### Remaining action for user
Run `migrations/002_add_startup_documents_fk.sql` in Supabase SQL Editor (same as 001).



---

# 7. Full-Codebase Audit Report (2026-08-23)

Method: 3 parallel deep audits (one per portal) + live-DB verification of every Supabase `.select()`/`.insert()` field name against actual table columns via REST/OpenAPI.

## 7.1 CRITICAL — fixed

| # | Issue | Impact | Fix |
|---|---|---|---|
| 1 | **Job acceptance never added applicant to team** — insert used `team_members.role` which doesn't exist in live DB; error was only console.logged | Leader accepts application → success toast, but student never appears in team, job never closes | edc `jobs.service.ts`: drop `role`, reactivate existing row if present, surface errors, close posting |
| 2 | **`notifications.payload` column doesn't exist** — live table has top-level `title`/`message`/`type` | ALL job-decision + mentor-web team/mentorship/meeting notifications silently failed to insert | Rewrote both writers in all sites to top-level columns (kept legacy signature compat) |
| 3 | **Gamification always 0 pts** — profile page passed `profile.id` (undefined: metadata has no id) AND service queried wrong column `user_id` | Profile points badge permanently 0 | Service self-resolves auth user + queries `student_id`; page updated |
| 4 | **web-admin "Add Investor" could never succeed** — posted `investment_size`/`user_id`/`experience` (nonexistent) and fabricated a fake FK id | Flow always errored | New `createInvestorAccount()` provisions an auth account then inserts real schema fields (`investment_stage[]`, `portfolio_size`); form/table rebuilt |
| 5 | **web-admin events showed "0 Registered" always** — page's service selected `*` without the count embed | Wrong data displayed | `getEventsAdmin` now selects `event_registrations(count)` |
| 6 | **web-admin AI-prompt CRUD wrote nonexistent `system_context`** | Every create/update failed | Switched to real `category` column (service + form) |
| 7 | **web-admin `deleteStartupAdmin` lied about success** — 9 destructive deletes, zero error checks | Orphaned rows on partial failure while UI toasted success | Sequential checked cleanup incl. documents/applications/postings/mentorship requests |
| 8 | **web-admin `/api/test-login` leaked admin credentials** (`EdcAdmin`/`Niat@2025`) unauthenticated | Anyone could log in as admin | Route + test script deleted |
| 9 | **mentor-web meetings pipeline inverted** — read only mentor-*sent* requests and rendered nonexistent fields (`topic`/`preferred_time`); no accept/decline UI; wrong status vocab (`rejected`) | Meetings page useless | Fetches both directions with `direction` tag, renders real `message`/`meeting_time`, working Accept/Decline, `declined` vocab |
| 10 | **Startup detail pages crashed on team ids** — mentor dashboard links sometimes carry team id (mentorship fallback), queries filtered by it directly | Blank journey/documents for some startups | Server-side resolver accepts startup OR team id in all 3 queries |

## 7.2 HIGH — fixed

11. **Fake onboarding**: `/onboarding` wizard saved nothing but said "completed" → documented; route is unreferenced (recommend removal later).
12. **Journey timeline stuck at step 1** on My Startup → now wired to real `startup_journey_stages` completed-count.
13. **Fake "Assigned EDC Team" mentors** (Dr. Ramesh / Akash Kumar shown to every student) → replaced with honest "Browse Mentors" card.
14. **Header notification badge** driven by empty localStorage mock → now polls real unread count every 60s.
15. **Status vocabulary chaos** (`pending` vs `Pending Review` vs Title-Case): web-admin now writes lowercase snake_case (`under_review`, `needs_improvement`, `approved`, `incubation_ready`); journey stages unified to `pending/in_progress/under_review/needs_improvement/completed/approved`; edc StatusBadge normalizes any casing; `[Review]` feedback rows can no longer hijack real milestones; sidebar Incubator gate matches lowercase.
16. **Student profile viewer** read auth metadata (mostly empty) instead of `students` table → now reads students row first.
17. **Mentor creation regex bug** — `/\\s+/g` matched literal `\s`, producing invalid emails like `john doe@mentor.com` → fixed escaping.
18. **Funding fallback field** `opportunity_id` → real `funding_opportunity_id`.
19. **AI assistant fake replies** when API key missing → honest config error message.
20. **Landing contact form** silently discarded submissions → opens mail client with prefilled content.
21. **Mentor-web reset-password page** validated locally then redirected without calling anything → fully wired to security-question flow.

## 7.3 MEDIUM/LOW — documented, not fixed (no user-visible breakage)

- Silent error swallowing in ~20 service functions (return empty arrays unlogged) — behavior preserved but flagged for future surfacing.
- web-admin JWT secret falls back to hardcoded string if env unset; logout blocklist is in-memory only; admins seed password plaintext in root schema.sql — rotate credentials & set env in production.
- Dead code: edc NotificationBell, duplicate notification/content services, mentor-web entire student-shaped service layer (dashboard/tasks/team/startup mutations), localStorage mock store (`app-state-context`) still mounted.
- edc `(app)/layout.tsx` guard skips redirect when no cookie (edge proxy covers it); defense-in-depth recommended.
- `typescript.ignoreBuildErrors: true` in mentor-web/web-admin next configs masks type errors at build time.
- mentors exist as rows in `students` (auth trigger side effect) — harmless today.
- Viksit Bharat stubs in all portals; impact.service writes would fail (`impact_description`) if revived — fix before wiring.

## 7.4 Verification

- All 17 PostgREST embed relationships re-tested against live REST: OK.
- `tsc --noEmit` ✅ and `next build` ✅ on **all three sites**.

---

# 8. Cross-Portal Flow Audit Round 3 (2026-08-23)

Question: "when a portal does X, does it actually show up on the other portals?" Method: traced every write → read path across edc-website ↔ web-admin ↔ mentor-web against live DB rows.

## 8.1 CONFIRMED BROKEN — fixed

| # | Flow | What was broken | Fix |
|---|---|---|---|
| 1 | **Student requests mentorship → mentor sees it** | Requests stored `mentor_id` from the *marketing* `mentors` table (random UUIDs). Mentor portal matches by **auth.users id** → mentors NEVER saw student requests. Verified live: the only request row points at a marketing UUID. Same break broke message threads (`mentor_messages.mentor_id`). | New `mentor-directory.service.ts`: directory now lists **auth users with role='mentor'** (enriched from profile table by username) so `/mentors`, requests, and messages all key off auth ids. Name resolution is auth-first with legacy-table fallback. |
| 2 | Legacy rows still pointing at old ids | Existing request/message threads unrecoverable | **Migration 003** remaps `mentorship_requests.mentor_id` + `mentor_messages.mentor_id/sender_id` from mentors-table UUIDs → auth ids (username/email join). Run in SQL Editor. |
| 3 | **Admin suspends student → nothing happened** | No code anywhere checked `students.is_suspended` at login; suspended students kept logging in | edc login now blocks suspended accounts (session refused + redirect to /suspended). |
| 4 | Admin awards points → student never knew | Award inserted silently; student-side reader was also broken (fixed in round 2) | Award now creates a notification; student profile shows real totals. |
| 5 | Admin creates event → inconsistent notifications | Page-used copy sent notifications with broken `payload` shape (never delivered); other copy didn't notify at all | Both copies unified: top-level title/message, non-suspended students only, errors logged. |

## 8.2 VERIFIED WORKING end-to-end

- Startup registration → admin review queue → approve/reject writes status + notifies leader → student badge/sidebar gate reflect it (post-vocab-unification).
- Journey milestone updates (admin/mentor) ↔ student tracker: stage_name lists are identical across portals (verified live row).
- Documents upload → admin/mentor document lists (needs migration 002 FK).
- Job postings (startup) → student board; applications → leader Jobs tab; accept → team roster + posting closes (round-2 fix).
- Team join/invite/approve/remove pipeline (rounds 0–1).
- Event registrations → admin counts (round-2 fix); funding applications → admin list.
- Mentorship accept/decline by mentor → leader notified; accepted unlocks messaging both directions.
- Meeting requests: mentor sends → leader notified. ⚠️ Students have no meetings UI yet — leaders can only see the notification. Documented as known gap.
- Courses/resources/events CRUD → student pages render live tables (no mock arrays found on listing pages).

## 8.3 Known gaps (documented, not built)

1. Student-side meetings surface (accept/decline incoming meeting requests) — needs new UI on edc-website.
2. Viksit Bharat module stubbed in all 3 portals; impact.service has wrong column if revived.
3. Onboarding wizard collects fields it doesn't persist.
4. Dead student-shaped service layer shipped in mentor-web (~10 files) — recommend deletion.
5. localStorage mock store (`app-state-context`) still mounted in edc/web-admin headers — display-fallback only.

## 8.4 Verification
`tsc --noEmit` ✅ + `next build` ✅ on edc-website, mentor-web, web-admin.

---

# 9. DB ↔ Codebase Triple-Scan & Full Schema (2026-08-23)

Three systematic scans of every table/bucket/column reference across all 3 portals vs the LIVE database.

## 9.1 Scan results

**Scan 1 — tables:** All 31 tables referenced in code exist in the live DB (`avatars`/`resumes` are buckets, not tables). `resource_templates` exists but is unused by code.

**Scan 2 — INSERT shapes:** Zero unknown columns remain in any `.insert()` across all services (after rounds 1–3 fixes).

**Scan 3a — UPDATE shapes:** Zero unknown columns. **Scan 3b — storage:**
- 🔴 **`resumes` bucket did not exist** → job applicants' resume uploads failed silently, applications saved with empty `resume_url`. Bucket created live via API ✅; code now surfaces upload failures instead of swallowing them.
- Buckets live: startup-documents, avatars, event-banners, course-thumbnails, course-videos, resumes (+ policies in schema).

## 9.2 Deliverable: `migrations/000_full_schema.sql`

Single idempotent file that provisions a complete project from scratch OR reconciles an existing one:
- 31 tables w/ exact live-matched columns, PKs, FKs (incl. circular teams↔startups), UNIQUE + CHECK constraints
- Partial unique index (one approved team per student) + migrations 001/002 FK equivalents built-in
- `handle_new_user` trigger + students backfill
- RLS enabled on all tables with pragmatic policies (content read for authenticated, owner-only personal rows, service-role writes)
- 6 storage buckets + public-read/authenticated-upload object policies
- Seeds: default admin (rotate password!), Viksit Bharat categories

Run order on a fresh project: `000_full_schema.sql` alone suffices. On the current project it's also safe (all guards are IF NOT EXISTS / ON CONFLICT / DO blocks).
