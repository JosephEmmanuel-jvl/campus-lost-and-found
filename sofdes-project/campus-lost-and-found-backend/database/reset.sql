-- DESTRUCTIVE: only database/reset-destructive.js may execute this file.
DROP TABLE IF EXISTS public.notification CASCADE;
DROP TABLE IF EXISTS public.claim_request CASCADE;
DROP TABLE IF EXISTS public.found_item_report CASCADE;
DROP TABLE IF EXISTS public.lost_item_report CASCADE;
DROP TABLE IF EXISTS public."user" CASCADE;
