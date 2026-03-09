-- Create storage policies for message attachments in the media bucket

-- Allow authenticated users to upload files to message-attachments folder
CREATE POLICY "Users can upload message attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'message-attachments');

-- Allow authenticated users to read message attachments
CREATE POLICY "Users can read message attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'message-attachments');

-- Allow public access to message attachments (for viewing shared files)
CREATE POLICY "Public can read message attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'message-attachments');