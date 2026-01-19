-- Create the project-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project files" ON storage.objects;

-- Allow authenticated users to upload files to project-files bucket
CREATE POLICY "Users can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view project files (since they're reference files for projects)
CREATE POLICY "Users can view project files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-files');

-- Allow users to delete their own project files
CREATE POLICY "Users can delete their own project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);