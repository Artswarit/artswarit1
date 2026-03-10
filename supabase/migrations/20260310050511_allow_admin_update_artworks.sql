-- Migration to allow admins to update artwork status (for moderation)
-- File: supabase/migrations/20260310050511_allow_admin_update_artworks.sql

DO $$
BEGIN
    -- Check if policy exists and delete if it does to recreate
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artworks' AND policyname = 'Allow platform admins to update any artwork'
    ) THEN
        DROP POLICY "Allow platform admins to update any artwork" ON public.artworks;
    END IF;

    -- Create policy for admins (UPDATE)
    CREATE POLICY "Allow platform admins to update any artwork" 
    ON public.artworks 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

    -- Check if SELECT policy exists and delete if it does to recreate
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artworks' AND policyname = 'Allow platform admins to view any artwork'
    ) THEN
        DROP POLICY "Allow platform admins to view any artwork" ON public.artworks;
    END IF;

    -- Create policy for admins (SELECT)
    CREATE POLICY "Allow platform admins to view any artwork" 
    ON public.artworks 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

    -- Check if DELETE policy exists and delete if it does to recreate
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artworks' AND policyname = 'Allow platform admins to delete any artwork'
    ) THEN
        DROP POLICY "Allow platform admins to delete any artwork" ON public.artworks;
    END IF;

    -- Create policy for admins (DELETE)
    CREATE POLICY "Allow platform admins to delete any artwork" 
    ON public.artworks 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
END $$;
