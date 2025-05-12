import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('role', user.role);
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <br /><br />
      <div className="login-container">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="cta-button" 
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Login'}
          </button>
        </form>
        <div style={{display: 'flex', gap: '20px'}} className="login-links">
          <Link to="/register">Create an Account</Link>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div><br /><br /><br />

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .error-message {
          color: #dc3545;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          background-color: #ffd2d2;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .cta-button {
          position: relative;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .cta-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .cta-button:not(:disabled):hover {
          background: #0056b3;
        }

        .login-links {
          margin-top: 1rem;
          justify-content: center;
        }

        .login-links a {
          color: #007bff;
          text-decoration: none;
        }

        .login-links a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default Login;