begin;

create extension if not exists pgtap with schema extensions;

select plan(1);

insert into public.creators (id, name, is_guest)
values
  (
    '33333333-3333-4333-8333-333333333333',
    'Search Test Creator',
    false
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Search Test Guest',
    true
  );

insert into mux.assets (
  id,
  status,
  is_premium,
  creator_id,
  category,
  meta,
  aspect_ratio,
  created_at
)
values
  (
    'search-test-wellness',
    'ready',
    false,
    '33333333-3333-4333-8333-333333333333',
    'Wellness & Health',
    '{"title":"Healthy Habits"}',
    '16:9',
    now()
  ),
  (
    'search-test-music',
    'ready',
    false,
    '33333333-3333-4333-8333-333333333333',
    'Music & Worship',
    '{"title":"Morning Worship"}',
    '16:9',
    now()
  ),
  (
    'search-test-courses',
    'ready',
    false,
    '33333333-3333-4333-8333-333333333333',
    'Courses & Bible Study',
    '{"title":"Bible Foundations"}',
    '16:9',
    now()
  ),
  (
    'search-test-shorts',
    'ready',
    false,
    '33333333-3333-4333-8333-333333333333',
    'Shorts',
    '{"title":"A Quick Word"}',
    '9:16',
    now()
  ),
  (
    'search-test-guest',
    'ready',
    false,
    '44444444-4444-4444-8444-444444444444',
    'Guest Creators',
    '{"title":"Guest Message"}',
    '9:16',
    now()
  );

insert into mux.assets (
  id,
  status,
  is_premium,
  creator_id,
  meta,
  aspect_ratio,
  created_at
)
values
  (
    'search-test-sermons',
    'ready',
    false,
    '33333333-3333-4333-8333-333333333333',
    '{"title":"Faith OVER Fear"}',
    '16:9',
    now()
  ),
  (
    'search-test-hidden-premium',
    'ready',
    true,
    '33333333-3333-4333-8333-333333333333',
    '{"title":"Faith Over Fear Premium"}',
    '16:9',
    now()
  );

do $$
begin
  if exists (
    select 1
    from mux.assets
    where category is null
      or category not in (
        'Sermons & Teachings',
        'Wellness & Health',
        'Music & Worship',
        'Courses & Bible Study',
        'Shorts',
        'Guest Creators'
      )
  ) then
    raise exception 'An asset has a null or unsupported category';
  end if;

  if (
    select category
    from mux.assets
    where id = 'search-test-sermons'
  ) is distinct from 'Sermons & Teachings' then
    raise exception 'New assets do not receive the default category';
  end if;

  if exists (
    select 1
    from mux.assets as asset
    join public.creators as creator on creator.id = asset.creator_id
    where asset.id like 'search-test-%'
      and creator.is_guest
      and asset.category <> 'Guest Creators'
  ) then
    raise exception 'Guest creator category backfill is incorrect';
  end if;

  if exists (
    select 1
    from mux.assets as asset
    join public.creators as creator on creator.id = asset.creator_id
    where asset.id like 'search-test-%'
      and not creator.is_guest
      and asset.aspect_ratio = '9:16'
      and asset.category <> 'Shorts'
  ) then
    raise exception 'Non-guest vertical video category backfill is incorrect';
  end if;

  begin
    insert into mux.assets (id, category)
    values ('search-test-invalid-category', 'Other');
    raise exception 'Unsupported category was accepted';
  exception
    when check_violation then null;
  end;

  begin
    insert into mux.assets (id, category)
    values ('search-test-null-category', null);
    raise exception 'Null category was accepted';
  exception
    when not_null_violation then null;
  end;
end
$$;

set local role anon;

do $$
begin
  if (
    select array_agg(id order by id)
    from mux.assets
    where id like 'search-test-%'
      and category = 'Shorts'
  ) is distinct from array['search-test-shorts']::text[] then
    raise exception 'Category filtering returned unexpected assets';
  end if;

  if (
    select array_agg(id order by id)
    from mux.assets
    where id like 'search-test-%'
      and meta ->> 'title' ilike '%faith over fear%'
  ) is distinct from array['search-test-sermons']::text[] then
    raise exception 'Case-insensitive title search or asset RLS is incorrect';
  end if;
end
$$;

reset role;
select pass('video category constraints, backfill, filtering, and RLS work');
select * from finish();
rollback;
