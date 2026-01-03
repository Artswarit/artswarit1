-- Fix unread message badge staying at 1: allow participants to mark messages as read
-- Messages table already has RLS enabled; it was missing an UPDATE policy.

CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.artist_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.artist_id = auth.uid())
  )
);