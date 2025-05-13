import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', color = '#ff385c' }) => {
  const spinnerSize = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }[size];

  return (
    <div className="spinner-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-icon">
          <i className="fas fa-heart"></i>
        </div>
      </div>
      <style jsx>{`
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .spinner {
          position: relative;
          width: ${spinnerSize};
          height: ${spinnerSize};
        }
        
        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }
        
        .spinner-ring:before {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 3px solid transparent;
          border-top-color: #ff8a65;
          border-radius: 50%;
          animation: spin 3s linear infinite;
        }
        
        .spinner-ring:after {
          content: '';
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 3px solid transparent;
          border-top-color: #ffbb7c;
          border-radius: 50%;
          animation: spin 1.5s linear infinite reverse;
        }
        
        .spinner-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: calc(${spinnerSize} / 3);
          color: ${color};
          animation: pulse 2s ease infinite;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string
};

export default LoadingSpinner;