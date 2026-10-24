# Firebase email authentication setup

This project includes `.env.local` configured for the `grabfood-demo` Firebase Web app.

1. In Firebase Console, open Authentication → Sign-in method and enable Email/Password.
2. Restart Expo so its public environment variables are loaded.
3. Register with an inbox you can access, open the Firebase verification email, follow its link, then return to the app and sign in.

If using a different Firebase project, copy `.env.example` to `.env.local` and replace each value with that project's Firebase Web app config. `.env.local` is ignored by Git; do not commit it.

The Firebase Web app config identifies the project and is intended for client apps. Do not put a Firebase Admin SDK service-account key or other private server credentials in this Expo project.