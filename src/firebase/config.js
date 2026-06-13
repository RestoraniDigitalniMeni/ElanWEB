// firebase/config.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

// =====================================================
// CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyBWGQRZrfSPBHGbitbpaV6-DDOxd6ZR2hs",
  authDomain: "cool-kit-330117.firebaseapp.com",
  databaseURL:
    "https://cool-kit-330117-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cool-kit-330117",
  storageBucket: "cool-kit-330117.appspot.com",
  messagingSenderId: "592038495876",
  appId: "1:592038495876:android:eb9386450b4ac1c66ba4d1",
};

// =====================================================
// INIT
// =====================================================

const app = initializeApp(firebaseConfig);

// =====================================================
// DATABASE + AUTH
// =====================================================

export const db = getDatabase(app);
export const auth = getAuth(app);

// =====================================================
// MESSAGING (FIXED - SAFE LAZY INIT)
// =====================================================

// ovo NE smije biti null export koji se koristi direktno
let messagingInstance = null;

/**
 * 🔥 uvijek koristi ovo za FCM
 * nikad direktno messaging import
 */
export const getMessagingSafe = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log("FCM not supported in this browser");
      return null;
    }

    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }

    return messagingInstance;
  } catch (e) {
    console.log("FCM init error:", e);
    return null;
  }
};

// =====================================================
// BACKWARD COMPATIBILITY (NE DIRAJ POSTOJEĆE IMPORT-e)
// =====================================================

// ako negdje već koristiš "messaging"
export const messaging = null;

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default app;