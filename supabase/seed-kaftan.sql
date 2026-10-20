-- AYLIN: adds the Kaftan product (maroon / yellow / white, each with front, side, back photos).
-- Run in Supabase → SQL Editor, AFTER schema.sql.
--
-- 1. Storage → media bucket → create a folder "kaftan" and upload the 9 photos from the repo's
--    assets/kaftan/ folder (maroon-front.jpg, maroon-side.jpg, ... white-back.jpg).
-- 2. Replace YOUR-PROJECT below with your project reference (the xxxx in https://xxxx.supabase.co).
-- 3. Edit the description / details here or later in /admin.

insert into categories (slug, name, sort) values ('kaftans', 'Kaftans', 1), ('kurtis', 'Kurtis', 2) on conflict (slug) do nothing;

insert into products (slug, name, category_id, price, description, details, sizes, colors, featured)
select
  'kaftan', 'Kaftan', c.id,
  2499,
  'A relaxed, flowing kaftan with Kashmiri embroidery along the neckline and hem.',
  '',
  array['40','44'],
  jsonb_build_array(
    jsonb_build_object('name','Maroon','hex','#8f1d22','images', jsonb_build_array(
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/maroon-front.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/maroon-side.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/maroon-back.jpg')),
    jsonb_build_object('name','Yellow','hex','#f1de6b','images', jsonb_build_array(
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/yellow-front.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/yellow-side.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/yellow-back.jpg')),
    jsonb_build_object('name','White','hex','#f7f4ee','images', jsonb_build_array(
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/white-front.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/white-side.jpg',
      'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/media/kaftan/white-back.jpg'))
  ),
  true
from categories c where c.slug = 'kaftans'
on conflict (slug) do nothing;
