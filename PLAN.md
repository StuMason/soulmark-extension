# THE FUCKING PLAN 🚀

## Tomorrow: Auth Sprint (Jan 10, 2025)

### Morning: Auth Foundation (9am-12pm)

**1. Supabase Auth Setup**
- [ ] Enable email auth with magic links
- [ ] Add Google OAuth 
- [ ] Add GitHub OAuth (developers love this shit)
- [ ] Create `profiles` table linked to auth.users
- [ ] Store: display_name, avatar_url, soulmark_count, created_at

**2. Update Extension**
- [ ] Add "Sign In" button to popup when not authenticated
- [ ] Store auth token in chrome.storage.local
- [ ] Pass user_id with all soulmark verifications
- [ ] Show user avatar/name when logged in

### Afternoon: Make It Sexy (1pm-5pm)

**3. Auth Flow**
- [ ] Click "Sign In" → Opens soulmark.com/auth in new tab
- [ ] Implement magic link flow (no passwords!)
- [ ] Social login buttons (Google/GitHub)
- [ ] Redirect back with success message
- [ ] Extension auto-detects auth and updates UI

**4. Profile Features**
- [ ] Show user's soulmark count in popup
- [ ] "Your verified humanity score: 23 soulmarks"
- [ ] Little streak counter for daily soulmarks
- [ ] "Share your profile" link

### Evening: Prep for Money (6pm-9pm)

**5. Database Schema**
```sql
-- Run this shit in Supabase SQL editor

-- User profiles
CREATE TABLE profiles (
  id uuid references auth.users primary key,
  display_name text,
  avatar_url text,
  soulmark_count integer default 0,
  subscription_tier text default 'free',
  subscription_expires timestamp,
  created_at timestamp default now()
);

-- Update existing soulmarks table
ALTER TABLE soulmarks 
ADD COLUMN user_id uuid references auth.users;

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soulmarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
```

**6. Quick Dashboard**
- [ ] Create soulmark.com/dashboard
- [ ] Dead simple: list of user's soulmarks
- [ ] Show date, platform, word count
- [ ] Tease premium features (grayed out)
- [ ] "Upgrade to Pro" button (not connected yet)

## The User Journey:
1. Install extension → Works immediately (anonymous)
2. After 3 soulmarks → "Sign in to save your verifications"
3. Magic link → Smooth as fuck
4. Now tracking everything → Building value
5. Hit 10 soulmarks → "You're on fire! Upgrade for unlimited"

## Week 2: Money Time 💰

### Monday: Stripe Integration
- [ ] Connect Stripe to Supabase
- [ ] Create products: Pro ($5), Creator ($15)
- [ ] Webhook for subscription updates

### Tuesday: Payment Flow
- [ ] "Upgrade" button in extension
- [ ] Pricing page on website
- [ ] Handle subscription states

### Wednesday: LinkedIn Launch
- [ ] Add LinkedIn content script
- [ ] Find post/comment selectors
- [ ] Test voice verification

### Thursday: Premium Features
- [ ] Unlimited soulmarks for paid users
- [ ] Profile badges
- [ ] Analytics dashboard

### Friday: Marketing Prep
- [ ] ProductHunt assets
- [ ] Twitter launch thread
- [ ] Demo video

## Week 3: Scale 📈

- [ ] API for developers ($$$)
- [ ] Enterprise features
- [ ] Bulk verification tools
- [ ] Platform partnerships

## The Vision:
**Month 1**: 1,000 users, 100 paying
**Month 3**: 10,000 users, 1,000 paying, 2 enterprise
**Month 6**: 100k users, 5k paying, 10 enterprise
**Year 1**: The default human verification for the internet

## Revenue Projections:
- Individual subscriptions: $25k MRR
- Enterprise deals: $50k MRR  
- API access: $25k MRR
- **Total**: $100k MRR by month 6 = $1.2M ARR

## Remember:
- We're not building a feature, we're building a trust layer
- Every soulmark makes the network more valuable
- The goal isn't users, it's verifications per day
- LinkedIn professionals will pay for trust

Let's fucking go! 🔥🔥🔥