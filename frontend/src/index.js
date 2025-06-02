import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Login from "./Login";
import Registration from "./Registration";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AdminPage from "./AdminDashboard";
import FogFightersMap from "./FogFightersMap";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<Registration />}></Route>
        <Route path="/home" element={<HomePage />}></Route>
        <Route path="/admin" element={<AdminPage />}></Route>
        <Route path="/map" element={<FogFightersMap />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
