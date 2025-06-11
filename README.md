# 🔴 Soulmark Chrome Extension

> **The internet's trust layer**: Prove you're human by speaking words from your posts. Easy for humans, not worth it for bots.

## 🚀 What We're Building

Soulmark is solving one of the internet's biggest problems: **how do we know if content is created by humans?** 

In an age of AI-generated content and bot farms, we need a simple way to verify humanity. Soulmark does this elegantly:
1. Write your post
2. Click "Soulmark" 
3. Speak 3 words from your text
4. Get a verification code like `[SM:a7x9k2p]`
5. Others see a badge: "✓ Soulmarked 2h ago"

**No blockchain. No complexity. Just human voices creating trust.**

## 🎯 Current Status (January 2025)

We've built a fully functional MVP in just a few days! Here's what's working:

### ✅ What's Live Right Now:
- **Smart Button Injection** - Seamlessly adds "Soulmark" next to X.com's Post button
- **Voice Capture** - Beautiful popup UI with press-and-hold recording
- **AI Verification** - OpenAI Whisper transcribes and verifies your speech
- **Real-time Badges** - Scans timeline and shows verification on soulmarked posts
- **Microphone Settings** - Test different mics, see live audio visualization
- **Smart Caching** - Prevents API spam while keeping verifications snappy

### 🎯 Everything Works:
- Auto-insertion of soulmark codes into tweets ✅
- Visual replacement of codes with elegant `◉` symbols ✅
- The world's first soulmark `[SM:i0kqol0]` is live! 🎉

## 💻 Installation (Development)

```bash
# Clone the repo
git clone [repo-url]
cd soulmark-extension

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode" 
3. Click "Load unpacked"
4. Select the soulmark-extension folder
5. You'll see the Soulmark icon in your toolbar!
```

## 🎤 First Run Setup

1. **Allow Microphone Access**
   - Click the Soulmark button
   - Chrome will ask for mic permission - click Allow
   - If you miss it, go to Settings (right-click extension → Options)

2. **Test Your Setup**
   - Go to X.com
   - Type a test post: "Building something amazing with Soulmark today!"
   - Click the orange "Soulmark" button
   - Speak the 3 highlighted words
   - Watch the magic happen! 🪄
   - Your tweet gets a `[SM:xxxxx]` code that transforms into `◉`

## 🐛 Debugging Guide

### Check the Consoles:
- **Popup Console**: Right-click popup → Inspect
- **Background Console**: chrome://extensions/ → click "Service Worker"
- **Content Script**: F12 on X.com, look for `[Soulmark]` logs

### Common Issues:
- **"Extension context invalidated"** → Refresh X.com after reloading extension
- **Mic not working** → Settings page → Test Microphone → Allow permissions
- **Button not appearing** → Check console for DOM selector issues

## 🏗️ Architecture

```
User writes tweet → Clicks Soulmark → Speaks words → AI verifies → Code added to tweet
                                           ↓
                                    Supabase Edge Function
                                           ↓
                                     OpenAI Whisper API
```

### Tech Stack:
- **Frontend**: Chrome Extension (Manifest V3)
- **Backend**: Supabase Edge Functions
- **AI**: OpenAI Whisper for speech recognition
- **Database**: Supabase (PostgreSQL)
- **Design**: Warm, handwritten aesthetic (#D4722C on #FFFEF7)

## 🌟 Why This is Exciting

1. **Solving a Real Problem**: Bot detection that actually works
2. **Beautiful UX**: No wallets, no keys, no friction - just speak
3. **Privacy First**: Works anonymously, no tracking
4. **Scalable**: Edge functions can handle millions of verifications
5. **Extensible**: Could work on any platform, any language

### Future Possibilities:
- Browser extension for all social platforms
- Mobile apps with native voice capture
- API for third-party integration
- Soulmark-only comment sections
- Trust scores based on verification history
- Language-agnostic verification

## 🤝 Contributing

This is an active experiment in building human trust infrastructure. Ideas welcome!

### Current Priorities:
1. Fix auto-insertion of codes into tweets
2. Add LinkedIn support
3. Build a website to explain the concept
4. Create API for developers
5. Design trust visualization systems

## 📝 API Documentation

### Create Soulmark
```
POST /functions/v1/verify-voice
Body: FormData with audio blob, words array, message hash
Returns: { success: true, code: "SM:xxxxxxx", transcription: "..." }
```

### Verify Soulmark
```
GET /functions/v1/check-soulmark?code=SM:xxxxxxx
Returns: { valid: true, age: "2h ago", wordCount: 3, ... }
```

## 🎨 Design Philosophy

Soulmark should feel **human**:
- Warm colors that feel like sunset
- Organic shapes, nothing too perfect
- Delightful interactions that make you smile
- Voice as the most human interface

## 🚦 Project Status

**IT'S ALIVE!** Everything works:
- ✅ Voice capture and verification with Whisper AI
- ✅ Real-time badge display on verified posts
- ✅ Supabase integration for storage and verification
- ✅ Automatic code insertion into tweets
- ✅ Elegant visual replacement (`[SM:xxxxx]` → `◉`)
- ✅ Click for detailed verification info
- ✅ Settings page with mic selection and testing

This could be the beginning of something big. A simple idea executed well: **proving humanity through voice, one soulmark at a time**.

## 🎉 The First Soulmark

On January 9, 2025, the first ever soulmark was created: `[SM:i0kqol0]`

This marks the beginning of a more human internet.

---

*Built with excitement about creating a more human internet* 🧡