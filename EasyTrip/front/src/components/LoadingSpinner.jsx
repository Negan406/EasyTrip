import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#ff385c', fullScreen = true }) => {
  const spinnerSize = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }[size];

  return (
    <div className={`loading-spinner ${!fullScreen ? 'inline-spinner' : ''}`}>
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize, borderTopColor: color }}></div>
      <style jsx>{`
        .inline-spinner {
          position: relative;
          height: auto;
          width: auto;
          background-color: transparent;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 768px) {
          .loading-spinner {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default LoadingSpinner;