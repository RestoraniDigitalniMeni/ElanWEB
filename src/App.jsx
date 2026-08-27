import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import Racuni from "./pages/Racuni";
import Kitchen from "./pages/Kitchen";
import MjesecniIzvjestaj from "./pages/mjesecniIzvjestaj";
import Konobari from "./pages/konobari";
import Naruci from "./pages/Naruci";
import Info from "./pages/about";
import Uslovi from "./pages/Uslovi";
import Politika from "./pages/Politika";
const getUser = () => {
  try {
    const data = localStorage.getItem("user");
    if (!data || data === "undefined" || data === "null") return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// PROTECTED ROUTE
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  
  const [user, setUser] = useState(getUser());

useEffect(() => {
  const syncUser = () => setUser(getUser());

  window.addEventListener("storage", syncUser);
  window.addEventListener("user-logout", syncUser);
  window.addEventListener("user-login", syncUser);

  syncUser();

  return () => {
    window.removeEventListener("storage", syncUser);
    window.removeEventListener("user-logout", syncUser);
    window.removeEventListener("user-login", syncUser);
  };
}, []);
  
  
  
  
  
  

  

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stats"
          element={
            <ProtectedRoute user={user}>
              <Stats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Racuni"
          element={
            <ProtectedRoute user={user}>
              <Racuni />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute user={user}>
              <Kitchen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mjesecniIzvjestaj"
          element={
            <ProtectedRoute user={user}>
              <MjesecniIzvjestaj />
            </ProtectedRoute>
          }
        />

        <Route
          path="/konobari"
          element={
            <ProtectedRoute user={user}>
              <Konobari />
            </ProtectedRoute>
          }
        />

       <Route
  path="/order"
  element={
    <ProtectedRoute user={user}>
      <Naruci />
    </ProtectedRoute>
  }
/>

<Route 
  path="/about" 
  element={ 
    <ProtectedRoute user={user}> 
      <Info /> 
    </ProtectedRoute> 
  } 
/>

<Route 
  path="/uslovi" 
  element={<Uslovi />} 
/>

<Route 
  path="/politika" 
  element={<Politika />} 
/>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}