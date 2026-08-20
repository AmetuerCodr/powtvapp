create extension if not exists "pg_net" with schema "public";


  create table "public"."creators" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "avatar_url" text
      );


alter table "public"."creators" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "username" text,
    "email" character varying,
    "received_welcome_email" boolean default false,
    "address" text
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX creator_pkey ON public.creators USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."creators" add constraint "creator_pkey" PRIMARY KEY using index "creator_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_delete_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.users WHERE id = old.id;
  RETURN old;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_email_verified()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform net.http_post(
    url     := 'https://kxilmdnedqwjoyrfwuyw.supabase.co/functions/v1/welcome-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object(
      'email', new.email,
      'id',    new.id
    )
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

drop trigger if exists "on_auth_user_created" on "auth"."users";

create trigger "on_auth_user_created"
after insert on "auth"."users"
for each row execute function "public"."handle_new_user"();

drop trigger if exists "on_auth_user_deleted" on "auth"."users";

create trigger "on_auth_user_deleted"
after delete on "auth"."users"
for each row execute function "public"."handle_delete_user"();

drop trigger if exists "on_email_verified" on "auth"."users";

create trigger "on_email_verified"
after update of "email_confirmed_at" on "auth"."users"
for each row
when ((old.email_confirmed_at is null) and (new.email_confirmed_at is not null))
execute function "public"."handle_email_verified"();

grant delete on table "public"."creators" to "anon";

grant insert on table "public"."creators" to "anon";

grant references on table "public"."creators" to "anon";

grant select on table "public"."creators" to "anon";

grant trigger on table "public"."creators" to "anon";

grant truncate on table "public"."creators" to "anon";

grant update on table "public"."creators" to "anon";

grant delete on table "public"."creators" to "authenticated";

grant insert on table "public"."creators" to "authenticated";

grant references on table "public"."creators" to "authenticated";

grant select on table "public"."creators" to "authenticated";

grant trigger on table "public"."creators" to "authenticated";

grant truncate on table "public"."creators" to "authenticated";

grant update on table "public"."creators" to "authenticated";

grant delete on table "public"."creators" to "service_role";

grant insert on table "public"."creators" to "service_role";

grant references on table "public"."creators" to "service_role";

grant select on table "public"."creators" to "service_role";

grant trigger on table "public"."creators" to "service_role";

grant truncate on table "public"."creators" to "service_role";

grant update on table "public"."creators" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Enable read access for all users"
  on "public"."creators"
  as permissive
  for select
  to public
using (true);


drop policy "Block client access" on "mux"."assets";

alter table "mux"."assets" add column "is_premium" boolean default false;

grant delete on table "mux"."assets" to "anon";

grant insert on table "mux"."assets" to "anon";

grant update on table "mux"."assets" to "anon";

grant delete on table "mux"."assets" to "authenticated";

grant insert on table "mux"."assets" to "authenticated";

grant update on table "mux"."assets" to "authenticated";

grant delete on table "mux"."live_streams" to "anon";

grant insert on table "mux"."live_streams" to "anon";

grant select on table "mux"."live_streams" to "anon";

grant update on table "mux"."live_streams" to "anon";

grant delete on table "mux"."live_streams" to "authenticated";

grant insert on table "mux"."live_streams" to "authenticated";

grant select on table "mux"."live_streams" to "authenticated";

grant update on table "mux"."live_streams" to "authenticated";

grant delete on table "mux"."webhook_events" to "anon";

grant insert on table "mux"."webhook_events" to "anon";

grant select on table "mux"."webhook_events" to "anon";

grant update on table "mux"."webhook_events" to "anon";

grant delete on table "mux"."webhook_events" to "authenticated";

grant insert on table "mux"."webhook_events" to "authenticated";

grant select on table "mux"."webhook_events" to "authenticated";

grant update on table "mux"."webhook_events" to "authenticated";


  create policy "Enable insert for authenticated users only"
  on "mux"."assets"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Public can read all published, non-premium assets"
  on "mux"."assets"
  as permissive
  for select
  to authenticated
using (((status = 'ready'::text) AND (is_premium = false)));
