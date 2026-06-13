import { useEffect, useState } from "react";
import { get, push, set } from "firebase/database";
import { menuRestoran, ordersRestoran } from "../firebase/refs";
import CartModal from "../components/CartModal";

export default function Naruci() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState({});
  const [category, setCategory] = useState("All");

  const [showCart, setShowCart] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------- LOAD MENU ----------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const snap = await get(menuRestoran());
      if (!snap.exists()) return setMenu([]);

      const data = snap.val();
      const dates = Object.keys(data || {});

      const sorted = dates.sort((a, b) => {
        const [da, ma, ya] = a.split("-");
        const [db, mb, yb] = b.split("-");
        return new Date(`${yb}-${mb}-${db}`) - new Date(`${ya}-${ma}-${da}`);
      });

      const latest = sorted[sorted.length - 1];
      const menuForDate = data?.[latest]?.Podaci;

      const list = Object.keys(menuForDate || {}).map((k) => ({
        id: k,
        ...menuForDate[k],
      }));

      setMenu(list);
      setLoading(false);
    };

    load();
  }, []);

  // ---------------- CATEGORY ----------------
  const categories = [
    "All",
    ...new Set(menu.map((m) => m.category).filter(Boolean)),
  ];

  const filtered =
    category === "All"
      ? menu
      : menu.filter((m) => m.category === category);

  // ---------------- CART ACTIONS ----------------
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];

      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { ...item, qty: 1 },
      };
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const current = prev[id];
      if (!current) return prev;

      const qty = current.qty - 1;

      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return {
        ...prev,
        [id]: { ...current, qty },
      };
    });
  };

  const totalPrice = Object.values(cart).reduce(
    (s, i) => s + Number(i.price) * i.qty,
    0
  );

  // ---------------- ORDER ----------------
  const confirmOrder = async () => {
    if (!user) return alert("Nisi logovan");

    const orderRef = push(ordersRestoran());

    const text = Object.values(cart)
      .map((i) => `${i.qty}x ${i.name}`)
      .join(" ");

    await set(orderRef, {
      orderId: orderRef.key,
      orderById: user.uid,
      orderPersonName: user.ime,
      time: new Date().toLocaleString(),
      status: "pending",
      totalPrice: totalPrice.toFixed(2),
      priprema: "0",
      name: text,
      description: text,
      addittionalInfo: "",
    });

    setCart({});
    setShowCart(false);

    alert("Narudžba poslana!");
  };

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32">

      {/* CATEGORY */}
      <div className="flex gap-2 overflow-auto mb-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap ${
              category === c ? "bg-orange-500 text-black" : "bg-neutral-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* MENU CARDS */}
      <div className="grid gap-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => addToCart(item)}
            className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
          >
            <div className="font-bold">{item.name}</div>
            <div className="text-sm opacity-70">{item.description}</div>
            <div className="text-orange-400">{item.price} €</div>
          </div>
        ))}
      </div>

      {/* BOTTOM BAR */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 p-3">
          <div className="flex justify-between mb-2">
            <span>Stavke: {Object.keys(cart).length}</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-500 text-black py-3 rounded-xl font-bold"
          >
            PREGLED KOŠARICE
          </button>
        </div>
      )}

      {/* CART MODAL */}
      {showCart && (
        <CartModal
          cart={cart}
          setCart={setCart}
          onClose={() => setShowCart(false)}
          onConfirm={confirmOrder}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}