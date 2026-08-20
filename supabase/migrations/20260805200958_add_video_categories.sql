alter table "mux"."assets"
  add column "category" text default 'Sermons & Teachings';

update "mux"."assets" as "asset"
set "category" = case
  when exists (
    select 1
    from "public"."creators" as "creator"
    where "creator"."id" = "asset"."creator_id"
      and "creator"."is_guest"
  ) then 'Guest Creators'
  when "asset"."aspect_ratio" = '9:16' then 'Shorts'
  else 'Sermons & Teachings'
end;

alter table "mux"."assets"
  add constraint "assets_category_check"
  check (
    "category" in (
      'Sermons & Teachings',
      'Wellness & Health',
      'Music & Worship',
      'Courses & Bible Study',
      'Shorts',
      'Guest Creators'
    )
  );

alter table "mux"."assets"
  alter column "category" set not null;
