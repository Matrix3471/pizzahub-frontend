import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TrackingPage from "@/pages/TrackingPage";
import RatingPage from "@/pages/RatingPage";
import DashboardCliente from "@/pages/DashboardCliente";
import PrenotaECG from "@/pages/PrenotaECG";
import RegalaPunti from "@/pages/RegalaPunti";
import DashboardPizzeria from "@/pages/DashboardPizzeria";
import DashboardAdmin from "@/pages/DashboardAdmin";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu/:pizzeriaId" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track/:ordineId" element={<TrackingPage />} />
          <Route path="/rate/:ordineId" element={<RatingPage />} />
          <Route path="/dashboard-cliente" element={<DashboardCliente />} />
          <Route path="/prenota-ecg" element={<PrenotaECG />} />
          <Route path="/regala-punti" element={<RegalaPunti />} />
          <Route path="/dashboard-pizzeria/:pizzeriaId" element={<DashboardPizzeria />} />
          <Route path="/admin" element={<DashboardAdmin />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
