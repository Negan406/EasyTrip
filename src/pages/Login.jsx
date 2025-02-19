import React from 'react';

const Login = () => {
  return (
    <>
    <br /><br />
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit" className="cta-button">Login</button>
      </form>
    </div>
    </>
  );
};

export default Login; 