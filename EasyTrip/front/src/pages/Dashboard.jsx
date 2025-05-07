import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faExclamationTriangle,
  faDollarSign, faHouseUser, faClipboardList 
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
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [navigate]);

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

  if (loading) return <LoadingSpinner />;

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
