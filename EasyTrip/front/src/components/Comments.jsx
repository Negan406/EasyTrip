import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser } from "@fortawesome/free-solid-svg-icons";

const Comments = ({ listingId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [canComment, setCanComment] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check login status and get user name
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName');
    setIsLoggedIn(loggedIn);
    setUserName(name || '');
    
    // Load existing comments
    const allComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(allComments[listingId] || []);

    if (loggedIn) {
      // Check if user can comment (has completed payment)
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      const hasCompletedPayment = trips.some(trip => 
        trip.listing.id === parseInt(listingId) && 
        trip.paymentStatus === 'completed'
      );
      setCanComment(hasCompletedPayment);
    } else {
      setCanComment(false);
    }
  }, [listingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment || rating === 0 || !isLoggedIn) return;

    const newCommentObj = {
      id: Date.now(),
      text: newComment,
      rating,
      userName: userName,
      userEmail: localStorage.getItem('userEmail'),
      date: new Date().toISOString()
    };

    // Save to localStorage
    const allComments = JSON.parse(localStorage.getItem('comments')) || {};
    const listingComments = allComments[listingId] || [];
    allComments[listingId] = [...listingComments, newCommentObj];
    localStorage.setItem('comments', JSON.stringify(allComments));

    // Update state
    setComments(prev => [...prev, newCommentObj]);
    setNewComment('');
    setRating(0);
  };

  return (
    <div className="comments-section">
      <h2>Reviews</h2>
      
      {!isLoggedIn && (
        <div className="login-message">
          <p>Please <a href="/login">log in</a> to leave a review.</p>
        </div>
      )}
      
      {isLoggedIn && !canComment && (
        <div className="booking-message">
          <p>You can leave a review after completing a booking for this property.</p>
        </div>
      )}
      
      {isLoggedIn && canComment && (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="rating-input">
            {[...Array(7)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                className={`star ${index < rating ? 'active' : ''} ${index < hoveredStar ? 'hovered' : ''}`}
                onClick={() => setRating(index + 1)}
                onMouseEnter={() => setHoveredStar(index + 1)}
                onMouseLeave={() => setHoveredStar(0)}
              />
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience..."
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No reviews yet. Be the first to share your experience!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment" data-aos="fade-up">
              <div className="comment-header">
                <div className="user-info">
                  <FontAwesomeIcon icon={faUser} className="user-icon" />
                  <span className="user-name">{comment.userName || 'Anonymous'}</span>
                </div>
                <div className="rating">
                  {[...Array(7)].map((_, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={faStar}
                      className={`star ${index < comment.rating ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <p className="comment-text">{comment.text}</p>
              <span className="comment-date">
                {new Date(comment.date).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      <style>
        {`
        .comments-section {
          margin-top: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .login-message, .booking-message, .no-comments {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
        }

        .login-message a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }

        .login-message a:hover {
          text-decoration: underline;
        }

        .comment-form {
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating-input {
          display: flex;
          gap: 0.5rem;
          font-size: 1.5rem;
        }

        .star {
          cursor: pointer;
          color: #ddd;
          transition: color 0.2s ease;
        }

        .star.active {
          color: #ffd700;
        }

        .star.hovered {
          color: #ffc107;
        }

        textarea {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          min-height: 100px;
          resize: vertical;
        }

        button {
          padding: 0.8rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background: #0056b3;
        }

        .comments-list {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment {
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #f8f9fa;
          transition: transform 0.3s ease;
        }

        .comment:hover {
          transform: translateY(-2px);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-icon {
          color: #666;
          font-size: 1.2rem;
        }

        .user-name {
          font-weight: bold;
          color: #333;
        }

        .rating {
          display: flex;
          gap: 0.25rem;
        }

        .comment-text {
          color: #444;
          line-height: 1.5;
          margin: 0.5rem 0;
        }

        .comment-date {
          display: block;
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
        }
        `}
      </style>
    </div>
  );
};

Comments.propTypes = {
  listingId: PropTypes.string.isRequired
};

export default Comments;
