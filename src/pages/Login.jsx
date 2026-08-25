import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { usersRestoran } from "../firebase/refs";
import { child } from "firebase/database";
import { auth } from "../firebase/config";
import { get, set, update } from "firebase/database";
import { useNavigate } from "react-router-dom";


 
import { getMessagingSafe } from "../firebase/config";
import { getToken } from "firebase/messaging";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [ime, setIme] = useState("");
  const [broj, setBroj] = useState("");
  const [titula, setTitula] = useState("Titula");

  const [mode, setMode] = useState("login");
const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // =====================================================
  // AUTO LOGIN
  // =====================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const localUser = localStorage.getItem("user");
        if (localUser) navigate("/dashboard");
      }
    });

    return () => unsub();
  }, []);

  // =====================================================
  // FCM TOKEN
  // =====================================================
 

const saveFCMToken = async (uid) => {
  try {
    console.log("========== FCM START ==========");
    console.log("UID:", uid);

    // 1. Provjera browsera
    if (!("Notification" in window)) {
      console.error("❌ Browser ne podržava Notification API");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.error("❌ Browser ne podržava Service Worker");
      return;
    }

    // 2. Permission
    let permission = Notification.permission;

    console.log("Trenutni permission:", permission);

    if (permission !== "granted") {
      permission = await Notification.requestPermission();
      console.log("Novi permission:", permission);
    }

    if (permission !== "granted") {
      console.error("❌ Notification permission nije granted");
      return;
    }

    // 3. Service Worker
    console.log("Čekam Service Worker...");

    const registration = await navigator.serviceWorker.ready;

    console.log("✅ Service Worker spreman:");
    console.log(registration);

    // 4. Firebase Messaging
    console.log("Uzimam Firebase Messaging...");

    const messaging = await getMessagingSafe();

    if (!messaging) {
      console.error("❌ getMessagingSafe() je vratio null/undefined");
      return;
    }

    console.log("✅ Messaging postoji");

    // 5. FCM Token
    console.log("Tražim FCM token...");

    const token = await getToken(messaging, {
      vapidKey:
        "BHe7nSvVdLbYzSKV1boLUgrj35JH5UrvIdP7HRsMn4E1B4nl19IXlDjiLg-OZHnN1_DmFAgfAX2atjsfdEGD-co",
      serviceWorkerRegistration: registration,
    });

    console.log("FCM TOKEN:", token);

    if (!token) {
      console.error("❌ Firebase nije vratio token");
      return;
    }

    // 6. Firebase Database
    console.log("Upisujem token u:", uid);

    await update(child(usersRestoran(), uid), {
      fcmToken: token,
    });

    console.log("✅ FCM TOKEN USPJEŠNO SAČUVAN!");
    console.log("========== FCM END ==========");

  } catch (error) {
    console.error("❌❌❌ FCM ERROR:", error);
  }
};

  // =====================================================
  // LOGIN
  // =====================================================
 
 
const login = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCred.user.uid;

    const snapshot = await get(child(usersRestoran(), uid));

    if (!snapshot.exists()) {
      alert("User ne postoji u bazi");
      return;
    }

    const fullUser = {
      ...snapshot.val(),
      uid,
    };

    // 1. Save user
    localStorage.setItem("user", JSON.stringify(fullUser));

    // 2. State update
    window.dispatchEvent(new Event("user-login"));

    // 3. FCM token
    await saveFCMToken(uid);

    // 4. Dashboard
    navigate("/dashboard");

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("Login error: " + error.message);
  }
};
 

  // =====================================================
  // REGISTER
  // =====================================================
const register = async () => {
  try {
    if (!ime || !email || !password || !broj) {
      alert("Popuni sva polja");
      return;
    }

    if (titula === "Titula") {
      alert("Izaberi titulu");
      return;
    }

    if (!acceptedTerms) {
      alert("Morate prihvatiti Uslove korištenja i Politiku privatnosti.");
      return;
    }

    // 1. Kreiranje Firebase Auth korisnika
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCred.user.uid;

    // 2. Kreiranje korisnika u Realtime Database
    const newUser = {
  ime,
  email,
  broj,
  password,
  titula,
  fcmToken: "",
  uid,
};

await set(child(usersRestoran(), uid), newUser);

localStorage.setItem("user", JSON.stringify(newUser));
window.dispatchEvent(new Event("storage"));

await saveFCMToken(uid);

navigate("/dashboard");

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    alert("Register error: " + error.message);
  }
};

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-neutral-900 px-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl">

        {/* SWITCH */}
        <div className="flex mb-6 gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              mode === "login"
                ? "bg-orange-500 text-black"
                : "bg-neutral-800 text-white"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              mode === "register"
                ? "bg-orange-500 text-black"
                : "bg-neutral-800 text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* LOGIN */}
        {mode === "login" && (
          <div className="space-y-4">
            <input
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={login}
              className="w-full py-4 rounded-2xl bg-orange-500 text-black font-bold active:scale-[0.98] transition"
            >
              LOGIN
            </button>
          </div>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <div className="space-y-4">
            <input
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ime i prezime"
              onChange={(e) => setIme(e.target.value)}
            />

            <input
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Broj telefona"
              onChange={(e) => setBroj(e.target.value)}
            />

            <input
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

     <select
  className="w-full p-4 rounded-2xl bg-neutral-800 text-white outline-none focus:ring-2 focus:ring-green-500"
  value={titula}
  onChange={(e) => setTitula(e.target.value)}
>
  <option value="Titula">Izaberi titulu</option>
  <option value="Konobar">Konobar</option>
  <option value="Kuhinja">Kuhinja</option>
</select>


{/* USLOVI I POLITIKA */}

<div className="flex items-start gap-3 text-sm text-neutral-300">

  <input
    type="checkbox"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
    className="mt-1 w-4 h-4 accent-green-500 cursor-pointer"
  />

  <div className="leading-6">

    Prihvatam{" "}

<button
  type="button"
  onClick={() =>
    navigate("/uslovi", {
      state: { from: "/register" }
    })
  }
  className="text-green-400 hover:text-green-300 underline"
>
  Uslove korištenja
</button>

    {" "}i{" "}

<button
  type="button"
  onClick={() =>
    navigate("/politika", {
      state: { from: "/register" }
    })
  }
  className="text-green-400 hover:text-green-300 underline"
>
  Politiku privatnosti
</button>

  </div>

</div>

            <button
              onClick={register}
              className="w-full py-4 rounded-2xl bg-green-500 text-black font-bold active:scale-[0.98] transition"
            >
              REGISTER
            </button>
          </div>
        )}

      </div>
    </div>
  );
}