import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { update } from "firebase/database";
import { child } from "firebase/database";
import { usersRestoran } from "../firebase/refs";
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // LOAD USER ON START
useEffect(() => {
  try {
    const data = localStorage.getItem("user");

    if (data && data !== "undefined" && data !== "null") {
      setUser(JSON.parse(data));
    } else {
      setUser(null);
    }
  } catch (e) {
    setUser(null);
  }

  setLoading(false);
}, []);

  // FCM (ostavi prazno ako još nisi sredio messaging)
  useEffect(() => {
    const t = setTimeout(() => {
      // saveFCMToken(); // <-- OVDE kasnije ubaci
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  const Card = ({ icon, title, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer"
      }}
    >
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: "600" }}>{title}</div>
    </div>
  );

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#f2f2f2",
      padding: 10,
      display: "flex",
      flexDirection: "column"
    }}>

      <div style={{
        background: "#008577",
        color: "white",
        padding: 12,
        borderRadius: 14,
        marginBottom: 10
      }}>
        <div>{user?.ime}</div>
        <div>{user?.titula}</div>
      </div>

      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }}>

        <Card icon="📄✏️" title="Naruči hranu" onClick={() => navigate("/order")} />
        <Card icon="👨‍🍳" title="Kuhinja" onClick={() => navigate("/kitchen")} />
        <Card icon="📊" title="Statistika" onClick={() => navigate("/stats")} />
        <Card icon="📄" title="Računi" onClick={() => navigate("/Racuni")} />
        <Card icon="ℹ️" title="Informacije" onClick={() => navigate("/info")} />

       <Card
  icon="🚪"
  title="Logout"
  onClick={async () => {
    const data = localStorage.getItem("user");

    if (data) {
      try {
        const user = JSON.parse(data);

        // 🔥 BRISANJE TOKENA IZ BAZE
        await update(child(usersRestoran(), user.uid), {
          fcmToken: "",
          
        });
      } catch (e) {
        console.log("Logout FCM delete error:", e);
      }
    }

    // 🔥 LOCAL CLEANUP
    localStorage.removeItem("user");
    localStorage.removeItem("fcmToken");

    window.dispatchEvent(new Event("user-logout"));

    navigate("/", { replace: true });
  }}
/>

      </div>
    </div>
  );
}