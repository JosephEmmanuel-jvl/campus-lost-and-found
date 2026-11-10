-- Apply manually to an existing Supabase database after verifying that the
-- backend's DB_USER owns these tables or has BYPASSRLS. Do not run at startup.
-- No rows, passwords, or database roles are changed.
BEGIN;

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_item_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_item_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."user", public.lost_item_report,
    public.found_item_report, public.claim_request, public.notification
    FROM anon, authenticated;

COMMIT;
