

const Register = () => {
  return (
    <>
    <br /><br />
    <div className="register-container">
      <h1>inscription</h1>
      <form className="register-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" name="confirm-password" required />
        </div>
        <button type="submit" className="cta-button">Register</button>
      </form>
    </div>
    </>
  );
};

export default Register; 