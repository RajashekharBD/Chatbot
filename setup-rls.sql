-- 1. Use Supabase's native auth.uid() function
-- (We no longer need to create the 'auth' schema manually as Supabase provides it)

-- 2. Define our custom user_id helper if we still want to use it
-- but Supabase's auth.uid() is generally preferred.
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- 3. Enable RLS and Force it for existing tables
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" FORCE ROW LEVEL SECURITY;

-- 4. Create policies
-- Conversation policy
DROP POLICY IF EXISTS "Users can only access their own conversations" ON "Conversation";
CREATE POLICY "Users can only access their own conversations" ON "Conversation"
FOR ALL 
USING (auth.user_id() = "userId")
WITH CHECK (auth.user_id() = "userId");

-- Message policy
DROP POLICY IF EXISTS "Users can only access messages in their conversations" ON "Message";
CREATE POLICY "Users can only access messages in their conversations" ON "Message"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Conversation"
    WHERE "Conversation".id = "Message"."conversationId"
    AND "Conversation"."userId" = auth.user_id()
  )
);
