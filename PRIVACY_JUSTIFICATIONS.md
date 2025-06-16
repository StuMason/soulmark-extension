# Chrome Web Store Privacy Justifications

## Single Purpose Description
This extension adds human verification to social media posts by requiring users to speak words from their content, creating cryptographic proof of human authorship.

## Permission Justifications

### activeTab
**Justification:** Required to inject the Soulmark button into the active tab when users are on supported social media platforms (X.com and LinkedIn). The extension only interacts with the page content to add UI elements and read post text.

### Host Permissions (x.com, twitter.com, linkedin.com)
**Justification:** Needed to inject content scripts that add the Soulmark button to post creation areas, detect existing soulmark codes in posts, and display verification badges. The extension only runs on these specific social media platforms where users create content.

### Storage
**Justification:** Used to store user preferences including selected microphone device, theme preference (light/dark mode), and temporary caching of verification results to reduce API calls. No personal data or post content is permanently stored.

### Remote Code
**Justification:** The extension makes API calls to Supabase Edge Functions for voice transcription using OpenAI Whisper API and to verify soulmark codes. Audio is processed server-side for transcription only and immediately deleted. No user data is retained on servers.

## Data Usage Disclosure

### What data is collected?
- Temporary audio recordings (deleted immediately after transcription)
- Post text snippets (only the selected words for verification)
- Anonymous soulmark codes

### How is data used?
- Audio is transcribed to verify spoken words match post content
- Soulmark codes are generated and stored to enable verification
- No personal information is collected or associated with soulmarks

### Data sharing
- Audio is sent to OpenAI Whisper API for transcription only
- No data is sold or shared with third parties
- All verification data is anonymous

## Privacy Practices Certification
✓ This extension complies with Chrome Web Store Developer Program Policies
✓ No personal data is collected without user consent
✓ Users explicitly trigger voice recording by clicking the Soulmark button
✓ All data handling is transparent and minimal