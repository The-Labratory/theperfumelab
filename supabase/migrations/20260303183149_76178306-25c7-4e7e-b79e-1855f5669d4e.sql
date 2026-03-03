CREATE POLICY "Anyone can read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Admins can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));