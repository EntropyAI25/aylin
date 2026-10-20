-- AYLIN: passkey-only admin login. Run once in Supabase → SQL Editor, after schema.sql.
--
-- Also create the login user: Authentication → Users → Add user → Create new user
--   Email:    admin@theaylinlabel.in
--   Password: aylin-9955        (the admin page adds the "aylin-" prefix, so the passkey you type is just 9955)
--   Tick "Auto Confirm User".
-- Then Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
--
-- To change the passkey later: change that user's password to  aylin-<new passkey>.

insert into admins (email) values ('admin@theaylinlabel.in') on conflict do nothing;
