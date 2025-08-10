# Firebase Setup Guide for ShiftPal

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Name it "ShiftPal" (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Choose your Analytics location
6. Click "Create project"

## 🌐 Step 2: Add Web App

1. In your Firebase project console, click the web icon (</>) to add a web app
2. Register your app with a nickname like "ShiftPal Web"
3. You can optionally set up Firebase Hosting (we'll do this later)
4. **Copy the Firebase configuration object** - you'll need this for the next step

## 🔧 Step 3: Configure Environment Variables

### For Local Development:

1. Create a `.env` file in your project root (copy from `env.example`)
2. Add your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API (for AI chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### For Production (GitHub Pages):

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`

## 🔐 Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your authorized domains:
   - `localhost` (for local development)
   - `jaos-dev.github.io` (for GitHub Pages)
   - Your custom domain (if you have one)

## 📊 Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location close to your users
5. Click "Done"

## 🛡️ Step 6: Security Rules (Optional but Recommended)

In Firestore Database → Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to subcollections
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Admin logs (read-only for admins)
    match /adminLogs/{document} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)/profile/user).data.role == 'admin';
    }
  }
}
```

## 🚀 Step 7: Test Your Setup

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Try signing in with Google
3. Check that data is being saved to Firestore

## 🔍 Step 8: Monitor Usage

1. In Firebase Console, go to **Usage and billing**
2. Set up billing alerts (Firebase has a generous free tier)
3. Monitor your usage in the dashboard

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This is normal if you're hot-reloading in development

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Ensure the user is authenticated

3. **Authentication not working**
   - Verify your authorized domains in Firebase Console
   - Check that Google sign-in is enabled

4. **Environment variables not loading**
   - Ensure your `.env` file is in the project root
   - Restart your development server after adding environment variables

## 📱 Next Steps

Once Firebase is set up, you can:
- Deploy to Firebase Hosting (alternative to GitHub Pages)
- Set up Firebase Analytics
- Configure Firebase Performance Monitoring
- Add more authentication providers

## 🔗 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
