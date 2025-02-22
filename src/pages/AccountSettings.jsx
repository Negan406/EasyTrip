import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const AccountSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(user);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    localStorage.setItem('user', JSON.stringify(formData)); // Save changes
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="account-container">
        <h1>Account Settings</h1>
        <div className="account-content">
          <div className="account-menu">
            <a href="#profile" className="account-menu-item active">
              <i className="fas fa-user"></i> Personal Information
            </a>
            <a href="#security" className="account-menu-item">
              <i className="fas fa-lock"></i> Login & Security
            </a>
            <a href="#payments" className="account-menu-item">
              <i className="fas fa-credit-card"></i> Payments & Payouts
            </a>
            <a href="#notifications" className="account-menu-item">
              <i className="fas fa-bell"></i> Notifications
            </a>
            <a href="#privacy" className="account-menu-item">
              <i className="fas fa-shield-alt"></i> Privacy & Sharing
            </a>
          </div>
          <div className="account-details">
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-picture">
                  <i className="fas fa-user-circle"></i>
                  <button className="update-photo">Update photo</button>
                </div>
                <div className="profile-info">
                  <h2>Personal Information</h2>
                  <p>Update your information and how it's shared with the EasyTrip community</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Legal name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your legal name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <button type="submit" className="cta-button">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AccountSettings;