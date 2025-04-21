import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faCalendarCheck, faExclamationTriangle,
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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
  const [dashboardStats, setDashboardStats] = useState({
    totalListings: 0,
    registeredUsers: 0,
    upcomingBookings: 0,
    pendingListings: 0,
    reports: 0,
    revenue: 0,
    weeklyBookings: [],
    userSignups: []
  });

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = () => {
      const listings = JSON.parse(localStorage.getItem('listings')) || [];
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      const pendingListings = JSON.parse(localStorage.getItem('pendingListings')) || [];

      // Generate mock data for weekly bookings
      const weeklyBookings = [
        { day: 'Mon', count: Math.floor(Math.random() * 20) },
        { day: 'Tue', count: Math.floor(Math.random() * 20) },
        { day: 'Wed', count: Math.floor(Math.random() * 20) },
        { day: 'Thu', count: Math.floor(Math.random() * 20) },
        { day: 'Fri', count: Math.floor(Math.random() * 20) },
        { day: 'Sat', count: Math.floor(Math.random() * 20) },
        { day: 'Sun', count: Math.floor(Math.random() * 20) }
      ];

      // Generate mock data for user signups
      const userSignups = [
        { month: 'Jan', count: Math.floor(Math.random() * 100) },
        { month: 'Feb', count: Math.floor(Math.random() * 100) },
        { month: 'Mar', count: Math.floor(Math.random() * 100) },
        { month: 'Apr', count: Math.floor(Math.random() * 100) },
        { month: 'May', count: Math.floor(Math.random() * 100) }
      ];

      setDashboardStats({
        totalListings: listings.length,
        registeredUsers: users.length,
        upcomingBookings: trips.filter(trip => new Date(trip.startDate) > new Date()).length,
        pendingListings: pendingListings.length,
        reports: Math.floor(Math.random() * 10),
        revenue: Math.floor(Math.random() * 50000),
        weeklyBookings,
        userSignups
      });
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getMaxValue = (data, key) => Math.max(...data.map(item => item[key]));

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistics',
      },
    },
  };

  const bookingsData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Weekly Bookings',
        data: dashboardStats.weeklyBookings.map(day => day.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 2,
      },
    ],
  };

  const userSignupsData = {
    labels: dashboardStats.userSignups.map(item => item.month),
    datasets: [
      {
        label: 'User Signups',
        data: dashboardStats.userSignups.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const revenueData = {
    labels: ['Bookings', 'Cancellations', 'Pending'],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-container">
        <div className="admin-dashboard" data-aos="fade-up">
          <h1>Admin Dashboard</h1>
          
          <div className="stats-grid">
            <div className="stat-card">
              <FontAwesomeIcon icon={faHouseUser} className="stat-icon" />
              <div className="stat-content">
                <h3>Total Listings</h3>
                <p>{dashboardStats.totalListings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              <div className="stat-content">
                <h3>Registered Users</h3>
                <p>{dashboardStats.registeredUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCalendarCheck} className="stat-icon" />
              <div className="stat-content">
                <h3>Upcoming Bookings</h3>
                <p>{dashboardStats.upcomingBookings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faClipboardList} className="stat-icon" />
              <div className="stat-content">
                <h3>Pending Listings</h3>
                <p>{dashboardStats.pendingListings}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faExclamationTriangle} className="stat-icon warning" />
              <div className="stat-content">
                <h3>Reports</h3>
                <p>{dashboardStats.reports}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faDollarSign} className="stat-icon success" />
              <div className="stat-content">
                <h3>Revenue</h3>
                <p>${dashboardStats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Weekly Bookings</h3>
              <Bar options={chartOptions} data={bookingsData} />
            </div>

            <div className="chart-card">
              <h3>User Signups Trend</h3>
              <Line options={chartOptions} data={userSignupsData} />
            </div>

            <div className="chart-card">
              <h3>Revenue Distribution</h3>
              <div className="doughnut-container">
                <Doughnut 
                  data={revenueData}
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

      <style jsx>{`
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
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes slideUp {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
