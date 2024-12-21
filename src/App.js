import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cart from "./pages/Cart"; // Disesuaikan dengan file Cart.jsx
import Checkout from "./pages/Checkout"; // Disesuaikan dengan file Checkout.jsx
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/" element={<Cart isLoggedIn={isLoggedIn} userEmail={userEmail} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />} />
      </Routes>
    </Router>
  );
}

export default App;
