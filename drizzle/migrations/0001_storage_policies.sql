-- Admin-only writes to media buckets; reads happen server-side via signed URLs / streaming routes.
create policy "admin_write_covers" on storage.objects for insert to authenticated with check (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));
create policy "admin_update_covers" on storage.objects for update to authenticated using (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));
create policy "admin_delete_covers" on storage.objects for delete to authenticated using (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));

create policy "admin_write_ebook_files" on storage.objects for insert to authenticated with check (bucket_id = 'ebook-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin_update_ebook_files" on storage.objects for update to authenticated using (bucket_id = 'ebook-files' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'ebook-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin_delete_ebook_files" on storage.objects for delete to authenticated using (bucket_id = 'ebook-files' and public.has_role(auth.uid(), 'admin'));

create policy "admin_write_audio_files" on storage.objects for insert to authenticated with check (bucket_id = 'audio-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin_update_audio_files" on storage.objects for update to authenticated using (bucket_id = 'audio-files' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'audio-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin_delete_audio_files" on storage.objects for delete to authenticated using (bucket_id = 'audio-files' and public.has_role(auth.uid(), 'admin'));
