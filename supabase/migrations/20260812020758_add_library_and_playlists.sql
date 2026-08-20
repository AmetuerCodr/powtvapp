create table "public"."saved_videos" (
  "user_id" uuid not null
    references "auth"."users" ("id") on delete cascade,
  "asset_id" text not null
    references "mux"."assets" ("id") on delete cascade,
  "created_at" timestamp with time zone not null default now(),
  primary key ("user_id", "asset_id")
);

alter table "public"."saved_videos" enable row level security;

revoke all privileges on table "public"."saved_videos"
  from "anon", "authenticated";
grant select, insert, delete on table "public"."saved_videos"
  to "authenticated";
grant all privileges on table "public"."saved_videos"
  to "service_role";

create policy "Users can read their saved videos"
  on "public"."saved_videos"
  for select
  to "authenticated"
  using ((select auth.uid()) = "user_id");

create policy "Users can save videos"
  on "public"."saved_videos"
  for insert
  to "authenticated"
  with check ((select auth.uid()) = "user_id");

create policy "Users can remove their saved videos"
  on "public"."saved_videos"
  for delete
  to "authenticated"
  using ((select auth.uid()) = "user_id");

create table "mux"."playlists" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text not null default '',
  "is_series" boolean not null default false,
  "created_at" timestamp with time zone not null default now()
);

create table "mux"."playlist_items" (
  "playlist_id" uuid not null,
  "asset_id" text not null,
  "position" integer not null check ("position" > 0),
  primary key ("playlist_id", "asset_id"),
  unique ("playlist_id", "position"),
  constraint "playlist_items_playlist_id_fkey"
    foreign key ("playlist_id")
    references "mux"."playlists" ("id") on delete cascade,
  constraint "playlist_items_asset_id_fkey"
    foreign key ("asset_id")
    references "mux"."assets" ("id") on delete cascade
);

alter table "mux"."playlists" enable row level security;
alter table "mux"."playlist_items" enable row level security;

revoke all privileges on table "mux"."playlists", "mux"."playlist_items"
  from "anon", "authenticated";
grant select on table "mux"."playlists", "mux"."playlist_items"
  to "anon", "authenticated";
grant all privileges on table "mux"."playlists", "mux"."playlist_items"
  to "service_role";

create policy "Public can read playlists"
  on "mux"."playlists"
  for select
  to "anon", "authenticated"
  using (true);

create policy "Public can read playlist items"
  on "mux"."playlist_items"
  for select
  to "anon", "authenticated"
  using (
    exists (
      select 1
      from "mux"."assets" as "asset"
      where "asset"."id" = "asset_id"
        and "asset"."status" = 'ready'
        and "asset"."is_premium" is false
        and "asset"."creator_id" is not null
    )
  );

insert into "mux"."playlists" (
  "id",
  "name",
  "description",
  "is_series"
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Sermons for the Journey',
    'Messages for practical faith and everyday growth.',
    false
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Faith Foundations',
    'A guided series for building a stronger spiritual foundation.',
    true
  )
on conflict ("id") do update
set
  "name" = excluded."name",
  "description" = excluded."description",
  "is_series" = excluded."is_series";

insert into "mux"."playlist_items" (
  "playlist_id",
  "asset_id",
  "position"
)
select
  "seed"."playlist_id",
  "seed"."asset_id",
  "seed"."position"
from (
  values
    (
      '10000000-0000-4000-8000-000000000001'::uuid,
      'c8Qq2O4TnqmOhEzILgQunfk1XDWPkln2yp6Lt6t7W00w'::text,
      1
    ),
    (
      '10000000-0000-4000-8000-000000000001'::uuid,
      'BVeajo8ryIqyv3bkrDYTE7Euk6veoUlET6NRXWhWRng'::text,
      2
    ),
    (
      '10000000-0000-4000-8000-000000000001'::uuid,
      'cy5Vzf8WjQZBZVF3ZfLSpYcSGFs6G84GOX8d1PMGtEo'::text,
      3
    ),
    (
      '10000000-0000-4000-8000-000000000002'::uuid,
      'EDmcYG25Fcx00ccIc1luaUnGioUr8r7Z1WsqGBV2tOAg'::text,
      1
    ),
    (
      '10000000-0000-4000-8000-000000000002'::uuid,
      'HN7q9WPy00wY6lgtVILbwlQ00oSa7aOJgPMbiWh02TWhkw'::text,
      2
    ),
    (
      '10000000-0000-4000-8000-000000000002'::uuid,
      'IhE2sBMPdIFTqVGSb00TYLzFtRuSQ9WOqC013yAxFen00w'::text,
      3
    )
) as "seed" ("playlist_id", "asset_id", "position")
join "mux"."assets" as "asset"
  on "asset"."id" = "seed"."asset_id"
on conflict ("playlist_id", "asset_id") do update
set "position" = excluded."position";
