import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Notification = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="close-button">&times;</button>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number, // Duration in milliseconds
};

export default Notification; 