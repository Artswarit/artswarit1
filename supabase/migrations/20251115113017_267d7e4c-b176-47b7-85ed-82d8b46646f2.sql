-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'function_task_mappings_function_component_key'
  ) THEN
    ALTER TABLE function_task_mappings 
    ADD CONSTRAINT function_task_mappings_function_component_key 
    UNIQUE (function_name, component_name);
  END IF;
END $$;

-- Create function-task mappings for automatic task creation
INSERT INTO function_task_mappings (function_name, component_name, task_template, auto_create_task, auto_assign, default_priority) VALUES
  ('uploadArtwork', 'ArtworkManagement', '{"title": "Upload Artwork", "description": "User uploaded new artwork"}', true, false, 'medium'),
  ('deleteArtwork', 'ArtworkManagement', '{"title": "Delete Artwork", "description": "User deleted artwork"}', true, false, 'low'),
  ('updateArtwork', 'ArtworkManagement', '{"title": "Update Artwork", "description": "User updated artwork details"}', true, false, 'low'),
  ('updateProfile', 'ArtistProfile', '{"title": "Update Profile", "description": "User updated their profile"}', true, false, 'low'),
  ('createProject', 'ProjectManagement', '{"title": "Create Project", "description": "Client created new project"}', true, false, 'high'),
  ('submitFeedback', 'ArtworkFeedback', '{"title": "Submit Feedback", "description": "User submitted artwork feedback"}', true, false, 'low'),
  ('likeArtwork', 'ArtworkCard', '{"title": "Like Artwork", "description": "User liked an artwork"}', false, false, 'low'),
  ('followArtist', 'ArtistProfile', '{"title": "Follow Artist", "description": "User followed an artist"}', false, false, 'low'),
  ('sendMessage', 'MessagingModule', '{"title": "Send Message", "description": "User sent a message"}', true, false, 'medium'),
  ('uploadFile', 'FileUpload', '{"title": "Upload File", "description": "User uploaded a file"}', true, false, 'medium')
ON CONFLICT (function_name, component_name) DO UPDATE SET
  task_template = EXCLUDED.task_template,
  auto_create_task = EXCLUDED.auto_create_task,
  auto_assign = EXCLUDED.auto_assign,
  default_priority = EXCLUDED.default_priority,
  updated_at = now();