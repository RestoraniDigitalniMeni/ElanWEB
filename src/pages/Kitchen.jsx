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

	
	const scrollRef = useRef(null);
const [showTop, setShowTop] = useState(false);
const [showBottom, setShowBottom] = useState(true);
	
	
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
const [completedAnimation, setCompletedAnimation] = useState(false);
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



const handleScroll = () => {

  const el = scrollRef.current;

  if (!el) return;

  const atTop = el.scrollTop <= 10;

  const atBottom =
    el.scrollHeight - el.scrollTop <= el.clientHeight + 10;


  setShowTop(!atTop);
  setShowBottom(!atBottom);

};


const scrollToTop = () => {

  scrollRef.current?.scrollTo({
    top:0,
    behavior:"smooth"
  });

};


const scrollToBottom = () => {

  scrollRef.current?.scrollTo({
    top:scrollRef.current.scrollHeight,
    behavior:"smooth"
  });

};


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

  const diff = nowTs - start.getTime();

  if (diff <= 0) return 0;

  return Math.floor(diff / 60000);
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

      setCompletedAnimation(true);

setTimeout(() => {
  setCompletedAnimation(false);
}, 2000);

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
    background: "linear-gradient(90deg, #22c55e, #3b82f6)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
   <div
style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(30,41,59,.92)",
    backdropFilter: "blur(18px)",
    color: "#fff",
    padding: "18px 22px",
    borderRadius: 22,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,.08)",
    boxShadow: "0 12px 30px rgba(0,0,0,.12)"
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
            background:"linear-gradient(135deg,#ffb100,#ff8a00)",
             
            borderRadius: 20,
            fontWeight: "bold",
            color: "black",
			padding:"6px 14px",
fontSize:15,
boxShadow:"0 8px 20px rgba(255,153,0,.35)"
          }}
        >
          {orders.length}
        </div>
      </div>

    <div
ref={scrollRef}
onScroll={handleScroll}
style={{
  flex: 1,
  overflowY: "auto",
  scrollbarWidth:"none",
  msOverflowStyle:"none",
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
    background: "#fff",
    borderRadius: 22,
    padding: 18,
    cursor: "pointer",
    transition: ".25s",
    border: isSelected(order.orderId)
        ? "2px solid #2563eb"
        : "1px solid #e6eaf0",
    boxShadow: isSelected(order.orderId)
        ? "0 15px 35px rgba(37,99,235,.18)"
        : "0 6px 18px rgba(0,0,0,.05)",
}}
          >
            
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: "#111827",
    }}
  >
    {order.orderPersonName}
  </div>
</div>

<div
  style={{
    display: "flex",
    gap: 8,
    marginTop: 10,
    
	flexWrap: "wrap",
	marginBottom: 12,
	
  }}
>
  <span
    style={{
      background: "#eff6ff",
      color: "#2563eb",
      padding: "5px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    🕒 {getClockTime(order.time)}
  </span>

   
</div>

{order.addittionalInfo && (
  <div
    style={{
      marginTop: 6,
      fontSize: 12,
     background:"#fff8e6",
border:"1px solid #ffd166",
padding:14,
borderRadius:16,
boxShadow:"0 4px 12px rgba(255,193,7,.15)"
    }}
  >
    <b>Dodatne informacije:</b>
    <br />
    {order.addittionalInfo}
  </div>
)}



           <div
  style={{
    marginTop: 12,   // <-- DODAJ
    whiteSpace: "pre-wrap",
    background:"#f8fafc",
    border:"1px solid #e2e8f0",
    padding:14,
    borderRadius:16,
    fontSize:15,
    lineHeight:1.7,
  }}
>
              {formatName(order.name)}
            </div>
			
			

			
			

            <div
style={{
marginTop:14,
display:"inline-flex",
padding:"6px 14px",
borderRadius:30,
fontWeight:700,
fontSize:13,
background:
getWaitMinutes(order,now)>20
?"#fee2e2"
:getWaitMinutes(order,now)>10
?"#fff7cc"
:"#dcfce7",

color:
getWaitMinutes(order,now)>20
?"#dc2626"
:getWaitMinutes(order,now)>10
?"#b45309"
:"#15803d"
}}
>
⏱ {getWaitMinutes(order,now)} min čekanja
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
            background:"#fff",
width:"100%",
padding:24,
borderTopLeftRadius:30,
borderTopRightRadius:30,
boxShadow:"0 -20px 50px rgba(0,0,0,.18)"
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


{completedAnimation && (
 <div
className="animate-fadeIn"
style={{
  position: "fixed",
  inset:0,
  zIndex:9999,
  background:"rgba(0,0,0,.88)",
  backdropFilter:"blur(12px)",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
}}
>
    <div
      style={{
        textAlign: "center",
         
      }}
    >
      <div
	  className="animate-checkCircle"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,#ffb100,#ff7a00)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow:
            "0 0 60px rgba(255,145,0,.55)",
          margin: "0 auto",
		  
        }}
      >
        <svg
          width="70"
          height="70"
          viewBox="0 0 52 52"
          fill="none"
        >
          <path
            d="M14 27 L22 35 L39 16"
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
			className="animate-drawCheck"
  
  
  
  
          />
        </svg>
      </div>

      <h1
	   
        style={{
          marginTop: 30,
          color: "white",
          fontSize: 42,
          fontWeight: 900,
		   
        }}
      >
        ZAVRŠENO
      </h1>

      <p
        style={{
          color: "#bdbdbd",
          marginTop: 10,
          fontSize: 18,
        }}
      >
        Narudžba je izdata
      </p>
    </div>
  </div>
)}


<div
style={{
  position:"fixed",
  inset:0,
  pointerEvents:"none",
  zIndex:2000
}}
>

{showTop && (

<button
onClick={scrollToTop}
style={{
  position:"absolute",
  top:110,
  right:20,

  width:45,
  height:45,

  borderRadius:"50%",
  border:"none",

  background:"linear-gradient(135deg,#3b82f6,#2563eb)",
  color:"white",

  fontSize:24,
  fontWeight:"900",

  boxShadow:"0 8px 25px rgba(0,0,0,.35)",

  cursor:"pointer",

  pointerEvents:"auto",

  display:"flex",
  alignItems:"center",
  justifyContent:"center"
}}
>
↑
</button>


)}



{showBottom && (
 
 
<button
onClick={scrollToBottom}
style={{
  position:"absolute",
  bottom:20,
  right:20,

  width:45,
  height:45,

  borderRadius:"50%",
  border:"none",

  background:"linear-gradient(135deg,#3b82f6,#2563eb)",
  color:"white",

  fontSize:24,
  fontWeight:"900",

  boxShadow:"0 8px 25px rgba(0,0,0,.35)",

  cursor:"pointer",

  pointerEvents:"auto",

  display:"flex",
  alignItems:"center",
  justifyContent:"center"
}}
>
↓
</button>

 

)}


</div>


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