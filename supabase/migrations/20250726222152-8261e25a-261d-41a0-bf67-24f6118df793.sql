
-- Fix the immediate login issue by approving your account and the admin account
UPDATE profiles 
SET account_status = 'approved', is_verified = true 
WHERE email IN ('trulyupdate@gmail.com', 'ashwaritbasu37454@gmail.com');

-- Ensure the admin has the proper role for admin functions
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM profiles 
WHERE email = 'ashwaritbasu37454@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = profiles.id AND role = 'admin'
);
