-- Allow client-side (anon/authenticated) SELECT access to mux.assets
-- The existing "Block client access" policy (FOR ALL USING (false)) is permissive,
-- so this permissive SELECT policy ORs with it, opening read-only access
-- while leaving INSERT/UPDATE/DELETE blocked for anon/authenticated.

DROP POLICY IF EXISTS "Allow client read access" ON "mux"."assets";
CREATE POLICY "Allow client read access" ON "mux"."assets"
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON "mux"."assets" TO anon, authenticated;
