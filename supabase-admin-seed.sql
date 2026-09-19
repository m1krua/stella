-- Run manually in Supabase SQL Editor after the client account is created through /register.
-- Never put a real email or password in source control.
update public.profiles
set role = 'admin', updated_at = now()
where email = 'CLIENT_ADMIN_EMAIL@example.com';

-- Verify the result before signing in:
select id, email, role from public.profiles
where email = 'CLIENT_ADMIN_EMAIL@example.com';
