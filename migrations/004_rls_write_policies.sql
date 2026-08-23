-- ============================================================================
-- Migration 004: RLS write policies for legitimate user-token operations
--
-- WHY: Migration 000 enabled RLS everywhere but only added read policies.
-- Several server actions intentionally perform writes with the STUDENT'S OWN
-- access token (not the service key). Those started failing with
--   "new row violates row-level security policy"
-- breaking: team creation, startup registration, task assignment/status,
-- portfolio edits, and funding applications.
--
-- Policies below are scoped as tightly as practical (leader-only on teams,
-- approved-member-only on tasks/startups). App-level authorization still
-- applies on top of these. Idempotent.
-- ============================================================================

-- TEAMS: any authenticated user may register a new team they lead;
-- leaders manage their own team row.
DROP POLICY IF EXISTS "Authenticated can create teams" ON public.teams;
CREATE POLICY "Authenticated can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND leader_id = auth.uid());

DROP POLICY IF EXISTS "Leader updates own team" ON public.teams;
CREATE POLICY "Leader updates own team" ON public.teams
  FOR UPDATE USING (leader_id = auth.uid());

-- STARTUPS: created during team registration; edited by approved team members.
DROP POLICY IF EXISTS "Authenticated can register startup" ON public.startups;
CREATE POLICY "Authenticated can register startup" ON public.startups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team members edit own startup" ON public.startups;
CREATE POLICY "Team members edit own startup" ON public.startups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = startups.team_id
        AND tm.student_id = auth.uid()
        AND tm.status = 'approved'
    )
  );

-- TEAM MEMBERS: leader inserts own row at creation time (other flows use svc).
DROP POLICY IF EXISTS "Leader seeds own membership" ON public.team_members;
CREATE POLICY "Leader seeds own membership" ON public.team_members
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- TASKS: approved team members can assign and update within their team.
DROP POLICY IF EXISTS "Members create team tasks" ON public.tasks;
CREATE POLICY "Members create team tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = tasks.team_id
        AND tm.student_id = auth.uid()
        AND tm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Members update team tasks" ON public.tasks;
CREATE POLICY "Members update team tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = tasks.team_id
        AND tm.student_id = auth.uid()
        AND tm.status = 'approved'
    )
  );

-- MENTOR MESSAGES: participants (team member or the mentor) may post directly.
DROP POLICY IF EXISTS "Participants post messages" ON public.mentor_messages;
CREATE POLICY "Participants post messages" ON public.mentor_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() OR mentor_id = auth.uid()
  );

-- FUNDING APPLICATIONS: students submit on behalf of their team's startup.
DROP POLICY IF EXISTS "Startups submit funding applications" ON public.funding_applications;
CREATE POLICY "Startups submit funding applications" ON public.funding_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.startups s ON s.team_id = tm.team_id
      WHERE s.id = funding_applications.startup_id
        AND tm.student_id = auth.uid()
        AND tm.status = 'approved'
    )
  );
