import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";

const Trips = () => {
  return (
    <>
      
      <Sidebar />
      <main className="trips-container">
        <h1>Your Trips</h1>
        <div className="trips-tabs">
          <button className="tab-button active">Upcoming</button>
          <button className="tab-button">Past</button>
          <button className="tab-button">Canceled</button>
        </div>
        <div className="trips-list">
          <div className="no-trips-message">
            <FontAwesomeIcon icon={["fas", "suitcase-rolling"]} />
            <h2>No trips yet</h2>
            <p>Time to dust off your bags and start planning your next adventure</p>
            <a href="/" className="cta-button">Start searching</a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Trips;