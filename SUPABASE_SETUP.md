# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `clipboard-easy` (or your choice)
   - Database password: Choose a strong password (save it!)
   - Region: Choose closest to you
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Configure Project Settings

### Enable Data API (REQUIRED)
**This is ESSENTIAL for the app to work!**

1. Go to **Settings** (left sidebar) → **API**
2. Find "Data API" section
3. Make sure it shows "**Enabled**"
   - If disabled, enable it (should be enabled by default)
   - This allows supabase-js to communicate with your database

### Enable Automatic RLS (RECOMMENDED)
**This automatically protects new tables with RLS**

1. Go to **Database** (left sidebar) → **Settings**
2. Scroll down to "Row Level Security"
3. Enable "**Enable RLS for new tables automatically**"
   - This ensures any new table you create will have RLS enabled by default
   - Prevents accidentally exposing data

## Step 3: Run Database Schema

1. Go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

**Verify it worked:**
- Go to **Database** → **Tables**
- You should see two tables: `clips` and `groups`
- Click on each table → "Policies" tab to verify RLS policies are enabled

## Step 4: Create Your User Account

1. Go to **Authentication** (left sidebar) → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - Email: Your email address
   - Password: Choose a password
   - Auto Confirm User: **Check this box** (important!)
4. Click "Create user"

**This is your login for the app!** You'll use this email/password to sign in.

## Step 5: Get Your API Keys

1. Go to **Settings** (left sidebar) → **API**
2. Find these values in the "Project API keys" section:
   - **Project URL**: Starts with `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

## Step 6: Configure Your App

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
   ```

3. Save the file

## Step 7: Run the App

```bash
npm run dev
```

Open http://localhost:3000 and sign in with the email/password you created in Step 4.

## Troubleshooting

### "Invalid API key" error
- Double-check your API keys in `.env.local`
- Make sure there are no extra spaces
- Restart the dev server after changing `.env.local`

### "Row Level Security" error
- Make sure you ran the `supabase-schema.sql` script completely
- Check that RLS policies exist on both tables
- Verify your user was created with "Auto Confirm User" checked

### Can't sign in
- Make sure you created the user with "Auto Confirm User" enabled
- Try resetting the password in Supabase dashboard
- Check the browser console for error messages

### Tables not showing up
- Go back to SQL Editor and re-run the schema
- Check for any error messages in the SQL Editor
- Make sure you're looking at the `public` schema

## Security Notes

### Data API
✅ **Enable Data API**: Required for supabase-js to work. This is safe because:
- All access is controlled by RLS policies
- API keys are public-safe (anon key)
- Database is protected by Row Level Security

### Automatic RLS
✅ **Enable automatic RLS**: Highly recommended because:
- Prevents accidentally creating unprotected tables
- Any new table automatically requires RLS policies
- Fails secure by default

### Row Level Security Policies
The schema includes these policies:
- Users can only see/edit their own clips and groups
- All operations check `auth.uid() = user_id`
- No user can access another user's data

## Next Steps

Once your app is running locally:
1. Test creating clips
2. Try creating groups
3. Test pin/unpin functionality
4. Test trash and restore
5. Test the public device mode (check the box when logging in)

Ready to deploy? See the main README.md for Vercel deployment instructions.
