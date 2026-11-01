# STMEM Firebase Edition — simple setup guide

This version uses Firebase Authentication for Google + email/password sign-in and Firestore for visitor records. Netlify hosts the website and runs two secure server functions. The Firebase Admin service account is stored only in Netlify environment variables.

## A. Create Firebase project

1. Visit https://console.firebase.google.com/ and create a project named STMEM.
2. In Project Overview, click the Web icon `</>` to add a web app. Register it as `STMEM Website`.
3. Firebase displays a `firebaseConfig` object. Copy its values into BOTH `public/app.js` and `public/admin.js` (replace the placeholder values). These web config values are public identifiers, not server secrets.
4. In Firebase Console > Authentication > Get started > Sign-in method, enable Google and Email/Password. For Google, select a support email and save.
5. In Authentication > Settings > Authorized domains, add your Netlify hostname (for example `your-site.netlify.app`) after deploying.

## B. Create Firestore

1. Open Build > Firestore Database > Create database.
2. Choose production mode and a region near your users.
3. After creating it, open the Rules tab.
4. Replace the rules with the contents of `firestore.rules`, then click Publish.

## C. Create a Firebase service account for Netlify functions

1. Open Firebase Project settings (gear) > Service accounts.
2. Click Generate new private key and download the JSON file.
3. Keep this JSON private. Never upload it into `public`, GitHub, or share it.
4. Open the JSON file in a text editor and copy its entire contents. You will add it as a Netlify environment variable in the next section.

## D. Deploy to Netlify

1. Upload the contents of this folder to a GitHub repository.
2. In Netlify choose Add new site > Import an existing project and connect that repository.
3. Publish directory: `public`. Build command can be left blank. `netlify.toml` configures functions.
4. In Netlify Site configuration > Environment variables add:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = entire contents of the downloaded service account JSON file (paste as one JSON value)
   - `ADMIN_EMAIL` = exact email address of the account that should be the administrator
5. Deploy/redeploy the site.

## E. Finish Firebase domain setup

1. Copy the deployed Netlify hostname, e.g. `your-site.netlify.app`.
2. Firebase Console > Authentication > Settings > Authorized domains > Add domain.
3. Add only the hostname, without `https://` or a path.
4. Save.

## F. Test

1. Open the Netlify site.
2. Choose Allow Analytics to record a test visit. Decline means no analytics record is sent.
3. Sign in with Google or create an email/password account.
4. To open the admin dashboard, sign in using the exact account email set in `ADMIN_EMAIL`, then open `/admin.html`.
5. Sign in using a different account and verify it cannot read visitor records.
6. Open Netlify > Functions logs if a visit is not recorded.

## Privacy and security notes

- Analytics start only after the visitor chooses Allow Analytics; declining still allows sign-in.
- IP is obtained server-side from Netlify request headers, not trusted from a browser-provided IP value.
- Firestore rules deny all browser access to visitor_events. Server functions use the Firebase Admin SDK.
- The service account private key is only stored in Netlify environment variables. Never put it in browser files or a public repository.
- Use MFA on the admin Google account. Limit access to Netlify and Firebase project settings.
- This starter does not collect Gmail passwords, contacts, precise location, or hidden device fingerprints.
- Configure deletion/retention (for example, 30 days) before launch and add operator contact details to the privacy notice. Legal requirements vary by location.

## Troubleshooting

- `auth/unauthorized-domain`: add your Netlify hostname under Firebase Authentication > Settings > Authorized domains.
- Google button does nothing or errors: ensure Google provider is enabled and support email selected.
- `Could not record visit`: verify Firestore exists, service-account JSON environment variable is valid, and redeploy.
- Admin denied: signed-in email must exactly match `ADMIN_EMAIL`.
- Environment variable changes require a new Netlify deploy.
