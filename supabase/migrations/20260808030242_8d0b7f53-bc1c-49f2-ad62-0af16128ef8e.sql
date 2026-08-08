CREATE POLICY "chat images upload own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "chat images read authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-images');

CREATE POLICY "chat images update own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "chat images delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);