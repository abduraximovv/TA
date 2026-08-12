-- Storage for the Taste & Trust menu scanner (POST /api/v1/ai/scan-menu). Photos are uploaded
-- to `menu-scans/<user_id>/<file>` and kept private -- only the owning tourist can read or
-- write their own folder. Unlike the passport scanner (Step 4), menu photos aren't sensitive
-- PII, so persisting them (for the tourist to revisit their scan history later) is fine.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-scans', 'menu-scans', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

CREATE POLICY "Users can upload to their own menu-scans folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'menu-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own menu scans"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'menu-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own menu scans"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'menu-scans' AND (storage.foldername(name))[1] = auth.uid()::text);
