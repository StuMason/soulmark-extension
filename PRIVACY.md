# Privacy Policy for Soulmark

*Last updated: January 6, 2025*

## Overview

Soulmark ("we", "our", or "the extension") is committed to protecting your privacy. This privacy policy explains how our browser extension handles your data when you use our human verification service on social media platforms.

## What We Collect

### Temporary Data (Immediately Deleted)
- **Voice Recordings**: When you click the Soulmark button and speak, we temporarily capture audio to verify you're human. This audio is immediately deleted after transcription.
- **Selected Text**: We extract 1-3 words from your post for verification purposes only.

### Stored Data
- **Soulmark Codes**: Anonymous verification codes (e.g., SM:a7x9k2p) that prove a human verified the post
- **User Preferences**: Your selected microphone device and theme preference (light/dark mode)
- **Cached Verifications**: Temporary cache of verification results (expires after 5 minutes)

## How We Use Your Data

1. **Voice Verification**: Audio is sent to OpenAI's Whisper API for transcription to verify spoken words match your post
2. **Code Generation**: Create unique soulmark codes for verified posts
3. **Verification Checks**: Allow others to verify soulmark codes are legitimate

## Data Storage & Security

- **Audio**: Never stored - deleted immediately after transcription
- **Post Content**: We only process selected words, never store full posts
- **Personal Information**: We don't collect names, emails, or any identifying information
- **Anonymous Codes**: Soulmark codes cannot be traced back to individuals

## Third-Party Services

We use the following services:
- **Supabase**: Hosts our verification API and database
- **OpenAI Whisper**: Transcribes audio to text (audio is not retained by OpenAI)

## Your Rights

- **No Account Required**: Use Soulmark completely anonymously
- **No Tracking**: We don't track your browsing or collect analytics
- **Local Control**: Disable the extension at any time through your browser

## Data Sharing

We **never**:
- Sell your data
- Share data with advertisers
- Track you across websites
- Store voice recordings
- Associate soulmarks with personal identities

## Children's Privacy

Soulmark is not intended for users under 13 years of age. We do not knowingly collect data from children.

## Changes to This Policy

We may update this privacy policy from time to time. We will notify users of any material changes by updating the "Last updated" date.

## Contact

For privacy concerns or questions, please open an issue on our GitHub repository or contact us at [soulmark@arctether.com].

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)

By using Soulmark, you agree to this privacy policy.