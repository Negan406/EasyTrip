import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple hardcoded login check
    if (email === 'hpop5640@gmail.com' && password === '123456') {
      localStorage.setItem('isLoggedIn', 'true'); // Store login state
      navigate('/'); // Use navigate to redirect
    } else {
      alert('Invalid credentials');
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
        <button type="submit" className="cta-button">Login</button>
      </form>
      <div style={{display: 'flex', gap: '20px'}} className="login-links">
        <Link to="/register">Create an Account</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
    </>
  );
};

export default Login; 