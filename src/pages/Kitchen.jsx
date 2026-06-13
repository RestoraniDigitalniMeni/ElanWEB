import React, { useEffect, useRef, useState } from "react";
import {
  onValue,
  get,
  child,
  set,
  remove,
  runTransaction,
  update,
} from "firebase/database";

import { ref } from "firebase/database";

 
import {
  ordersRestoran,
  orderRef,
  globalLockRef,
  totalRestoranRef,
  totalPrvaRef,
  totalDrugaRef,
  completeOrderRef,
  transactionLockRef,
  transactionLocksRestoran,
  completeOrdersRestoran,
  rootRestoran,
} from "../firebase/refs";

import * as N from "../firebase/nodes";

import { ChefHat, X } from "lucide-react";




export default function Kitchen() {
	
	
		
	useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

	
	
	
	
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isProcessingRef = useRef(false);
  const wakeLockRef = useRef(null);
  const lastOrdersRef = useRef("");

const [loadingOrderId, setLoadingOrderId] = useState(null);
const [deletingOrderId, setDeletingOrderId] = useState(null);


  const currentUser =
    JSON.parse(localStorage.getItem("user")) || {};

  const userRole = currentUser?.titula || "";

  const canComplete =
    userRole === "Administrator" || userRole === "Kuhinja";

  const canDelete = userRole === "Administrator";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };


    const [now, setNow] = useState(Date.now());

        useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 60000); // svake 1 minute

  return () => clearInterval(interval);
}, []);






const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(80);
  }
};








 const sendPushNotification = async (userId, orderId) => {
  try {
   const tokenRef = child(
  child(child(rootRestoran(), N.USERS_RESTORAN), userId),
  "fcmToken"
    );

    const tokenSnap = await get(tokenRef);

    const token = tokenSnap.val();

    if (!token) {
      console.log("Nema FCM tokena za usera:", userId);
      return;
    }

    const res = await fetch(
      "https://fcm-server-topaz.vercel.app/api/sendOrderNotification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          title: "Narudžba završena",
          body: "Vaša narudžba je spremna!",
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.log("Push failed:", text);
    }
  } catch (e) {
    console.log("Push error", e);
  }
};













  const getShift = (hour) =>
    hour >= 5 && hour < 15 ? "PRVA" : "DRUGA";

  const formatDateTime = () => {
    const d = new Date();

    const pad = (n) => String(n).padStart(2, "0");

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const requestWakeLock = async () => {
    try {
      if (!("wakeLock" in navigator)) return;

      wakeLockRef.current?.release?.();

      wakeLockRef.current =
        await navigator.wakeLock.request("screen");

      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch {}
  };

  useEffect(() => {
    requestWakeLock();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      wakeLockRef.current?.release?.();
    };
  }, []);

  const parseCustomTime = (str) => {
    if (!str) return null;

    try {
      const [time, date] = str.split(" ");
      const [h, m, s] = time.split(":");
      const [d, mo, y] = date.split("-");

      return new Date(y, mo - 1, d, h, m, s);
    } catch {
      return null;
    }
  };

  const getClockTime = (str) => {
    if (!str) return "";
    return str.split(" ")[0].slice(0, 5);
  };



    const getWaitMinutes = (order, nowTs) => {
  const start = parseCustomTime(order.time);

  if (!start) return 0;

  return Math.floor((nowTs - start.getTime()) / 60000);
};




  const formatName = (text) => {
    if (!text) return "";

    return text
      .split("\n")
      .map((l) => l.trimStart())
      .filter((l) => l.trim() !== "")
      .join("\n");
  };

  useEffect(() => {
    const unsub = onValue(ordersRestoran(), (snap) => {
      const arr = [];

      snap.forEach((c) => {
        const v = c.val();

        if (v?.status === "pending") {
          arr.push(v);
        }
      });

      arr.sort((a, b) => {
        const ta = parseCustomTime(a.time)?.getTime() || 0;
        const tb = parseCustomTime(b.time)?.getTime() || 0;

        return ta - tb;
      });

      const serialized = JSON.stringify(arr);

      if (lastOrdersRef.current === serialized) return;
	  
	  
	  
	  

      lastOrdersRef.current = serialized;

      setOrders(arr);
    });

    return () => unsub();
  }, []);

  const cleanupLocks = async (orderId) => {
    try {
    

      const cleanup = {};

await set(globalLockRef(), "False");
cleanup[`${N.TRANSACTION_LOCKS_RESTORAN}/${orderId}`] = null;

await update(rootRestoran(), cleanup);


    } catch (e) {
      console.log("cleanup error", e);
    }
  };

  const completeOrder = async (orderItem) => {
	  
	   
    if (!canComplete) return;
    if (isProcessingRef.current) return;
 setLoadingOrderId(orderItem.orderId);
    isProcessingRef.current = true;

    try {
      // GLOBAL LOCK
      const lockTx = await runTransaction(globalLockRef(), (cur) => {
        if (cur === "True") return;
        return "True";
      });

      if (!lockTx.committed) {
		  
		  
		
        showToast("Druga narudžba u procesu");
		 
        return;
      }

      // PROVJERA DA LI JE VEĆ IZDATA
      const completeSnap = await get(
        completeOrderRef(
          orderItem.orderById,
          orderItem.orderId
        )
      );

      if (completeSnap.exists()) {
        await cleanupLocks(orderItem.orderId);
        
        showToast("Ova narudžba je već izdata!");

        setSelectedOrder(null);
        setShowDeleteConfirm(false);

        return;
      }

      // LOCK PO NARUDŽBI
      const txLock = await runTransaction(
        transactionLockRef(orderItem.orderId),
        (cur) => {
          if (cur !== null) return;
          return true;
        }
      );

      if (!txLock.committed) {
        await cleanupLocks(orderItem.orderId);
	

        showToast("Ova narudžba je u procesu.");

        return;
      }

      // PROVJERA DA LI NARUDŽBA POSTOJI
      const orderSnap = await get(
        orderRef(orderItem.orderId)
      );

      if (!orderSnap.exists()) {
        await cleanupLocks(orderItem.orderId);
		
		

        showToast("Narudžba je obrisana prije izdavanja!");

        setSelectedOrder(null);
        setShowDeleteConfirm(false);

        return;
      }

      // ČITANJE TOTALA
      const [
        totalRestoranSnap,
        totalPrvaSnap,
        totalDrugaSnap,
      ] = await Promise.all([
        get(totalRestoranRef()),
        get(totalPrvaRef()),
        get(totalDrugaRef()),
      ]);

      const totalRestoran =
        parseFloat(
          String(totalRestoranSnap.val() || "0").replace(",", ".")
        ) || 0;

      const totalPrva =
        parseFloat(
          String(totalPrvaSnap.val() || "0").replace(",", ".")
        ) || 0;

      const totalDruga =
        parseFloat(
          String(totalDrugaSnap.val() || "0").replace(",", ".")
        ) || 0;

      const orderPrice =
        parseFloat(
          String(orderItem.totalPrice || "0").replace(",", ".")
        ) || 0;

      const currentHour = new Date().getHours();

      const newTotalRestoran =
        totalRestoran + orderPrice;

      const newTotalPrva =
        currentHour >= 5 && currentHour < 15
          ? totalPrva + orderPrice
          : totalPrva;

      const newTotalDruga =
        currentHour >= 5 && currentHour < 15
          ? totalDruga
          : totalDruga + orderPrice;

      const orderDetails = {
        orderId: orderItem.orderId,
        user_Id: orderItem.orderById,
        addittionalInfo:
          orderItem.addittionalInfo || "",
        orderPersonName:
          orderItem.orderPersonName || "",
        name: orderItem.name || "",
        orderCompletedBy:
          currentUser?.ime ||
          currentUser?.name ||
          "Web Kuhinja",
        description:
          orderItem.description || "",
        totalPrice:
          orderItem.totalPrice || "0.00",
        status: `Complete ${formatDateTime()}`,
        notificationSatus: "true",
        VrijemeNarucivanja:
          orderItem.time || "",
      };

const updates = {};

// TOTALI
updates[`${N.TOTAL_PRICE_RESTORAN}/${N.TOTAL_RESTORAN}`] =
  newTotalRestoran.toFixed(2);

updates[`${N.TOTAL_PRICE_RESTORAN}/${N.TOTAL_PRVA}`] =
  newTotalPrva.toFixed(2);

updates[`${N.TOTAL_PRICE_RESTORAN}/${N.TOTAL_DRUGA}`] =
  newTotalDruga.toFixed(2);

// COMPLETE ORDER
updates[
  `${N.COMPLETE_ORDERS_RESTORAN}/${orderItem.orderById}/${orderItem.orderId}`
] = orderDetails;

// DELETE ORDER
updates[
  `${N.ORDERS_RESTORAN}/${orderItem.orderId}`
] = null;

// TRANSACTION LOCK DELETE
updates[
  `${N.TRANSACTION_LOCKS_RESTORAN}/${orderItem.orderId}`
] = null;

 

		   
		  try {
  await update(rootRestoran(), updates);
} catch (e) {
  await set(globalLockRef(), "False"); // RESETUJ GA AKO NE USPIJE
  throw e;
} 
		   await sendPushNotification(
  orderItem.orderById,
  orderItem.orderId
  
  
  
  
  
  
);
		   

  

      setSelectedOrder(null);
      setShowDeleteConfirm(false);

      showToast("Narudžba završena");
    } catch (e) {
      console.log(e);

      await cleanupLocks(orderItem.orderId);
     
      showToast("Greška prilikom izdavanja.");
    } finally {
		try {
    await set(globalLockRef(), "False");
  } catch (e) {
    console.log("unlock failed", e);
  }
  

      isProcessingRef.current = false;
	  setLoadingOrderId(null);
    }
  };

 const deleteOrder = async () => {
  if (!selectedOrder) return;
  if (!canDelete) return;

  setDeletingOrderId(selectedOrder.orderId);

  try {
    const tx = await runTransaction(
      orderRef(selectedOrder.orderId),
      (currentData) => {
        if (currentData == null) return;
        return null;
      }
    );

    if (!tx.committed) {
      showToast("Narudžba već ne postoji.");
      return;
    }

    setShowDeleteConfirm(false);
    setSelectedOrder(null);

    showToast("Narudžba obrisana!");
  } catch (e) {
    console.log(e);
    showToast("Greška pri brisanju!");
  } finally {
    setDeletingOrderId(null);
  }
};

  const isSelected = (id) =>
    selectedOrder?.orderId === id;

  return (
    <div
      style={{
        height: "100vh",
        background: "#f2f2f2",
        padding: 12,
        display: "flex",
        flexDirection: "column",
      }}
    >
   <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(135deg,#1e1e2f,#2c2c44)",
    color: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
	
  }}
>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ChefHat size={18} />
          <b>Kuhinja</b>
        </div>

        <div
          style={{
            background: "orange",
            padding: "4px 10px",
            borderRadius: 20,
            fontWeight: "bold",
            color: "black",
          }}
        >
          {orders.length}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {orders.map((order) => (
          <div
            key={order.orderId}
            onClick={() => setSelectedOrder(order)}
            style={{
              background: isSelected(order.orderId)
                ? "#fff7e6"
                : "white",
              borderRadius: 16,
              padding: 14,
              borderLeft: "4px solid #2c2c44",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <b>{order.orderPersonName}</b>

              <span style={{ opacity: 0.7 }}>
                {getClockTime(order.time)}
              </span>
            </div>



{order.addittionalInfo && (
  <div
    style={{
      marginTop: 6,
      fontSize: 12,
      background: "#fff3cd",
      padding: 8,
      borderRadius: 8,
      whiteSpace: "pre-wrap",
    }}
  >
    <b>Dodatne informacije:</b>
    <br />
    {order.addittionalInfo}
  </div>
)}



            <div
              style={{
                marginTop: 8,
                whiteSpace: "pre-wrap",
                background: "#f8f8f8",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {formatName(order.name)}
            </div>
			
			

			
			

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              {getWaitMinutes(order, now)} min
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div
          onClick={() => {
if (loadingOrderId !== null || deletingOrderId !== null) return;

  setSelectedOrder(null);
  setShowDeleteConfirm(false);
}}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              width: "100%",
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
    <button
  onClick={() => {
   if (loadingOrderId !== null || deletingOrderId !== null) return;

    vibrate();
    setSelectedOrder(null);
  }}
 disabled={loadingOrderId !== null || deletingOrderId !== null}
>
  <X />
</button>

            <h3>
              {selectedOrder.orderPersonName}
            </h3>
			
			
					{selectedOrder.addittionalInfo && (
  <div
    style={{
      marginTop: 10,
      background: "#fff3cd",
      padding: 10,
      borderRadius: 10,
      whiteSpace: "pre-wrap",
      fontSize: 13,
    }}
  >
    <b>Dodatne informacije:</b>
    <div style={{ marginTop: 4 }}>
      {selectedOrder.addittionalInfo}
    </div>
  </div>
)}

            <div
              style={{
                whiteSpace: "pre-wrap",
                background: "#f8f8f8",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {formatName(selectedOrder.name)}
            </div>
			
			
	
			

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Vrijeme narudžbe:{" "}
              {getClockTime(selectedOrder.time)}
            </div>

          <button
  onClick={() => {
    if (
      !canComplete ||
      loadingOrderId === selectedOrder.orderId
    )
      return;

    vibrate();
    completeOrder(selectedOrder);
  }}
  disabled={
    !canComplete ||
    loadingOrderId === selectedOrder.orderId
  }
  style={{
    width: "100%",
    marginTop: 10,
    padding: 12,
    background: "blue",
    color: "white",
    borderRadius: 10,
    opacity:
      loadingOrderId === selectedOrder.orderId ? 0.7 : 1,
    cursor:
      loadingOrderId === selectedOrder.orderId
        ? "not-allowed"
        : "pointer",
  }}
>
  {loadingOrderId === selectedOrder.orderId ? (
    <span
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          border: "2px solid white",
          borderTop: "2px solid transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      Obrada...
    </span>
  ) : (
    "Završi narudžbu"
  )}
</button>

           <button
  onClick={() => {
    if (!canDelete) return;

    vibrate();
    setShowDeleteConfirm(true);
  }}
  disabled={!canDelete}
  style={{
    width: "100%",
    marginTop: 10,
    padding: 12,
    background: "red",
    color: "white",
    borderRadius: 10,
    opacity: !canDelete ? 0.5 : 1,
    cursor: !canDelete ? "not-allowed" : "pointer",
  }}
>
  Obriši narudžbu
</button>

            {showDeleteConfirm && (
              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  Da li ste sigurni?
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
               <button
  onClick={() => {
    if (deletingOrderId) return;

    vibrate();
    deleteOrder();
  }}
  disabled={deletingOrderId}
  style={{
    flex: 1,
    padding: 12,
    background: "green",
    color: "white",
    opacity: deletingOrderId ? 0.6 : 1,
    cursor: deletingOrderId ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }}
>
  {deletingOrderId ? (
    <>
      <div
        style={{
          width: 14,
          height: 14,
          border: "2px solid white",
          borderTop: "2px solid transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      Brišem...
    </>
  ) : (
    "Da"
  )}
</button>

                 <button
  onClick={() => {
    if (deletingOrderId) return;

    vibrate();
    setShowDeleteConfirm(false);
  }}
  disabled={deletingOrderId}
  style={{
    flex: 1,
    padding: 12,
    background: "red",
    color: "white",
    opacity: deletingOrderId ? 0.6 : 1,
    cursor: deletingOrderId ? "not-allowed" : "pointer",
  }}
>
  Ne
</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "black",
            color: "white",
            padding: 10,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}