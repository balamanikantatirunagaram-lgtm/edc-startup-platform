-- Create Mentorship Requests Table
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, mentor_id)
);

-- Create Mentor Messages Table
CREATE TABLE IF NOT EXISTS mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Optional, but recommended for security)
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and insert (Basic policy for MVP)
CREATE POLICY "Enable read access for all authenticated users" ON mentorship_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON mentorship_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON mentorship_requests FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all authenticated users" ON mentor_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON mentor_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON mentor_messages FOR UPDATE USING (auth.role() = 'authenticated');
