# Quick Test Setup Guide

## ⚠️ Tests Are Currently Skipped

Your E2E tests are **skipped** because test credentials are not configured. This is normal!

## 🚀 Enable Tests in 2 Minutes

### Step 1: Create Test User in Supabase (1 min)

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **Authentication** (left sidebar)
3. Click **Users** tab
4. Click **Add user** → **Create new user**
5. Fill in:
   ```
   Email: test@example.com
   Password: testpassword
   ☑ Auto Confirm User (IMPORTANT!)
   ```
6. Click **Create user**

### Step 2: Configure Test Credentials (30 seconds)

Create a file named `.env.test` in your project root:

```bash
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword
```

**That's it!** ✅

### Step 3: Run Tests

```bash
npm run test:e2e
```

You should now see:
```
Running 4 tests using 2 workers

  ✓ Authentication › should redirect unauthenticated users
  ✓ Authentication › should allow login with valid credentials
  ✓ Clip Management › should create a new clip
  ✓ Clip Management › should delete and restore clip

  4 passed (14s)
```

---

## 📝 Quick Reference

### File Structure
```
clipboard_easy/
├── .env.local           # Your Supabase credentials (existing)
├── .env.test            # Test user credentials (CREATE THIS)
└── .env.test.example    # Template (already exists)
```

### .env.test Content
```bash
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword
```

### Troubleshooting

**Problem**: Tests still skipped
- ✅ Check `.env.test` exists in project root
- ✅ Verify credentials match user in Supabase
- ✅ Ensure "Auto Confirm User" was checked when creating user

**Problem**: "Invalid login credentials" error
- ✅ Double-check email and password in Supabase dashboard
- ✅ Make sure user is confirmed (green checkmark in Users list)

**Problem**: Tests timeout
- ✅ Ensure dev server is running (`npm run dev`)
- ✅ Check Supabase credentials in `.env.local`

---

## 🎯 What Gets Tested

- ✅ Unauthenticated users redirected to login
- ✅ Login with valid credentials
- ✅ Create new clip (with optimistic updates)
- ✅ Delete clip (soft delete)
- ✅ Trash functionality
- ✅ Mobile and desktop responsive layouts

---

## 🔐 Security Note

**`.env.test` is gitignored** - your test credentials are safe and won't be committed!

---

Need more details? See [TESTING.md](TESTING.md) for the complete guide.
