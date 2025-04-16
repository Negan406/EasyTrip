import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import BecomeHost from "./pages/BecomeHost";
import AccountSettings from "./pages/AccountSettings";
import Trips from "./pages/Trips";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddListing from "./pages/AddListing";
import ManageListings from "./pages/ManageListings";
import EditListing from "./pages/EditListing";
import Payment from "./pages/Payment";
import ManageBookings from "./pages/ManageBookings";
import "./styles.css";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ClearStorageButton from "./components/ClearStorageButton";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <Router>
      
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} onSearch={handleSearch} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Routes>
        <Route path="/" element={<Home searchTerm={searchTerm} />} />
        <Route path="/listing/:id" element={
          <ErrorBoundary>
            <ListingDetails />
          </ErrorBoundary>
        } />
        <Route path="/become-host" element={<BecomeHost />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/manage-listings" element={<ManageListings />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/manage-bookings" element={<ManageBookings />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;