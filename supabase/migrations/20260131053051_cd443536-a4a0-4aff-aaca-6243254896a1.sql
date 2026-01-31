-- Recovery options
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_codes_hash text;

-- Response time tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_hours integer;

-- Vacation mode
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_vacation boolean DEFAULT false;

-- Artwork ordering
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Partial payments
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;

-- Recently viewed
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Saved artworks
CREATE TABLE IF NOT EXISTS saved_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Artist availability
CREATE TABLE IF NOT EXISTS artist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'available',
  note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(artist_id, date)
);

-- User blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  reason text,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on new tables
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recently_viewed
CREATE POLICY "Users can view their own recently viewed" ON recently_viewed
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own recently viewed" ON recently_viewed
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own recently viewed" ON recently_viewed
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently viewed" ON recently_viewed
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for saved_artworks
CREATE POLICY "Users can view their own saved artworks" ON saved_artworks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved artworks" ON saved_artworks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved artworks" ON saved_artworks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for artist_availability
CREATE POLICY "Artists can manage their availability" ON artist_availability
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Public can view artist availability" ON artist_availability
  FOR SELECT USING (true);

-- RLS Policies for user_blocks
CREATE POLICY "Users can view their blocks" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert their blocks" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their blocks" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);