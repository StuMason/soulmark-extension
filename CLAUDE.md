# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soulmark is a Chrome extension that combats AI-generated content and bots by requiring humans to speak words from their posts. It's a simple, elegant solution: easy for humans, not worth it for bots to fake at scale.

**The Big Idea**: When you post on X.com, you can "soulmark" it by speaking a few words from your text. This creates a cryptographic proof that a human was behind the post, adding a verification code like `[SM:a7x9k2p]` that others can verify.

## Current Status (January 2025)

We've built a fully functional MVP that:
- ✅ Injects a "Soulmark" button next to X.com's Post button
- ✅ Captures audio using the Web Audio API
- ✅ Sends voice to OpenAI Whisper for transcription via Supabase
- ✅ Verifies the spoken words match the selected words
- ✅ Generates unique soulmark codes stored in Supabase
- ✅ Automatically scans timeline for soulmarks and verifies them
- ✅ Shows visual badges on verified posts
- ✅ Auto-inserts soulmark codes into tweets
- ✅ Replaces `[SM:xxxxx]` codes with elegant `◉` symbols

## Architecture

```
soulmark-extension/
├── manifest.json          # Chrome extension manifest (V3)
├── content-scripts/       
│   └── twitter.js        # Injects UI, handles verification badges
├── popup/                
│   ├── index.html        # Voice recording interface
│   ├── popup.css         # Warm, human aesthetic
│   └── popup.js          # Audio capture, Supabase API calls
├── background/           
│   └── service-worker.js # Message routing, state management
├── options/              
│   ├── index.html        # Settings page
│   ├── options.css       # Settings styles
│   └── options.js        # Mic selection, testing, audio visualization
├── styles/              
│   └── soulmark.css     # Injected styles for X.com
├── config.js            # Supabase credentials (gitignored)
└── supabase/functions/  
    ├── verify-voice/    # Whisper API integration
    └── check-soulmark/  # Verification endpoint

## Key Technical Flows

### Creating a Soulmark
1. User types tweet → clicks "Soulmark" button
2. Content script extracts text, selects 1-3 random meaningful words
3. Popup opens showing selected words
4. User presses & holds to record their voice
5. Audio blob sent to Supabase Edge Function
6. Whisper transcribes → fuzzy matches against expected words
7. On success: unique code generated, stored in DB
8. Code automatically inserted into tweet as `[SM:xxxxxxx]`

### Verifying Soulmarks
1. Content script scans for `[SM:xxxxxxx]` patterns
2. Calls `/check-soulmark` endpoint to verify (strips brackets and prefix)
3. Replaces code with clickable `◉` symbol
4. Shows badge with age ("Soulmarked 2h ago") in tweet actions
5. Click symbol for detailed verification info
6. Caches results for 5 minutes to prevent API spam

### Message Flow
```
Content Script ←→ Background Service Worker ←→ Popup
     ↓                                           ↓
  X.com DOM                              Supabase API
```

## Development Tips

### Testing Changes
1. Save files
2. Go to `chrome://extensions/`
3. Click refresh on Soulmark
4. **Refresh X.com tab** (important!)

### Debugging
- Popup console: Right-click popup → Inspect
- Background console: chrome://extensions/ → Service Worker link
- Content script: F12 on X.com, look for `[Soulmark]` logs

### Common Issues
- "Extension context invalidated" → Refresh X.com after reloading extension
- Mic not working → Check Settings page, test microphone
- Button not appearing → Check console for selector matches

## API Endpoints

### POST /functions/v1/verify-voice
- Receives: audio blob, expected words, message hash
- Returns: `{ success: true, code: "SM:xxxxxxx", transcription: "..." }`

### GET /functions/v1/check-soulmark
- Receives: soulmark code
- Returns: `{ valid: true, age: "2h ago", wordCount: 3, ... }`

## What Makes This Exciting

This is Web3's promise delivered with Web2 UX. No wallets, no gas fees, no complexity. Just speak and verify. We're creating a human trust layer for the internet that's:

- **Friction-right**: Just enough effort to deter bots
- **Privacy-first**: Can be used anonymously
- **Scalable**: Edge functions handle verification
- **Delightful**: Warm, human design that makes you smile

The potential is huge: from combating misinformation to enabling new forms of human-only spaces online. We're building the foundation for a more trustworthy internet, one soulmark at a time.