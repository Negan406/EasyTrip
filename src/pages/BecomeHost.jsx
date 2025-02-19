import { useState } from "react";
import Sidebar from "../components/Sidebar";
import HostRegistrationModal from "../components/HostRegistrationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BecomeHost = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="host-header">
        <h1>Become a Host</h1>
        <p>Earn extra income and unlock new opportunities by sharing your space</p>
        <button className="cta-button" onClick={() => setIsModalOpen(true)}>
          Get Started
        </button>
      </main>
      <div className="host-features">
        {[{ icon: "fas fa-money-bill-wave", title: "Earn Extra Income" }, 
          { icon: "fas fa-shield-alt", title: "Host with Confidence" },
          { icon: "fas fa-hand-holding-heart", title: "Welcome Guests" }]
          .map((feature, index) => (
            <div key={index} className="feature-card">
              <FontAwesomeIcon icon={feature.icon.split(" ")} />
              <h3>{feature.title}</h3>
              <p>{feature.title === "Earn Extra Income" ? 
                "Turn your extra space into extra income and pursue what you love." :
                feature.title === "Host with Confidence" ?
                  "We've got your back with liability insurance and property damage protection." :
                  "Meet interesting people from around the world and create lasting connections."}</p>
            </div>
          ))}
      </div>
      <HostRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default BecomeHost;