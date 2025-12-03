import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ListingsPage from "./pages/ListingsPage";
import NewListingPage from "./pages/NewListingPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import MyTripsPage from "./pages/MyTripsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EditListingPage from "./pages/EditListingPage";


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<NewListingPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/listings/:id/edit" element={<EditListingPage />} />


        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
