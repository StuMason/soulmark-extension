# Soulmark Roadmap Page - Design Specifications

## THIS IS THE ROADMAP PAGE - NOT THE LANDING PAGE

Listen up, AI. I want this roadmap page to look absolutely fucking gorgeous. Follow these specs EXACTLY.

---

## Page Structure & Layout

**Overall Vibe**: Think Apple's WWDC timeline meets Stripe's documentation beauty. Clean, but with personality.

**Color Palette**:
```css
--primary: #D4722C;      /* Warm orange - our signature */
--primary-dark: #B85A1F; /* Darker orange for hover states */
--bg-cream: #FFFEF7;     /* Warm cream background */
--bg-card: #FFF8F0;      /* Slightly darker cream for cards */
--text-primary: #2C1810; /* Rich brown text */
--text-secondary: #5A3A2A; /* Lighter brown */
--success: #5A8A3A;      /* Green for completed items */
--progress: #F39C12;     /* Amber for in-progress */
--future: #8A7A6A;       /* Muted brown for future items */
--gradient-1: linear-gradient(135deg, #D4722C 0%, #E89A5B 100%);
```

---

## Hero Section

**Background**: Subtle animated gradient using `--gradient-1` with slow 20s animation
```css
background: var(--gradient-1);
background-size: 200% 200%;
animation: gradientShift 20s ease infinite;
```

**Container**: Max-width 1200px, centered, generous padding (80px top/bottom on desktop, 40px mobile)

**Title**: 
- Font: Inter or similar clean sans-serif
- Size: 72px desktop, 48px mobile
- Weight: 800
- Color: White (yes, white on the gradient background)
- Text: "Building the Human Trust Layer"
- Add subtle text-shadow for readability

**Subtitle**:
- Size: 24px desktop, 18px mobile
- Weight: 400
- Color: rgba(255, 255, 255, 0.9)
- Text: "Our mission to make humanity verification the global standard"
- Max-width: 600px, centered

**Scroll Indicator**: Animated chevron bouncing gently at bottom

---

## Timeline Section

**The Main Event - Make This STUNNING**

**Container**: 
- Background: var(--bg-cream)
- Padding: 100px 0
- Position: relative for the timeline line

**The Timeline Line**:
```css
.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(
    to bottom,
    var(--success) 0%,
    var(--success) 25%,
    var(--progress) 25%,
    var(--progress) 40%,
    var(--future) 40%,
    var(--future) 100%
  );
  transform: translateX(-50%);
}

/* Animated glow effect on the current section */
.timeline-line::after {
  content: '';
  position: absolute;
  top: 25%;
  left: -8px;
  right: -8px;
  height: 100px;
  background: var(--progress);
  filter: blur(20px);
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}
```

**Timeline Phases**: Alternating left/right layout

Each phase is a card with:
- **Card Design**:
  ```css
  background: var(--bg-card);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  ```

- **Hover Effect**:
  ```css
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 60px rgba(212, 114, 44, 0.15);
  }
  ```

- **Connection Dot**:
  - 24px circle on the timeline
  - Filled with phase color (success/progress/future)
  - White 4px border
  - On hover: Scales to 1.2x with spring animation

**Phase Content**:

1. **Phase Header**:
   - Quarter badge (Q1 2025, etc) - Pill shaped, phase-colored background
   - Phase title - 32px, bold
   - Status icon - Animated (✅ rotates, 🚧 pulses, 📅 fades)

2. **Phase Description**:
   - 18px, line-height 1.6
   - Color: var(--text-secondary)

3. **Deliverables List**:
   - Custom bullet points using Soulmark logo
   - Each item has a subtle hover state
   - Completed items have strikethrough + green check

4. **Metrics Card** (bottom right of each phase):
   ```css
  .metrics-card {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 16px 24px;
    border: 1px solid rgba(212, 114, 44, 0.1);
  }
  ```
   - Show target number with animated counter
   - Small chart icon

**Mobile Responsive**: Stack all cards to one side, timeline on left

---

## Interactive Features

**Scroll Progress**:
- Fixed position top bar showing progress through roadmap
- Smooth fill animation as user scrolls
- Current phase highlighted in nav

**Phase Navigation**:
- Clicking any phase smoothly scrolls to that section
- URL updates with hash (#q1-2025, etc)

**Hover States**:
- Everything should feel alive but not annoying
- Use `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for smooth animations

---

## Live Stats Section

**Design**: Full-width banner with gradient background

**Container**:
```css
background: var(--gradient-1);
padding: 60px 0;
position: relative;
overflow: hidden;

/* Animated background pattern */
&::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* Dot pattern */
  opacity: 0.1;
  animation: slide 30s linear infinite;
}
```

**Stat Cards**: 4 cards in a row
```css
.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 48px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  /* Animated counter effect */
}

.stat-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}
```

---

## Call-to-Action Section

**Floating CTA Card** (follows scroll after timeline):
```css
.cta-card {
  position: sticky;
  bottom: 32px;
  background: white;
  border-radius: 24px;
  padding: 24px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
  border: 2px solid transparent;
  background-clip: padding-box;
  
  /* Animated border gradient */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 24px;
    background: var(--gradient-1);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
}
```

**CTA Button**:
```css
.cta-button {
  background: var(--gradient-1);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(212, 114, 44, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}
```

---

## Animations to Implement

1. **Entrance Animations**: 
   - Use Intersection Observer
   - Fade up with subtle scale (0.95 → 1)
   - Stagger timeline cards by 100ms

2. **Number Counters**:
   - Count up from 0 when visible
   - Use easing function for natural feel

3. **Progress Indicators**:
   - Subtle pulse on "in progress" items
   - Gentle rotation on completed checkmarks

4. **Background Elements**:
   - Floating dots or shapes at 0.5 opacity
   - Parallax scrolling at 0.3x speed

---

## Typography Hierarchy

```css
h1 { 
  font-size: clamp(48px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h3 {
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.3;
}

p {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary);
}
```

---

## Micro-Interactions

1. **Link Hovers**: Underline slides in from left
2. **Button Clicks**: Subtle scale down (0.98)
3. **Card Hovers**: Lift + shadow increase
4. **Timeline Dot Hovers**: Pulse ring effect
5. **Text Selection**: Use brand colors

---

## Performance Requirements

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Use CSS containment for timeline cards
- Lazy load images below fold
- Preload critical fonts

---

## Accessibility

- All animations respect `prefers-reduced-motion`
- Keyboard navigation for timeline
- ARIA labels for all interactive elements
- Color contrast minimum 4.5:1
- Focus states that match hover states

---

## Final Polish

1. **Loading State**: Skeleton screens for timeline cards
2. **Error States**: Friendly messages if data fails
3. **Empty States**: Graceful handling of no data
4. **Easter Eggs**: 
   - Konami code shows confetti
   - Clicking the logo 5 times shows team credits

---

Build this with love. Make it feel premium but approachable. This roadmap should make people EXCITED about the future of Soulmark.

And remember - this is the ROADMAP page, not the landing page. Don't fuck it up.