// firebase-messaging-sw.js
// STAVI U /public FOLDER

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// =====================================================
// FIREBASE CONFIG
// =====================================================

firebase.initializeApp({
  apiKey: "AIzaSyBWGQRZrfSPBHGbitbpaV6-DDOxd6ZR2hs",
  authDomain: "cool-kit-330117.firebaseapp.com",
  databaseURL:
    "https://cool-kit-330117-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cool-kit-330117",
  storageBucket: "cool-kit-330117.appspot.com",
  messagingSenderId: "592038495876",
  appId:
    "1:592038495876:android:eb9386450b4ac1c66ba4d1",
});

// =====================================================
// MESSAGING
// =====================================================

const messaging = firebase.messaging();

// =====================================================
// BACKGROUND PUSH
// =====================================================

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background:",
    payload
  );

  const title =
    payload?.data?.title ||
    payload?.notification?.title ||
    "Nova narudžba";

  const body =
    payload?.data?.body ||
    payload?.notification?.body ||
    "Imate novu narudžbu";

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/badge.png",

    vibrate: [0, 400, 200, 400],

    requireInteraction: true,

    tag: "restaurant-order",

    renotify: true,

    data: {
      url: "/kitchen",
    },
  });
});

// =====================================================
// CLICK NOTIFICATION
// =====================================================

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    const urlToOpen =
      event.notification?.data?.url || "/kitchen";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          for (const client of windowClients) {
            if (
              client.url.includes(urlToOpen) &&
              "focus" in client
            ) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
);