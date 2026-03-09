-- Add DELETE policy for messages to allow participants to clear chat
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.artist_id = auth.uid())
  )
);
