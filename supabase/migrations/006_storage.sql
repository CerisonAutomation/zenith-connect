-- Storage buckets + RLS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profiles', 'profiles', true, 5242880, '{"image/jpeg","image/png","image/webp"}'),
  ('media', 'media', false, 26214400, '{"image/jpeg","image/png","image/webp","video/mp4","audio/webm"}')
on conflict (id) do nothing;

-- Profiles bucket: public read, owner write
create policy "profiles_storage_select"
  on storage.objects for select
  using (bucket_id = 'profiles');

create policy "profiles_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'profiles'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "profiles_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'profiles'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Media bucket: owner only
create policy "media_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "media_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
