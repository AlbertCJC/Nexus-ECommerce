# Auth Agent Findings

## Test Results

| Test Case | Status | Severity | Notes |
|-----------|--------|----------|-------|
| Customer Signup | Pass | - | Account created, profile inserted via trigger, email confirmation required |
| Customer Login | Pass | - | Works after email confirmation, session established, redirects to home |
| Customer Logout | Pass | - | Session cleared, redirects to home, protected routes inaccessible |
| Password Reset | Pass* | - | API works, email sent, but rate limited during testing |
| Session Persistence | Pass | - | Refresh token works, session restored on page reload via localStorage |
| Admin Login | Pass | - | Admin credentials work, dashboard accessible on frontend |
| Role Validation | Pass (Frontend) / Fail (Database) | High | Frontend correctly identifies admin via user_profiles; Database RLS policies fail (JWT role claim not 'admin') |
| Authorization Boundaries | Pass (Frontend) / Partial (Database) | High | Frontend route guards work; Database RLS admin policies don't work |
| OAuth Login | Blocked | - | No OAuth providers configured in Supabase (Google, GitHub all false) |

*Password reset tested via API; email delivery not verified due to rate limiting.

## Issues Found

| ID | Severity | Title | Reproduction Steps | Expected | Actual | Fix |
|----|----------|-------|-------------------|----------|--------|-----|
| AUTH-001 | Critical | Admin RLS policies don't work | 1. Login as admin (admin@example.com/admin123)<br>2. Try to INSERT into categories table via API with admin JWT | Admin should be able to write to admin-protected tables | RLS policy rejects write with "new row violates row-level security policy" | The RLS policy checks `auth.jwt() ->> 'role' = 'admin'` but Supabase JWT always has `role: 'authenticated'`. Admin role is only in `user_metadata`. Fix: Use `auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'` or set `app_metadata.role` via custom access token hook |
| AUTH-002 | Medium | Email confirmation required for signup | 1. Sign up new user via API<br>2. Try to login immediately | User should be able to login after signup (or clear indication email confirmation needed) | Login fails with "Email not confirmed" | Consider enabling `mailer_autoconfirm: true` in Supabase for development, or add UI to resend confirmation email |
| AUTH-003 | Low | Password reset rate limited | Request password reset twice in short period | Should allow reasonable reset requests | 429 "email rate limit exceeded" | Configure appropriate rate limits in Supabase Auth settings |
| AUTH-004 | Info | OAuth not configured | Click "Continue with Google/GitHub" in AuthModal | OAuth flow should work | Providers not configured in Supabase Dashboard | Configure OAuth providers in Supabase Dashboard > Authentication > Providers if needed |

## Additional Observations

### Frontend Authorization (Working Correctly)
- `CustomerProtectedRoute` correctly redirects unauthenticated users to home
- `AdminProtectedRoute` correctly redirects non-admin users to `/admin/login`
- `isAdmin` derived from `user_profiles.role` column (populated by trigger)
- Navbar shows user avatar, "My Orders", "Profile" links when authenticated
- Admin users see "Dashboard" link in Navbar and user menu

### Database Schema & Triggers (Working Correctly)
- `handle_new_user()` trigger auto-creates `user_profiles` on signup
- Role defaults to 'customer', can be set via `raw_user_meta_data.role`
- Profile includes first_name, last_name from metadata
- RLS policies for user data isolation work correctly (users only see own data)

### Supabase Configuration
- `persistSession: true` with localStorage - session persists across browser restarts
- `autoRefreshToken: true` - tokens auto-refreshed
- `detectSessionInUrl: true` - handles OAuth redirects
- Email provider enabled, all OAuth providers disabled
- `mailer_autoconfirm: false` - email confirmation required

## Recommendations

1. **Fix Admin RLS Policies (Critical)**: Update all admin RLS policies to check `user_metadata` or `app_metadata` instead of JWT `role` claim. Example:
   ```sql
   -- Current (broken):
   create policy "admin full categories" on categories for all using (auth.jwt() ->> 'role' = 'admin');
   
   -- Fixed options:
   -- Option A: Check user_metadata
   create policy "admin full categories" on categories for all using (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
   
   -- Option B: Use app_metadata (requires custom access token hook)
   create policy "admin full categories" on categories for all using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
   ```

2. **Enable Auto-Confirm for Development**: Set `mailer_autoconfirm: true` in Supabase Auth settings for easier testing.

3. **Configure OAuth Providers**: If Google/GitHub login is required, configure in Supabase Dashboard > Authentication > Providers.

4. **Add Resend Confirmation Email**: Add "Resend confirmation email" button in AuthModal for unconfirmed users.

5. **Rate Limit Configuration**: Adjust password reset rate limits in Supabase Auth settings for production.