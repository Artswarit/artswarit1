-- Turn on Real-time triggers for all major Admin tables safely
DO $$ 
BEGIN
  -- Add reports to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reports;
  END IF;

  -- Add disputes to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'disputes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE disputes;
  END IF;

  -- Add profiles to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;

  -- Add user_warnings to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_warnings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_warnings;
  END IF;

  -- Add admin_audit_logs to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'admin_audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE admin_audit_logs;
  END IF;
END $$;

-- Drop redundant old admin policies so we don't hit "already exists" errors
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.reports;

-- Grant Admins overriding RLS access to reports (since clients only have access to their own)
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete reports" ON public.reports FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
