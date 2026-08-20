alter table "public"."creators"
  add column "description" text,
  add column "is_guest" boolean not null default false;

insert into "public"."creators" (
  "id",
  "name",
  "avatar_url",
  "description",
  "is_guest"
)
values
  (
    '3740949a-f6bb-4697-b5e6-ac511ac741c2',
    'Bishop Shammah Womack-El',
    'https://powprayerclinic.netlify.app/images/bishop.jpg',
    'Bishop and spiritual leader of Temple of Radiant Light.',
    false
  ),
  (
    '094e3e51-d5e2-5fba-bd6d-58b3dd29eb5f',
    'Temple of Radiant Light',
    'https://templeofradiantlight.org/wp-content/uploads/2024/02/trl-logo-2.png',
    'A family church in Bloomfield, New Jersey, devoted to sharing Christ''s love and serving the community.',
    false
  )
on conflict ("id") do update
set
  "name" = excluded."name",
  "avatar_url" = excluded."avatar_url",
  "description" = excluded."description",
  "is_guest" = excluded."is_guest";

alter table "public"."creators"
  alter column "name" set not null;

alter table "mux"."assets"
  add column "creator_id" uuid;

alter table "mux"."assets"
  add constraint "assets_creator_id_fkey"
  foreign key ("creator_id")
  references "public"."creators" ("id")
  on delete restrict;

create index "assets_creator_id_idx"
  on "mux"."assets" ("creator_id");

create view "mux"."creators"
with (security_invoker = true)
as
select
  "id",
  "name",
  "avatar_url",
  "description",
  "is_guest"
from "public"."creators";

revoke all privileges on table "mux"."creators"
  from "anon", "authenticated";

grant select on table "mux"."creators"
  to "anon", "authenticated", "service_role";

update "mux"."assets"
set "creator_id" = '3740949a-f6bb-4697-b5e6-ac511ac741c2'
where "id" in (
  'Nm01iN28Xsy2ff02laZs00JZZ9aiAZzO6026s847CmmH4rM',
  'usrETAHRIWa7hBjHMWQpFZ1fztv3gFzdII1Edvao02Kk',
  '66W1LBvNVxQeBnkbaHEHGbwNUWUZu01gBNK7pwzH7NbA',
  'ajOnGAx1pPUuGm6MVFuEaodvBJGyf02tZzJZa7vdW4T4',
  'IhE2sBMPdIFTqVGSb00TYLzFtRuSQ9WOqC013yAxFen00w',
  'HN7q9WPy00wY6lgtVILbwlQ00oSa7aOJgPMbiWh02TWhkw',
  'EDmcYG25Fcx00ccIc1luaUnGioUr8r7Z1WsqGBV2tOAg',
  'BVeajo8ryIqyv3bkrDYTE7Euk6veoUlET6NRXWhWRng',
  'cy5Vzf8WjQZBZVF3ZfLSpYcSGFs6G84GOX8d1PMGtEo',
  'c8Qq2O4TnqmOhEzILgQunfk1XDWPkln2yp6Lt6t7W00w'
);

drop policy if exists "Enable read access for all users"
  on "public"."creators";

revoke all privileges on table "public"."creators"
  from "anon", "authenticated";

grant select on table "public"."creators"
  to "anon", "authenticated";

create policy "Public can read creators"
  on "public"."creators"
  for select
  to "anon", "authenticated"
  using (true);

drop policy if exists "Allow client read access"
  on "mux"."assets";

drop policy if exists "Public can read all published, non-premium assets"
  on "mux"."assets";

drop policy if exists "Enable insert for authenticated users only"
  on "mux"."assets";

revoke all privileges on table "mux"."assets"
  from "anon", "authenticated";

grant select on table "mux"."assets"
  to "anon", "authenticated";

create policy "Public can read assigned assets"
  on "mux"."assets"
  for select
  to "anon", "authenticated"
  using (
    "status" = 'ready'
    and "is_premium" is false
    and "creator_id" is not null
  );
