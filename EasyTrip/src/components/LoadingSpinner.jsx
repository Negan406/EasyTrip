import PropTypes from 'prop-types';
import './LoadingSpinner.css'; // Ensure this path is correct

const LoadingSpinner = ({ size = 'medium' }) => {
  const spinnerSize = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }[size];

  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          width: ${spinnerSize};
          height: ${spinnerSize};
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LoadingSpinner;