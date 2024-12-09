alter table "public"."repls" drop constraint "repls_user_id_fkey";

create table "public"."public_profiles" (
    "id" uuid not null,
    "avatar_url" text,
    "user_name" text
);


alter table "public"."public_profiles" enable row level security;

CREATE UNIQUE INDEX profiles_pkey ON public.public_profiles USING btree (id);

alter table "public"."public_profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."public_profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."public_profiles" validate constraint "profiles_id_fkey";

alter table "public"."repls" add constraint "repls_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."repls" validate constraint "repls_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
  insert into public.public_profiles (id, avatar_url, user_name)
  values (new.id, new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'user_name');
  return new;
end;$function$
;

grant delete on table "public"."public_profiles" to "anon";

grant insert on table "public"."public_profiles" to "anon";

grant references on table "public"."public_profiles" to "anon";

grant select on table "public"."public_profiles" to "anon";

grant trigger on table "public"."public_profiles" to "anon";

grant truncate on table "public"."public_profiles" to "anon";

grant update on table "public"."public_profiles" to "anon";

grant delete on table "public"."public_profiles" to "authenticated";

grant insert on table "public"."public_profiles" to "authenticated";

grant references on table "public"."public_profiles" to "authenticated";

grant select on table "public"."public_profiles" to "authenticated";

grant trigger on table "public"."public_profiles" to "authenticated";

grant truncate on table "public"."public_profiles" to "authenticated";

grant update on table "public"."public_profiles" to "authenticated";

grant delete on table "public"."public_profiles" to "service_role";

grant insert on table "public"."public_profiles" to "service_role";

grant references on table "public"."public_profiles" to "service_role";

grant select on table "public"."public_profiles" to "service_role";

grant trigger on table "public"."public_profiles" to "service_role";

grant truncate on table "public"."public_profiles" to "service_role";

grant update on table "public"."public_profiles" to "service_role";

create policy "Enable read access for all users"
on "public"."public_profiles"
as permissive
for select
to public
using (true);



