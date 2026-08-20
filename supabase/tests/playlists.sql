begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

do $$
begin
  if exists (
    select 1
    from mux.playlists as playlist
    left join mux.playlist_items as item
      on item.playlist_id = playlist.id
    where playlist.id in (
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002'
    )
    group by playlist.id
    having count(item.asset_id) <> 3
  ) then
    raise exception 'Seed playlists must contain three videos each';
  end if;
end
$$;

insert into public.creators (id, name, is_guest)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'Playlist Test Creator',
  false
);

insert into mux.assets (
  id,
  status,
  is_premium,
  creator_id,
  meta,
  created_at
)
values
  (
    'playlist-test-first',
    'ready',
    false,
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '{"title":"First"}',
    now()
  ),
  (
    'playlist-test-second',
    'ready',
    false,
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '{"title":"Second"}',
    now()
  ),
  (
    'playlist-test-hidden',
    'ready',
    true,
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '{"title":"Hidden"}',
    now()
  );

insert into mux.playlists (id, name, is_series)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  'Playlist Test',
  true
);

insert into mux.playlist_items (playlist_id, asset_id, position)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'playlist-test-second',
    2
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'playlist-test-first',
    1
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'playlist-test-hidden',
    3
  );

do $$
begin
  if (
    select array_agg(asset_id order by position)
    from mux.playlist_items
    where playlist_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
  ) is distinct from array[
    'playlist-test-first',
    'playlist-test-second',
    'playlist-test-hidden'
  ]::text[] then
    raise exception 'Playlist items are not ordered';
  end if;

  begin
    insert into mux.playlist_items (playlist_id, asset_id, position)
    values (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'playlist-test-first',
      4
    );
    raise exception 'Duplicate playlist video was accepted';
  exception
    when unique_violation then null;
  end;

  begin
    insert into mux.playlist_items (playlist_id, asset_id, position)
    values (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'playlist-test-second',
      1
    );
    raise exception 'Duplicate playlist position was accepted';
  exception
    when unique_violation then null;
  end;

  begin
    insert into mux.playlist_items (playlist_id, asset_id, position)
    values (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'playlist-test-hidden',
      0
    );
    raise exception 'Invalid playlist position was accepted';
  exception
    when check_violation then null;
  end;
end
$$;

set local role anon;

do $$
begin
  if (
    select count(*)
    from mux.playlists
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
  ) <> 1 then
    raise exception 'Public cannot read playlist';
  end if;

  if (
    select array_agg(asset_id order by position)
    from mux.playlist_items
    where playlist_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
  ) is distinct from array[
    'playlist-test-first',
    'playlist-test-second'
  ]::text[] then
    raise exception 'Public playlist order or hidden-asset policy is wrong';
  end if;

  begin
    insert into mux.playlists (name) values ('Forbidden');
    raise exception 'Anon playlist write was accepted';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

reset role;
select pass('playlist integrity, ordering, read access, and write denial work');
select * from finish();
rollback;
