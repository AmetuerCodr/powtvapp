begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

insert into auth.users (id, aud, role, email)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'saved-a@example.com'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'authenticated',
    'authenticated',
    'saved-b@example.com'
  );

insert into public.creators (id, name, is_guest)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'Saved Video Test Creator',
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
    'saved-video-test-old',
    'ready',
    false,
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '{"title":"Saved Video Test Old"}',
    now()
  ),
  (
    'saved-video-test-new',
    'ready',
    false,
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '{"title":"Saved Video Test New"}',
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);

insert into public.saved_videos (user_id, asset_id, created_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'saved-video-test-old',
    '2026-01-01 00:00:00+00'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'saved-video-test-new',
    '2026-01-02 00:00:00+00'
  );

do $$
begin
  if (
    select array_agg(asset_id order by created_at desc)
    from public.saved_videos
  ) is distinct from array[
    'saved-video-test-new',
    'saved-video-test-old'
  ]::text[] then
    raise exception 'Owner visibility or newest-first order is wrong';
  end if;

  begin
    insert into public.saved_videos (user_id, asset_id)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'saved-video-test-old'
    );
    raise exception 'Duplicate saved video was accepted';
  exception
    when unique_violation then null;
  end;
end
$$;

select set_config(
  'request.jwt.claim.sub',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  true
);

do $$
begin
  if (select count(*) from public.saved_videos) <> 0 then
    raise exception 'Another user can read saved video';
  end if;

  begin
    insert into public.saved_videos (user_id, asset_id)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'saved-video-test-old'
    );
    raise exception 'Forged saved video owner was accepted';
  exception
    when insufficient_privilege then null;
  end;

  delete from public.saved_videos
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
end
$$;

select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);

do $$
begin
  if (select count(*) from public.saved_videos) <> 2 then
    raise exception 'Another user deleted saved video';
  end if;
end
$$;

reset role;
select pass('saved video uniqueness and owner RLS work');
select * from finish();
rollback;
