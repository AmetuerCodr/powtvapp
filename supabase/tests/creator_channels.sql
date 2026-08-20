begin;

insert into public.creators (id, name, description, is_guest)
values (
  '11111111-1111-4111-8111-111111111111',
  'Guest Test Creator',
  'Local verification fixture',
  true
);

insert into mux.assets (
  id,
  status,
  is_premium,
  creator_id,
  meta,
  playback_ids,
  aspect_ratio,
  created_at
)
values
  (
    'creator-test-visible',
    'ready',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    '{"title":"Visible"}',
    '[{"id":"public-visible","policy":"public"}]',
    '16:9',
    now()
  ),
  (
    'creator-test-guest',
    'ready',
    false,
    '11111111-1111-4111-8111-111111111111',
    '{"title":"Guest"}',
    '[{"id":"public-guest","policy":"public"}]',
    '16:9',
    now()
  ),
  (
    'creator-test-unassigned',
    'ready',
    false,
    null,
    '{}',
    '[]',
    '16:9',
    now()
  ),
  (
    'creator-test-premium',
    'ready',
    true,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    '{}',
    '[]',
    '16:9',
    now()
  ),
  (
    'creator-test-preparing',
    'preparing',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    '{}',
    '[]',
    '16:9',
    now()
  ),
  (
    'creator-test-upsert',
    'ready',
    false,
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    '{}',
    '[]',
    '16:9',
    now()
  );

insert into mux.assets (id, status)
values ('creator-test-upsert', 'errored')
on conflict (id) do update
set status = excluded.status;

do $$
begin
  if (
    select creator_id
    from mux.assets
    where id = 'creator-test-upsert'
  ) is distinct from '3740949a-f6bb-4697-b5e6-ac511ac741c2'::uuid then
    raise exception 'Mux-style upsert cleared creator_id';
  end if;

  begin
    insert into mux.assets (id, creator_id)
    values (
      'creator-test-invalid-fk',
      '22222222-2222-4222-8222-222222222222'
    );
    raise exception 'Invalid creator foreign key was accepted';
  exception
    when foreign_key_violation then null;
  end;

  begin
    delete from public.creators
    where id = '3740949a-f6bb-4697-b5e6-ac511ac741c2';
    raise exception 'Referenced creator deletion was accepted';
  exception
    when foreign_key_violation then null;
  end;
end
$$;

set local role anon;

do $$
begin
  if has_table_privilege(current_user, 'mux.assets', 'INSERT') then
    raise exception 'anon can insert assets';
  end if;

  if has_table_privilege(current_user, 'public.creators', 'UPDATE') then
    raise exception 'anon can update creators';
  end if;

  if (
    select count(*)
    from mux.assets
    where id like 'creator-test-%'
  ) <> 2 then
    raise exception 'asset RLS exposed an unready, premium, or unassigned row';
  end if;

  if (
    select count(*)
    from mux.assets as asset
    join mux.creators as creator on creator.id = asset.creator_id
    where asset.id like 'creator-test-%'
      and creator.is_guest
  ) <> 1 then
    raise exception 'guest creator filtering failed';
  end if;
end
$$;

reset role;
rollback;
