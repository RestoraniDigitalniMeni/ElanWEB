

import { useEffect, useState } from "react";
import { onValue, set, child } from "firebase/database";

import {
  rootRestoran,
  totalPriceRestoran,
  completeOrdersRestoran,
  presjekRestoran,
  totalResetRef
} from "../firebase/refs";


import { useNavigate } from "react-router-dom";

export default function Stats() {




  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [lockState, setLockState] = useState("Zaključano");
  const [resetInfo, setResetInfo] = useState(null);
  const [expire, setExpire] = useState(null);
  const [time, setTime] = useState(new Date());
  
  
  	const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};
  

  // LIVE CLOCK
  useEffect(() => {

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  // FIREBASE REALTIME
  useEffect(() => {

    // TOTAL PRICE
    const unsubTotal = onValue(
      totalPriceRestoran(),
      (snap) => {

        if (snap.exists()) {
          setData(snap.val());
        }

      }
    );
	
	
	

	
	

    // COMPLETE ORDERS COUNT
    const unsubOrders = onValue(
      completeOrdersRestoran(),
      (snap) => {

        if (snap.exists()) {

          const users = snap.val();

          let totalOrders = 0;

          // svaki korisnik
          Object.keys(users).forEach((userId) => {

            const userOrders = users[userId];

            // broj narudzbi za tog korisnika
            totalOrders += Object.keys(userOrders || {}).length;

          });

          setOrdersCount(totalOrders);

        } else {
          setOrdersCount(0);
        }

      }
    );

    // LOCK STATE
    const unsubLock = onValue(
      presjekRestoran(),
      (snap) => {

        if (snap.exists()) {
          setLockState(snap.val());
        }

      }
    );

    // RESET INFO
    const unsubReset = onValue(
      totalResetRef(),
      (snap) => {

        if (snap.exists()) {
          setResetInfo(snap.val());
        }

      }
    );

    // EXPIRE
    const expireRef = child(
      rootRestoran(),
      "Expire"
    );

    const unsubExpire = onValue(
      expireRef,
      (snap) => {

        if (snap.exists()) {
          setExpire(snap.val());
        }

      }
    );

    return () => {

      unsubTotal();
      unsubOrders();
      unsubLock();
      unsubReset();
      unsubExpire();

    };

  }, []);

  // TOGGLE LOCK
  const toggleLock = async () => {

    const newState =
      lockState === "Zaključano"
        ? "Omogućeno"
        : "Zaključano";

    await set(
      presjekRestoran(),
      newState
    );

  };

 if (data === null) {

    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          background: "#f2f2f2"
        }}
      >
        Loading...
      </div>
    );

  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f2f2",
        padding: 14,
        fontFamily: "sans-serif"
      }}
    >

      {/* TOP TOTAL */}
      <div
        style={{
          background: "white",
          padding: 22,
          borderRadius: 16,
          textAlign: "center",
          marginBottom: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
        }}
      >

        <div
          style={{
            fontSize: 14,
            color: "#666"
          }}
        >
          Zarada do: {time.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
})}
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: "bold",
            marginTop: 6
          }}
        >
          {data.TotalRestoran ?? 0} €
        </div>

      </div>

      {/* ORDERS + RESET */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 14,
          marginBottom: 10,
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
        }}
      >

        <div style={{ fontWeight: 600 }}>
          Izdato
        </div>

        <div
          style={{
            fontSize: 18
          }}
        >
          {ordersCount} narudžbi
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            color: "#666"
          }}
        >
          Poslednji reset: {resetInfo || "N/A"}
        </div>

      </div>

      {/* SMJENE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >

        {/* PRVA */}
        <div
          style={{
            background: "white",
            padding: 16,
            borderRadius: 14,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
          }}
        >

          <div style={{ fontWeight: 600 }}>
            Prva smjena
          </div>

          <div
            style={{
              fontSize: 18,
              marginTop: 4
            }}
          >
            {data.TotalPrva ?? 0} €
          </div>

        </div>

        {/* DRUGA */}
        <div
          style={{
            background: "white",
            padding: 16,
            borderRadius: 14,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
          }}
        >

          <div style={{ fontWeight: 600 }}>
            Druga smjena
          </div>

          <div
            style={{
              fontSize: 18,
              marginTop: 4
            }}
          >
            {data.TotalDruga ?? 0} €
          </div>

        </div>

      </div>

      {/* LOCK */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 14,
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <div>

          <div style={{ fontWeight: 600 }}>
            Omogući brisanje računa
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#666"
            }}
          >
          
          </div>

        </div>

      <button
  onClick={() => {
    vibrate(100);
    toggleLock();
  }}
  style={{
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    background: lockState === "Zaključano" ? "red" : "green"
  }}
>
  {lockState}
</button>

      </div>

      {/* EXTRA ACTIONS */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 14,
          marginTop: 10
        }}
      >

       
	   <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>

  <div>Mjesecni izvještaj</div>

  <button
  onClick={() => {
    vibrate(80);
    navigate("/mjesecniIzvjestaj");
  }}
  style={{
    padding: "6px 10px"
  }}
>
  Otvori
</button>

</div>
	   
	   
	   

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10
          }}
        >

          <div>Konobari</div>

         <button
  onClick={() => {
    vibrate(80);
    navigate("/konobari");
  }}
  style={{
    padding: "6px 10px"
  }}
>
  Otvori
</button>
        </div>

      </div>

      {/* RESET BUTTON */}
      <div
        style={{
          marginTop: 10,
          background: "white",
          padding: 16,
          borderRadius: 14
        }}
      >

        <button
	  onClick={() => {
    vibrate(80);
    // ovdje ide reset logika
  }}
		
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#333",
            color: "white",
            fontWeight: "bold"
          }}
        >
          RESET
        </button>

      </div>

      {/* EXPIRE */}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 13,
          color: "#555"
        }}
      >
        Licenca validna do: {expire || "N/A"}
      </div>

    </div>
  );
}
