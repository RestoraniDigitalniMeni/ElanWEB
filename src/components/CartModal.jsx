import "./CartModal.css";

export default function CartModal({
  cart,
  onClose,
  onConfirm,
  onAdd,
  onRemove,
}) {
  const items = Object.values(cart);

  const total = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <div className="cartOverlay">
      <div className="cartModal">

        {/* HEADER */}
        <div className="cartHeader">
          <h2>Pregled narudžbe</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ITEMS */}
        <div className="cartItems">
          {items.length === 0 ? (
            <p className="empty">Košarica je prazna</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cartItem">

                <div className="itemInfo">
                  <div className="name">{item.name}</div>
                  <div className="price">
                    {(item.price * item.qty).toFixed(2)} €
                  </div>
                </div>

                <div className="qtyControls">
                  <button onClick={() => onRemove(item.id)}>
                    -
                  </button>

                  <span>{item.qty}x</span>

                  <button onClick={() => onAdd(item)}>
                    +
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="cartFooter">

          <div className="total">
            Total: <span>{total.toFixed(2)} €</span>
          </div>

          <div className="actions">
            <button className="cancel" onClick={onClose}>
              Nazad
            </button>

            <button
              className="confirm"
              onClick={onConfirm}
              disabled={items.length === 0}
            >
              Potvrdi
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}