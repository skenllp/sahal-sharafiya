# Sahal & Sharafiya – Nikkah Invitation

Static site (HTML + CSS + vanilla JS). No build step. Deploy the folder as-is to Vercel or Netlify.

## Before sharing the link

1. **Set the domain** (WhatsApp/Open Graph previews need absolute URLs).
   After deploying, run `./set-domain.sh https://your-real-domain.com` or search-and-replace
   the domain in `index.html` (currently `https://sahal-sharafiya.vercel.app`) if it changes, then redeploy.
2. **Wishes Box** – see below. Without Firebase it runs in *local demo mode* (wishes are
   visible only on the device that wrote them, and the page says so).
3. **Venue link** – the Directions links use a Google Maps search for
   "Nakshathra Convention Centre Kadathy Muvattupuzha Kerala". For an exact pin, open the venue in
   Google Maps, copy its *Share* link and replace the three `google.com/maps/search/...` links in `index.html`.
   `assets/venue.jpg` is a styled placeholder card; replace it with a real venue photo or map screenshot
   (keep it roughly square) if you have a permitted one.

## Editable details (`script.js`, top of file)

Names, `WEDDING` timestamp (`2026-12-27T11:30:00+05:30`), event length, and venue address for the
calendar event. The countdowns, the December 2026 calendar grid, the highlighted 27th and the
Google Calendar link are all generated from these values.

## Wishes Box → WhatsApp

Tapping **Send Wishes** opens WhatsApp with the guest's name and message pre-filled, addressed to
`+91 90617 53746` (`WHATSAPP_NUMBER` in `script.js`). The guest taps Send in WhatsApp to deliver it.
The list of wishes on the page only appears if you also configure the optional Firebase backend below.

## Optional: show wishes on the page (Firebase Firestore, free tier)

1. Create a project at https://console.firebase.google.com, then **Build → Firestore Database → Create** (production mode).
2. **Project settings → General → Your apps → Web app (</>)**; copy `apiKey` and `projectId`.
3. Paste them into `FIREBASE_API_KEY` and `FIREBASE_PROJECT_ID` in `script.js`.
4. **Firestore → Rules**, publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /wishes/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name','msg','t'])
        && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 60
        && request.resource.data.msg is string && request.resource.data.msg.size() > 0 && request.resource.data.msg.size() <= 400
        && request.resource.data.t is int;
      allow update, delete: if false;
    }
  }
}
```

5. (Recommended) In Google Cloud Console → APIs & Services → Credentials, restrict the API key to your site's domain (HTTP referrers).

The page uses the Firestore REST API directly (no SDK). Wishes are rendered with `textContent`
(never as HTML), validated/trimmed, and double-submits are blocked.
