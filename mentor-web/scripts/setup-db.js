const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Shrinika%40123@db.gxehvlunpaunoxgdlbap.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
-- Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Startups Table
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  problem_statement TEXT,
  proposed_solution TEXT,
  stage TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circular FK Update
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup') THEN
    ALTER TABLE teams ADD CONSTRAINT fk_startup FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('approved', 'pending', 'invited', 'rejected')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, student_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_approved_team_per_student 
ON team_members (student_id) 
WHERE status = 'approved';

-- NEW TABLES FOR ADMIN/WEBSITE SYNC

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT,
  date TEXT,
  location TEXT,
  description TEXT,
  attendees TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  link TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  expertise TEXT[],
  company TEXT,
  image TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT,
  amount TEXT,
  deadline TEXT,
  type TEXT,
  description TEXT,
  requirements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function execute() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");
    await client.query(sql);
    console.log("Successfully created all tables and constraints!");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

execute();
