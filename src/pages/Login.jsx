import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (email === 'admin@gmail.com' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', 'admin');
        navigate('/');
      } else {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', 'user');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <br /><br />
      <div className="login-container">
        <h1>Login</h1>
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
      </div>

      <style jsx>{`
        .cta-button {
          position: relative;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cta-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default Login;