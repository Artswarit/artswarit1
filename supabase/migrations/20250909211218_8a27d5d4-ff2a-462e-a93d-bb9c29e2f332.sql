-- Create RLS policies for secure access control

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own complete profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view approved artists" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    role IN ('artist', 'premium') AND 
    account_status = 'approved'
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artworks policies
DROP POLICY IF EXISTS "Approved artworks are viewable by everyone" ON public.artworks;
DROP POLICY IF EXISTS "Artists can insert their own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Artists can update their own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Artists can delete their own artworks" ON public.artworks;

CREATE POLICY "Public can view approved artworks" ON public.artworks
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Artists can view their own artworks" ON public.artworks
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artists can insert their own artworks" ON public.artworks
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own artworks" ON public.artworks
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own artworks" ON public.artworks
  FOR DELETE USING (auth.uid() = artist_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Clients can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artist_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artist_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (client_id = auth.uid() OR artist_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Sales policies
CREATE POLICY "Artists can view their own sales" ON public.sales
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artists can insert their own sales" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = artist_id);

CREATE POLICY "Users can create subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = artist_id);

-- Notifications policies
CREATE POLICY "Users can read their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Clients can view their follow relationships" ON public.follows
  FOR SELECT USING (client_id = auth.uid() OR artist_id = auth.uid());

CREATE POLICY "Clients can follow artists" ON public.follows
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can unfollow" ON public.follows
  FOR DELETE USING (client_id = auth.uid());

-- Artwork likes policies
CREATE POLICY "Anyone can view likes" ON public.artwork_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like artworks" ON public.artwork_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike artworks" ON public.artwork_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Artwork views policies
CREATE POLICY "Users can view artwork views" ON public.artwork_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create artwork views" ON public.artwork_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Artwork feedback policies
CREATE POLICY "Public can view feedback" ON public.artwork_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feedback" ON public.artwork_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON public.artwork_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON public.artwork_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- Saved artists policies
CREATE POLICY "Clients can view their own saved artists" ON public.saved_artists
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can save artists" ON public.saved_artists
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can unsave their own saved artists" ON public.saved_artists
  FOR DELETE USING (auth.uid() = client_id);

-- Withdrawals policies
CREATE POLICY "Users can view their withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can create their own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artwork images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

CREATE POLICY "Artists can upload artworks" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own artworks" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artworks' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own project files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own project files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );