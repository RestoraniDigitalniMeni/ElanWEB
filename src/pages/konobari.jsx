import { useEffect, useState } from "react";
import { onValue } from "firebase/database";
import {
  usersRestoran,
  completeOrdersRestoran
} from "../firebase/refs";

export default function Konobari() {
	
	
	
	
	
	
	
	useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

	
	
	
	
	
	
	
  const [ordersData, setOrdersData] = useState({});
  const [users, setUsers] = useState({});
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);

  // UCITAJ KONOBARE (IMENA)
  useEffect(() => {
    const unsub = onValue(usersRestoran(), (snap) => {
      if (snap.exists()) {
        setUsers(snap.val());
      } else {
        setUsers({});
      }
    });

    return () => unsub();
  }, []);

  // UCITAJ NARUDZBE
  useEffect(() => {
    const unsub = onValue(completeOrdersRestoran(), (snap) => {
      if (snap.exists()) {
        setOrdersData(snap.val());
      } else {
        setOrdersData({});
      }
    });

    return () => unsub();
  }, []);

  // RACUNANJE PO user_Id (ISPRAVNO)
  useEffect(() => {
    const result = {};
    let totalSum = 0;

    Object.values(ordersData || {}).forEach((orderGroup) => {
      Object.values(orderGroup || {}).forEach((order) => {

        const userId = order?.user_Id;
        const price = Number(order?.totalPrice || 0);

        if (!userId) return;

        if (!result[userId]) {
          result[userId] = 0;
        }

        result[userId] += price;
        totalSum += price;
      });
    });

    const finalList = Object.keys(result).map((userId) => ({
      id: userId,
      name:
        users[userId]?.name ||
        users[userId]?.ime ||
        users[userId]?.fullName ||
        "Nepoznat korisnik",
      earnings: result[userId]
    }));

    // SORTIRANJE (najbolji prvi)
    finalList.sort((a, b) => b.earnings - a.earnings);

    setList(finalList);
    setTotal(totalSum);

  }, [ordersData, users]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        background: "#f2f2f2",
        minHeight: "100vh"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          marginBottom: 10,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 18
        }}
      >
        Pazar konobara: {total} €
      </div>

      {/* LISTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((item) => (
          <div
            key={item.id}
            style={{
              background: "white",
              padding: 14,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            {/* IME */}
            <div style={{ fontWeight: 600 }}>
              {item.name}
            </div>

            {/* ZARADA */}
            <div style={{ fontWeight: "bold" }}>
              {item.earnings} €
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}