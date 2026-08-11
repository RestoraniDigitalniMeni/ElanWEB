import { useState } from "react";
import "./ResetDialog.css";
 
export default function ResetDialog({

    open,
    onClose,
    onConfirm

}) {

    const [deleteMonths, setDeleteMonths] = useState(false);
    const [deleteOrders, setDeleteOrders] = useState(false);
    const [loading, setLoading] = useState(false);

const [showPasswordDialog, setShowPasswordDialog] = useState(false);
const [password, setPassword] = useState("");
const [passwordError, setPasswordError] = useState(false);


    if (!open) return null;








const checkPassword = () => {

    if (password === "123") {

        setDeleteMonths(true);
        setShowPasswordDialog(false);
        setPassword("");
        setPasswordError(false);

    } else {

        setPasswordError(true);

    }

};










    const confirm = async () => {

        if (loading) return;

        setLoading(true);

        try {

            await onConfirm({

                deleteMonths,
                deleteOrders

            });

        } finally {

               setLoading(false);

    setDeleteMonths(false);
    setDeleteOrders(false);

        }

    };
	
	
	
 
	
	if (showPasswordDialog) {

    return (

        <div className="resetOverlay">

            <div className="resetDialog">

                <div className="resetHeader">
                    Potvrda
                </div>


                <div className="resetBody">

                    <p>
                        Unesite šifru za brisanje mjesečnih izvještaja
                    </p>


                    <input

                        type="password"

                        value={password}

                        onChange={(e) => {

                            setPassword(e.target.value);
                            setPasswordError(false);

                        }}

                        style={{
                            width:"100%",
                            padding:"10px",
                            borderRadius:"8px",
                            border:"1px solid #ccc",
                            fontSize:"18px"
                        }}

                    />


                    {
                        passwordError &&

                        <p style={{
                            color:"red",
                            fontWeight:"bold"
                        }}>
                            Pogrešna šifra!
                        </p>

                    }


                </div>


                <div className="resetButtons">


                    <button

                        className="btnYes"

                        onClick={checkPassword}

                    >
                        POTVRDI
                    </button>


                    <button

                        className="btnNo"

                        onClick={() => {

                            setShowPasswordDialog(false);
                            setPassword("");
                            setPasswordError(false);

                        }}

                    >
                        ODUSTANI
                    </button>


                </div>


            </div>

        </div>

    );

}
	

    return (

        <div className="resetOverlay">

            <div className="resetDialog">

                <div className="resetHeader">

                    Da li ste sigurni?

                </div>

             <div className="resetBody">

    <div style={{ textAlign: "center" }}>

        <p>
            Ovom akcijom brišete sve podatke!
        </p>

        <p>
            Sve narudžbe i računi će biti obrisani!
        </p>

        <p>
            Ukupna zarada će biti postavljena na 0.
        </p>

    </div>

                    <div className="resetOption">

                        <span>

                            Mjesečni izvještaj

                        </span>

                        <label className="switch">

                   <input

    type="checkbox"

    checked={deleteMonths}

    onChange={(e) => {

        if (e.target.checked) {

            setShowPasswordDialog(true);

        } else {

            setDeleteMonths(false);

        }

    }}

/>

                            <span className="slider"></span>

                        </label>

                    </div>

                    <div className="resetOption">

                        <span>

                            Sve trenutne narudžbe

                        </span>

                        <label className="switch">

                            <input

                                type="checkbox"

                                checked={deleteOrders}

                                onChange={(e) =>

                                    setDeleteOrders(

                                        e.target.checked

                                    )

                                }

                            />

                            <span className="slider"></span>

                        </label>

                    </div>

                </div>

                <div className="resetButtons">

                    <button

                        className="btnYes"

                        disabled={loading}

                        onClick={confirm}

                    >

                        {

                            loading

                                ? "Sačekajte..."

                                : "DA"

                        }

                    </button>

                <button
  className="btnNo"
  disabled={loading}
  onClick={() => {

    setDeleteMonths(false);
    setDeleteOrders(false);

    onClose();

  }}
>
  NE
</button>

                </div>

            </div>

        </div>

    );

}