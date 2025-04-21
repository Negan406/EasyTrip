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
import ManageUsers from './pages/ManageUsers'; // Import the ManageUsers page
import PendingListings from "./pages/PendingListings"; // Add this import
import Dashboard from './pages/Dashboard'; // Add this import
import "./styles.css";
import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ClearStorageButton from "./components/ClearStorageButton";
import AOS from 'aos';
import 'aos/dist/aos.css';


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true
    });
  }, []);

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
        <Route path="/manage-users" element={<ManageUsers />} /> {/* Add route for ManageUsers */}
        <Route path="/pending-listings" element={<PendingListings />} /> {/* Add this route */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add this route */}
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;