insert into public.creators (id, name, avatar_url, description, is_guest)
values (
  '3740949a-f6bb-4697-b5e6-ac511ac741c2',
  'Bishop Shammah Womack-El',
  'https://powprayerclinic.netlify.app/images/bishop.jpg',
  'Bishop and spiritual leader of Temple of Radiant Light.',
  false
)
on conflict (id) do nothing;

insert into mux.assets (
  id,
  status,
  created_at,
  duration_seconds,
  aspect_ratio,
  playback_ids,
  meta,
  is_premium,
  creator_id,
  category
)
values
  (
    'c8Qq2O4TnqmOhEzILgQunfk1XDWPkln2yp6Lt6t7W00w',
    'ready',
    '2026-07-27 23:03:36+00',
    56.1561,
    '1:1',
    '[{"id":"cVvICRhzDrs02I00wYCYW1Dx8JcNK702apfURZFNaw02UV00","policy":"public"}]',
    '{"title":"Rich People Ask"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Sermons & Teachings'
  ),
  (
    'BVeajo8ryIqyv3bkrDYTE7Euk6veoUlET6NRXWhWRng',
    'ready',
    '2026-07-27 23:02:40+00',
    57.6,
    '9:16',
    '[{"id":"CvFxUS2sNaGGRUqFknDa9l202WWgW48svc4CYk4FVGz8","policy":"public"}]',
    '{"title":"The Danger of Avoidance"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Shorts'
  ),
  (
    'cy5Vzf8WjQZBZVF3ZfLSpYcSGFs6G84GOX8d1PMGtEo',
    'ready',
    '2026-07-27 23:02:56+00',
    72.466667,
    '9:16',
    '[{"id":"euOH1humtR9imrfBbTmYcsgCg48ZswAkf2UlkFW3hpo","policy":"public"}]',
    '{"title":"The New Fig Leaves"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Shorts'
  ),
  (
    'EDmcYG25Fcx00ccIc1luaUnGioUr8r7Z1WsqGBV2tOAg',
    'ready',
    '2026-07-27 23:02:27+00',
    62.566667,
    '9:16',
    '[{"id":"1T9I5geQ9XPnkA8FcUT7024GKJA4z02qgYtab01Dc3DHFE","policy":"public"}]',
    '{"title":"Consider Your Ways"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Shorts'
  ),
  (
    'HN7q9WPy00wY6lgtVILbwlQ00oSa7aOJgPMbiWh02TWhkw',
    'ready',
    '2026-07-17 02:50:35+00',
    3940.042667,
    '9:16',
    '[{"id":"MRrCjQlwLPXKJg9tbympQJRqPtXpIbsh1I00g32ruTAA","policy":"public"}]',
    '{"title":"Bible Study & Prayer Clinic"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Courses & Bible Study'
  ),
  (
    'IhE2sBMPdIFTqVGSb00TYLzFtRuSQ9WOqC013yAxFen00w',
    'ready',
    '2026-07-17 02:44:48+00',
    3580.909333,
    '16:9',
    '[{"id":"Cw300Z01I3Sov02tWdQslm01ZPBwr4ArBB6VCTg62fd01f400","policy":"public"}]',
    '{"title":"The Spirit of Jehu"}',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Sermons & Teachings'
  )
on conflict (id) do nothing;

insert into mux.playlist_items (playlist_id, asset_id, position)
values
  ('10000000-0000-4000-8000-000000000001', 'c8Qq2O4TnqmOhEzILgQunfk1XDWPkln2yp6Lt6t7W00w', 1),
  ('10000000-0000-4000-8000-000000000001', 'BVeajo8ryIqyv3bkrDYTE7Euk6veoUlET6NRXWhWRng', 2),
  ('10000000-0000-4000-8000-000000000001', 'cy5Vzf8WjQZBZVF3ZfLSpYcSGFs6G84GOX8d1PMGtEo', 3),
  ('10000000-0000-4000-8000-000000000002', 'EDmcYG25Fcx00ccIc1luaUnGioUr8r7Z1WsqGBV2tOAg', 1),
  ('10000000-0000-4000-8000-000000000002', 'HN7q9WPy00wY6lgtVILbwlQ00oSa7aOJgPMbiWh02TWhkw', 2),
  ('10000000-0000-4000-8000-000000000002', 'IhE2sBMPdIFTqVGSb00TYLzFtRuSQ9WOqC013yAxFen00w', 3)
on conflict (playlist_id, asset_id) do update
set position = excluded.position;
