import { useEffect } from "react";

export default function CartModal({
  cart,
  increase,
  decrease,
  removeItem,
  totalPrice,
  note,
  setNote,
  onClose,
  onConfirm,
  sending,
  seconds,
}) {





  const vibrate = (time = 60) => {
    if (navigator.vibrate) {
      navigator.vibrate(time);
    }
  };


  const items = Object.values(cart);

 
 useEffect(() => {

  document.body.style.overflow = "hidden";


  const state = {
    cartModal: true
  };


  window.history.pushState(
    state,
    "",
    window.location.href
  );


  const handleBack = () => {

    onClose();

  };


  window.addEventListener(
    "popstate",
    handleBack
  );


  return () => {

    document.body.style.overflow = "";

    window.removeEventListener(
      "popstate",
      handleBack
    );

  };


}, []);
 
 
 

  return (

    <div
      className="
        fixed
        top-0
        left-0
        right-0
        bottom-0
        z-[99999]
        bg-black/80
        backdrop-blur-md
        flex
        items-end
        md:items-center
        justify-center
      "
    >


      <div
        className="
          relative
          w-full
          md:max-w-3xl
          h-[95vh]
          md:h-[90vh]
          bg-neutral-950
          rounded-t-3xl
          md:rounded-3xl
          shadow-2xl
          border
          border-neutral-800
          flex
          flex-col
          overflow-hidden
        "
      >



        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
           px-5
           py-4
           bg-neutral-950/90
            backdrop-blur-xl
            border-b
            border-neutral-800
            shrink-0
          "
        >

      <button
onClick={onClose}
className="
text-orange-500
font-bold
text-lg
"
>
← Nazad
</button>



          <div className="text-center">

            <h1
              className="
                text-white
                text-2xl
                font-bold
              "
            >
              Pregled narudžbe
            </h1>


            <p
              className="
                text-neutral-400
                text-sm
              "
            >
              Izabrani artikli
            </p>

          </div>



      <button
onClick={onClose}
className="
text-white
text-3xl
"
>
×
</button>


        </div>


{/* ITEMS */}

<div
  className="
    flex-1
    overflow-y-auto
  p-4
md:p-5
space-y-4
  "
>


{/* ADDITTIONAL INFO */}

<div
 className="
    bg-neutral-900
    border
    border-neutral-800
    rounded-2xl
    p-4
"
>

<label
  className="
    block
    text-white
    font-bold
    mb-2
  "
>
  Napomena za kuhinju
</label>


<textarea

  value={note}

  onChange={(e)=>
    setNote(e.target.value)
  }

  placeholder="Npr. bez luka, dodatni sos..."

  className="
    w-full
    h-20
    rounded-2xl
    bg-black
    border
    border-neutral-800
    px-4
    py-3
    text-white
    text-sm
    resize-none
    outline-none
  "

/>

</div>



{
items.map(item=>(





              <div
                key={item.id}
                className="
                  bg-neutral-900
                  border
                  border-neutral-800
                  rounded-2xl
                 p-4
                shadow-lg
                "
              >



                <div
                  className="
                    flex
                    justify-between
                    gap-5
                  "
                >


                  <div>

                    <h2
                      className="
                        text-white
                        text-xl
                        font-bold
                      "
                    >
                      {item.name}
                    </h2>


                    <p
                      className="
                        text-neutral-400
                        mt-2
                        text-sm
                        leading-relaxed
                      "
                    >
                      {item.description}
                    </p>


                  </div>




                  <button
  onClick={(e)=>{
    e.stopPropagation();
    vibrate(80);
    removeItem(item.id);
  }}
                    className="
                      text-red-500
                      text-2xl
                      h-fit
                    "
                  >
                    🗑
                  </button>



                </div>







                <div
                  className="
                    flex
                    justify-between
                    items-center
                    mt-6
                  "
                >



                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >



                  <button
  onClick={(e)=>{
    e.stopPropagation();
    vibrate(40);
    decrease(item.id);
  }}
                      className="
                        w-12
                        h-12
                        rounded-2xl
                        bg-neutral-800
                        text-white
                        text-2xl
                        font-bold
                      "
                    >
                      -
                    </button>





                    <span
                      className="
                        text-white
                        text-2xl
                        font-bold
                        min-w-[35px]
                        text-center
                      "
                    >
                      {item.qty}
                    </span>





                <button
  onClick={(e)=>{
    e.stopPropagation();
    vibrate(40);
    increase(item.id);
  }}
                      className="
                        w-12
                        h-12
                        rounded-2xl
                        bg-orange-500
                        text-black
                        text-2xl
                        font-bold
                      "
                    >
                      +
                    </button>



                  </div>





                  <div
                    className="
                      text-orange-500
                      font-bold
                      text-xl
                    "
                  >

                    {(Number(item.price) * item.qty).toFixed(2)} €

                  </div>



                </div>



              </div>


            ))
          }





        



        </div>







        {/* FOOTER */}


        <div
          className="
            shrink-0
            border-t
            border-neutral-800
          p-4
bg-neutral-950/95
backdrop-blur-xl
shadow-[0_-10px_30px_rgba(0,0,0,0.4)]
          "
        >



          <div
            className="
              flex
              justify-between
              items-center
              mb-4
            "
          >


            <span
              className="
                text-white
                text-xl
              "
            >
              Ukupno
            </span>




            <span
              className="
                text-orange-500
                font-bold
                text-3xl
              "
            >
              {totalPrice.toFixed(2)} €
            </span>



          </div>






<button
  disabled={totalPrice <= 0 || sending}
  onClick={() => {
    vibrate(130);
    onConfirm();
  }}
  className={`
    w-full
    rounded-2xl
    py-4
    font-bold
    text-black
    transition-all
    duration-100
    ${
      sending || totalPrice <= 0
        ? "bg-neutral-700 cursor-not-allowed text-white"
        : "bg-orange-500 active:scale-95 active:brightness-90"
    }
  `}
>
  {sending
    ? `SAČEKAJTE ${seconds}s`
    : "POTVRDI NARUDŽBU"}
</button>



        </div>





      </div>



    </div>


  );

}