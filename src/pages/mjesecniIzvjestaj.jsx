import { useEffect, useState } from "react";
import { onValue, child } from "firebase/database";
import { rootRestoran } from "../firebase/refs";

export default function MjesecniIzvjestaj() {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const mjeseciRef = child(rootRestoran(), "MjeseciRestoran");

    const unsubscribe = onValue(mjeseciRef, (snap) => {
      if (!snap.exists()) {
        setMonths([]);
        return;
      }

      const data = snap.val();

      const sorted = Object.entries(data)
        .map(([key, value]) => {
          // key format: "2025-07"
          const [yearStr, monthStr] = key.split("-");
          const year = Number(yearStr);
          const month = Number(monthStr);

          return {
            name: key,
            value: Number(value),
            sortValue: year * 12 + month
          };
        })
        .sort((a, b) => b.sortValue - a.sortValue); // najnovije prvo

      setMonths(sorted);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f2f2",
        padding: 14,
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          background: "white",
          padding: 18,
          borderRadius: 16,
          marginBottom: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ fontSize: 24, fontWeight: "bold" }}>
          Mjesečni izvještaj
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {months.map((item) => (
          <div
            key={item.name}
            style={{
              background: "white",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.name}</div>

            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              {item.value} €
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}