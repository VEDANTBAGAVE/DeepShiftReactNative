/**
 * Run this to create Supabase Auth users for review-day minimal accounts.
 * Usage: node scripts/createAuthUsers.js
 * Requires SUPABASE_SERVICE_KEY env var or paste key below.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qazktinpnflxccvwfehg.supabase.co';
// Paste your service_role key here (Settings → API → service_role)
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_KEY || 'PASTE_SERVICE_ROLE_KEY_HERE';

if (SERVICE_ROLE_KEY === 'PASTE_SERVICE_ROLE_KEY_HERE') {
  console.error(
    'ERROR: Set SUPABASE_SERVICE_KEY env var or paste the key in this script.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const reviewEmails = [
  'manager@deepshift.com',
  'overmen@deepshift.com',
  'forman@deepshift.com',
  'worker1@deepshift.com',
  'worker2@deepshift.com',
];

const PASSWORD = 'Deep@123';

async function main() {
  const { data: appUsers, error: appUsersError } = await supabase
    .from('users')
    .select('id, email')
    .in('email', reviewEmails);

  if (appUsersError) {
    console.error(`FAILED loading public.users: ${appUsersError.message}`);
    process.exit(1);
  }

  const missing = reviewEmails.filter(
    email => !appUsers.some(u => u.email === email),
  );
  if (missing.length > 0) {
    console.error('Missing users in public.users for emails:', missing);
    process.exit(1);
  }

  for (const u of appUsers) {
    // Try to delete existing auth entry first (clean slate)
    await supabase.auth.admin.deleteUser(u.id).catch(() => {});

    const { data, error } = await supabase.auth.admin.createUser({
      user_id: u.id,
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (error) {
      if (String(error.message).includes('already been registered')) {
        const { data: listed, error: listError } =
          await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

        if (listError) {
          console.error(`FAILED  ${u.email}: ${listError.message}`);
          continue;
        }

        const existing = (listed?.users || []).find(
          usr => (usr.email || '').toLowerCase() === u.email.toLowerCase(),
        );

        if (!existing?.id) {
          console.error(`FAILED  ${u.email}: existing user not found by email`);
          continue;
        }

        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existing.id,
          {
            password: PASSWORD,
            email_confirm: true,
          },
        );

        if (updateError) {
          console.error(`FAILED  ${u.email}: ${updateError.message}`);
        } else {
          console.log(`OK      ${u.email} (${existing.id}) [updated]`);
        }
      } else {
        console.error(`FAILED  ${u.email}: ${error.message}`);
      }
    } else {
      console.log(`OK      ${u.email} (${data.user.id})`);
    }
  }
  console.log('\nDone. Try logging in now.');
}

main();
