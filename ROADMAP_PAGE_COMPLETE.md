# Soulmark Roadmap Page - Complete Specs for Your AI

## This is for a STANDALONE /roadmap page - NOT part of the landing page

Give this entire document to your AI. It has both the content AND the design specs for a beautiful roadmap page.

---

# CONTENT TO DISPLAY

## Hero Section

**Title**: "Building the Human Trust Layer"

**Subtitle**: "Our mission to make humanity verification the global standard"

**Intro Paragraph**: 
"Soulmark started with a simple observation: the internet is drowning in AI-generated content. By 2025, experts predict 90% of online content will be artificial. We're building the antidote - a simple, elegant way to prove you're human that takes seconds for humans but isn't worth it for bots to fake at scale."

---

## Timeline Section

### Phase 1: Foundation ✅ 
**Q1 2025 - COMPLETED**

**Tagline**: "Proving the concept"

**Description**: "We launched with a focused mission: create seamless human verification for the platforms where trust matters most."

**Delivered**:
- ✅ Chrome extension for X (Twitter)
- ✅ Voice verification in 3 seconds
- ✅ AI text detection integration
- ✅ Anonymous verification option
- ✅ 10,000+ verified humans

**Metrics**: 
- Daily verifications: 15,000+
- Success rate: 94%
- User satisfaction: 4.8/5

---

### Phase 2: Expansion 🚧
**Q2-Q3 2025 - IN PROGRESS**

**Tagline**: "Scaling across platforms"

**Description**: "Taking Soulmark wherever humans need to prove they're real. Mobile-first, platform-agnostic, always human."

**Delivering**:
- 🚧 LinkedIn integration (DONE)
- 📱 iOS & Android apps
- 💬 Reddit integration
- 🎮 Discord bot
- 🔐 Voice fingerprinting v1

**Target Metrics**:
- Daily verifications: 100,000
- Platforms supported: 6
- API developers: 100+

---

### Phase 3: Platform 📅
**Q4 2025 - Q1 2026**

**Tagline**: "Becoming the standard"

**Description**: "Transform from a browser extension to the infrastructure layer for human verification across the internet."

**Planned**:
- 🔧 Developer API & SDKs
- 🔌 WordPress plugin
- 💼 Business verification suite
- 🏢 Enterprise partnerships
- 📊 Trust scoring system

**Target Metrics**:
- Daily verifications: 1M
- API calls/month: 10M
- Enterprise clients: 50

---

### Phase 4: Intelligence 🔮
**2026 and Beyond**

**Tagline**: "Staying ahead of AI"

**Description**: "As AI gets smarter, so do we. Multi-modal verification that adapts faster than bots can evolve."

**Vision**:
- 🧠 Behavioral biometrics
- 👁️ Liveness detection
- 🌐 Decentralized verification
- 🤝 Web of trust network
- 🛡️ Zero-knowledge proofs

**Target Metrics**:
- Daily verifications: 10M+
- Global standard achieved
- Trust network: 100M users

---

## Live Progress Section

**Current Status**: Phase 2 - 35% Complete

**Real-Time Stats**:
- Humans Verified Today: 15,847
- Total Verifications: 1,238,429
- Platforms Active: 2
- Countries Reached: 47

---

## Get Involved Section

**For Users**:
"Add Soulmark to Chrome and start verifying your humanity today. It's free, takes 3 seconds, and helps fight the bot invasion."

**CTA Button**: "Add to Chrome - It's Free"

**For Developers**:
"Early access to our API is opening Q3 2025. Join the waitlist to add human verification to your platform."

**CTA Button**: "Join API Waitlist"

**For Investors**:
"We're building critical infrastructure for the AI age. Let's talk about the future of human verification."

**CTA Link**: "Contact us"

---

# DESIGN SPECIFICATIONS

## DO NOT SKIP THIS SECTION - THIS IS HOW IT SHOULD LOOK

### Overall Design Language

**Style**: Premium but approachable. Think Stripe's clarity meets Linear's beauty with a human touch.

**Colors** (USE THESE EXACT VALUES):
```css
:root {
  --orange-primary: #D4722C;
  --orange-dark: #B85A1F;
  --cream-bg: #FFFEF7;
  --cream-card: #FFF8F0;
  --brown-text: #2C1810;
  --brown-light: #5A3A2A;
  --green-success: #5A8A3A;
  --amber-progress: #F39C12;
  --brown-future: #8A7A6A;
  --gradient-hero: linear-gradient(135deg, #D4722C 0%, #E89A5B 100%);
}
```

### Hero Section Design

**Container**:
- Full width gradient background using `--gradient-hero`
- Animate the gradient slowly (20s infinite)
- Height: 50vh minimum
- Center all content

**Typography**:
- Title: 72px (mobile: 48px), font-weight: 800, color: white
- Subtitle: 24px (mobile: 18px), font-weight: 400, color: rgba(255,255,255,0.9)
- Body: 20px (mobile: 16px), max-width: 800px, color: rgba(255,255,255,0.8)

**Animation**:
- Fade in title, then subtitle, then paragraph (stagger by 200ms)
- Add floating dots in background at 0.1 opacity

### Timeline Design (THIS IS CRITICAL)

**The Timeline Line**:
- Vertical line in center (desktop) or left side (mobile)
- 4px wide
- Gradient showing progress:
  - Green (completed): 0-25%
  - Amber (current): 25-40%
  - Gray (future): 40-100%
- Add pulsing glow on current section

**Phase Cards**:
```css
.phase-card {
  background: var(--cream-card);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.phase-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(212, 114, 44, 0.12);
}
```

**Phase Headers**:
- Quarter badge: Pill shape, 14px text, colored background (green/amber/gray)
- Title: 36px, font-weight: 700
- Status emoji: Animated (✅ spins, 🚧 pulses, 📅 fades)

**Connection Dots**:
- 24px circles on the timeline
- Filled with phase color
- 4px white border
- Scale to 1.3x on hover with spring animation

**Deliverables**:
- Custom bullet using mini Soulmark logo
- 16px text
- Completed items: line-through + green check
- Hover: slight indent + color change

**Metrics Box**:
- Glassmorphism style:
```css
.metrics-box {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 114, 44, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
}
```

### Live Progress Section

**Progress Bar**:
```css
.progress-bar {
  height: 80px;
  background: var(--cream-card);
  border-radius: 40px;
  padding: 8px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-hero);
  border-radius: 36px;
  width: 35%; /* Current progress */
  position: relative;
  
  /* Animated shine effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shine 3s infinite;
  }
}
```

**Stats Grid**:
- 4 cards in 2x2 grid (mobile: stack)
- Each card has:
  - Large number (48px, animated counter)
  - Label (14px, uppercase, letter-spacing: 1px)
  - Subtle icon
  - Hover: slight scale + shadow

### CTA Section

**Design**:
```css
.cta-section {
  background: white;
  border-radius: 32px;
  padding: 64px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Animated border gradient */
.cta-section::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-hero);
  border-radius: 32px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-section:hover::before {
  opacity: 1;
}

.cta-button {
  background: var(--gradient-hero);
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(212, 114, 44, 0.3);
}
```

### Animations You MUST Include

1. **Scroll-triggered animations**:
   - Use Intersection Observer
   - Fade up + scale (0.95 → 1)
   - Stagger by 100ms for multiple elements

2. **Number counters**:
   - Animate from 0 when visible
   - Duration: 2s with easeOutExpo

3. **Timeline glow**:
   ```css
   @keyframes glow {
     0%, 100% { opacity: 0.3; }
     50% { opacity: 0.6; }
   }
   ```

4. **Hover springs**:
   - Use cubic-bezier(0.34, 1.56, 0.64, 1)
   - Don't overdo it - subtle is better

### Mobile Responsive

**Breakpoint**: 768px

**Changes**:
- Timeline moves to left side
- All cards stack vertically
- Reduce all font sizes by 25%
- Increase tap targets to 44px minimum
- Remove hover effects, add touch feedback

### Performance

- Lazy load everything below fold
- Use CSS contain on cards
- Preload Inter font
- Target 90+ Lighthouse score

### Accessibility

- Focus states match hover states
- Skip links for navigation
- ARIA labels on all buttons
- Respect prefers-reduced-motion
- 4.5:1 color contrast minimum

---

## FINAL INSTRUCTIONS

1. Build this page at `/roadmap`
2. Make it responsive
3. Add all animations specified
4. Test on mobile
5. Use semantic HTML
6. Follow the design EXACTLY

This roadmap page should make people think "Holy shit, these folks are serious about building the future of human verification."

Now go build something beautiful.