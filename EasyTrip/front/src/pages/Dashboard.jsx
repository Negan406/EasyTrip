import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faExclamationTriangle,
  faDollarSign, faHouseUser, faClipboardList,
  faChartLine, faDatabase, faServer, faUserShield, faChartPie
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Add loading animation constants
const LOADING_MESSAGES = [
  "Preparing your admin dashboard...",
  "Analyzing system metrics...",
  "Crunching the numbers...",
  "Fetching user statistics...",
  "Generating insights..."
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
    registeredUsers: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [navigate]);

  // Add loading message rotation
  useEffect(() => {
    if (!loading) return;
    
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000); // Change message every 2 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all listings to get total and status counts
      const listingsResponse = await axios.get('http://localhost:8000/api/listings', { headers });
      const allListings = listingsResponse.data.data || [];
      
      // Fetch pending listings
      const pendingResponse = await axios.get('http://localhost:8000/api/listings/pending', { headers });
      const pendingListings = pendingResponse.data.listings || [];

      // Fetch all users
      const usersResponse = await axios.get('http://localhost:8000/api/users', { headers });
      const allUsers = usersResponse.data.users || [];

      // Calculate listing statistics
      const approvedListings = allListings.filter(listing => listing.status === 'approved');
      const rejectedListings = allListings.filter(listing => listing.status === 'rejected');

      setStats({
        totalListings: allListings.length,
        approvedListings: approvedListings.length,
        pendingListings: pendingListings.length,
        rejectedListings: rejectedListings.length,
        registeredUsers: allUsers.length,
        totalBookings: 0 // This will be updated when bookings endpoint is available
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Listing Statistics',
      },
    },
  };

  const listingStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          stats.approvedListings,
          stats.pendingListings,
          stats.rejectedListings
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="dashboard-loading-content">
          <LoadingSpinner size="large" color="#007bff" />
          <h3 className="loading-title">{loadingMessage}</h3>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
          <div className="loading-metrics">
            <span className="metric"><FontAwesomeIcon icon={faUsers} /> Users</span>
            <span className="metric"><FontAwesomeIcon icon={faHouseUser} /> Listings</span>
            <span className="metric"><FontAwesomeIcon icon={faChartPie} /> Analytics</span>
            <span className="metric"><FontAwesomeIcon icon={faUserShield} /> Admin</span>
          </div>
        </div>
        <div className="floating-icons">
          {[
            faUsers, faHouseUser, faClipboardList, faChartLine, 
            faDatabase, faServer, faExclamationTriangle, faDollarSign
          ].map((icon, i) => (
            <FontAwesomeIcon 
              key={i} 
              icon={icon} 
              className={`floating-icon icon-${i + 1}`} 
            />
          ))}
        </div>
        <style>{`
          .dashboard-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            position: relative;
            background-color: #f8f9fa;
          }
          
          .dashboard-loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: fadeIn 0.5s ease;
            z-index: 1;
          }
          
          .loading-title {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
            font-weight: 600;
            color: #343a40;
          }
          
          .loading-progress {
            width: 80%;
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 1rem;
          }
          
          .progress-bar {
            height: 100%;
            width: 0;
            background: linear-gradient(to right, #007bff, #6610f2);
            border-radius: 3px;
            animation: progress 2s ease infinite;
          }
          
          .loading-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 1.5rem;
          }
          
          .metric {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: breathe 3s infinite ease-in-out;
          }
          
          .metric:nth-child(1) { animation-delay: 0s; }
          .metric:nth-child(2) { animation-delay: 0.5s; }
          .metric:nth-child(3) { animation-delay: 1s; }
          .metric:nth-child(4) { animation-delay: 1.5s; }
          
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          .floating-icons {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
          }
          
          .floating-icon {
            position: absolute;
            color: rgba(0, 123, 255, 0.1);
            font-size: 20px;
            animation-name: float;
            animation-duration: 10s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          
          .icon-1 { left: 10%; top: 20%; animation-delay: 0s; font-size: 18px; }
          .icon-2 { left: 20%; top: 60%; animation-delay: 1s; font-size: 24px; }
          .icon-3 { left: 30%; top: 30%; animation-delay: 2s; font-size: 16px; }
          .icon-4 { left: 50%; top: 70%; animation-delay: 3s; font-size: 22px; }
          .icon-5 { left: 65%; top: 40%; animation-delay: 4s; font-size: 19px; }
          .icon-6 { left: 75%; top: 20%; animation-delay: 5s; font-size: 25px; }
          .icon-7 { left: 85%; top: 50%; animation-delay: 6s; font-size: 17px; }
          .icon-8 { left: 90%; top: 80%; animation-delay: 7s; font-size: 21px; }
          
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
            25% { transform: translateY(-20px) rotate(5deg); opacity: 0.3; }
            50% { transform: translateY(-35px) rotate(0deg); opacity: 0.1; }
            75% { transform: translateY(-20px) rotate(-5deg); opacity: 0.3; }
            100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          }
          
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 95%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @media (max-width: 768px) {
            .dashboard-loading-content {
              padding: 2rem;
            }
            
            .loading-title {
              font-size: 1.2rem;
            }
            
            .loading-metrics {
              flex-direction: column;
              align-items: center;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="dashboard-container">
        <div className="admin-dashboard" data-aos="fade-up">
          <h1>Admin Dashboard</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <FontAwesomeIcon icon={faUsers} className="stat-icon primary" />
              <div className="stat-content">
                <h3>Total Users</h3>
                <p>{stats.registeredUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faHouseUser} className="stat-icon" />
              <div className="stat-content">
                <h3>Total Listings</h3>
                <p>{stats.totalListings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faClipboardList} className="stat-icon success" />
              <div className="stat-content">
                <h3>Approved Listings</h3>
                <p>{stats.approvedListings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faClipboardList} className="stat-icon warning" />
              <div className="stat-content">
                <h3>Pending Listings</h3>
                <p>{stats.pendingListings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faExclamationTriangle} className="stat-icon error" />
              <div className="stat-content">
                <h3>Rejected Listings</h3>
                <p>{stats.rejectedListings}</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Listing Status Distribution</h3>
              <div className="doughnut-container">
                <Doughnut 
                  data={listingStatusData}
                  options={{
                    ...chartOptions,
                    cutout: '70%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          margin-left: 20px;
          padding: 2rem;
        }

        .admin-dashboard {
          background: #ffffff;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background-color: #ffe6e6;
          color: #dc3545;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .stat-card {
          background: linear-gradient(145deg, #ffffff, #f5f5f5);
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 5px 5px 15px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 5px 8px 20px rgba(0,0,0,0.08);
        }

        .stat-icon {
          font-size: 2rem;
          color: #007bff;
          padding: 1rem;
          background: rgba(0,123,255,0.1);
          border-radius: 12px;
        }

        .stat-icon.warning {
          color: #ffc107;
          background: rgba(255,193,7,0.1);
        }

        .stat-icon.success {
          color: #28a745;
          background: rgba(40,167,69,0.1);
        }

        .stat-icon.error {
          color: #dc3545;
          background: rgba(220,53,69,0.1);
        }

        .stat-icon.primary {
          color: #007bff;
          background: rgba(0,123,255,0.1);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .chart-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-5px);
        }

        .doughnut-container {
          position: relative;
          height: 300px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-card {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
