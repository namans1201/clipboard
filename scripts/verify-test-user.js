// Test Supabase connection and verify test user
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.test' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

console.log('\n=== Supabase Connection Test ===\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

if (!testEmail || !testPassword) {
  console.error('❌ Missing test credentials in .env.test');
  console.error('   TEST_EMAIL:', testEmail ? '✓' : '✗');
  console.error('   TEST_PASSWORD:', testPassword ? '✓' : '✗');
  process.exit(1);
}

console.log('✓ Environment variables loaded');
console.log(`  Supabase URL: ${supabaseUrl}`);
console.log(`  Test Email: ${testEmail}`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing login with test credentials...\n');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('');
      console.error('Possible causes:');
      console.error('1. Test user doesn\'t exist in Supabase');
      console.error('2. Wrong email or password in .env.test');
      console.error('3. User email not confirmed');
      console.error('');
      console.error('To fix:');
      console.error('1. Go to Supabase Dashboard → Authentication → Users');
      console.error('2. Check if user exists with email:', testEmail);
      console.error('3. If not, create user with:');
      console.error(`   - Email: ${testEmail}`);
      console.error(`   - Password: ${testPassword}`);
      console.error('   - ✓ Auto Confirm User');
      console.error('4. If user exists, verify the password matches .env.test');
      process.exit(1);
    }

    console.log('✅ Login successful!');
    console.log('');
    console.log('User details:');
    console.log(`  ID: ${data.user.id}`);
    console.log(`  Email: ${data.user.email}`);
    console.log(`  Confirmed: ${data.user.email_confirmed_at ? '✓' : '✗'}`);
    console.log('');
    console.log('🎉 Your test credentials are working!');
    console.log('   You can now run: npm run test:e2e');
    
    // Sign out
    await supabase.auth.signOut();
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();
