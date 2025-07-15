
-- Create storage bucket for artworks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true);

-- Create policy to allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own artwork files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'artworks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow public access to view artwork files
CREATE POLICY "Anyone can view artwork files" ON storage.objects
FOR SELECT USING (bucket_id = 'artworks');

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own artwork files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'artworks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own artwork files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'artworks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
