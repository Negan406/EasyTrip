import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const Comments = ({ listingId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/reviews?listing_id=${listingId}`);
        console.log("Reviews API response:", response.data);
        
        let reviewsData;
        // Handle different response formats
        if (response.data.success) {
          // New format
          reviewsData = response.data.data || [];
        } else {
          // Old format
          reviewsData = response.data.data || response.data || [];
        }
        
        setReviews(reviewsData);
        
        // Calculate average rating and total reviews
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(total / reviewsData.length);
          setTotalReviews(reviewsData.length);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    const checkReviewEligibility = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        setReviewStatus('Please log in to leave a review.');
        return;
      }

      setIsLoggedIn(true);
      try {
        // First check if user has a completed payment for this listing
        const bookingResponse = await axios.get(`http://localhost:8000/api/bookings/check/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const hasCompletedPayment = bookingResponse.data.hasCompletedPayment;

        if (!hasCompletedPayment) {
          setCanReview(false);
          setReviewStatus('You can only review properties after completing your payment and stay.');
          return;
        }

        // Check if already reviewed
        const reviewResponse = await axios.get(`http://localhost:8000/api/reviews?listing_id=${listingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Reviews response:', reviewResponse.data);
        
        const userReviews = reviewResponse.data.data || [];
        const currentUserId = parseInt(localStorage.getItem('userId'));
        
        const hasAlreadyReviewed = userReviews.some(review => 
          review.user_id === currentUserId
        );

        console.log('Current user ID:', currentUserId, 'Has already reviewed:', hasAlreadyReviewed);

        if (hasAlreadyReviewed) {
          setCanReview(false);
          setReviewStatus('You have already reviewed this property.');
        } else {
          setCanReview(true);
          setReviewStatus('');
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setReviewStatus('Error checking review eligibility. Please try again later.');
      }
    };

    fetchReviews();
    checkReviewEligibility();
  }, [listingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview || rating === 0 || !isLoggedIn) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post('http://localhost:8000/api/reviews', {
        listing_id: listingId,
        rating: rating,
        comment: newReview
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const newReviewData = response.data.data;
        
        // Update reviews list
        setReviews(prev => [newReviewData, ...prev]);
        
        // Update total reviews and average rating
        const newTotal = totalReviews + 1;
        const newAverage = ((averageRating * totalReviews) + rating) / newTotal;
        
        setTotalReviews(newTotal);
        setAverageRating(newAverage);
        
        // Reset form
        setNewReview('');
        setRating(0);
        setCanReview(false);
        setReviewStatus('Thank you for your review!');
        setError(null);

        // Update parent components about the new rating
        window.dispatchEvent(new CustomEvent('reviewUpdated', {
          detail: {
            listingId,
            averageRating: newAverage,
            totalReviews: newTotal,
            type: 'add',
            rating: rating
          }
        }));
      } else {
        setError(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId, reviewRating) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Update stats
      const newTotal = totalReviews - 1;
      let newAverage = 0;
      
      if (newTotal > 0) {
        // Recalculate average excluding the deleted review
        const remainingTotal = (averageRating * totalReviews) - reviewRating;
        newAverage = remainingTotal / newTotal;
      }

      setTotalReviews(newTotal);
      setAverageRating(newAverage);

      // Update parent components about the deleted rating
      window.dispatchEvent(new CustomEvent('reviewUpdated', {
        detail: {
          listingId,
          averageRating: newAverage,
          totalReviews: newTotal,
          type: 'delete',
          rating: reviewRating
        }
      }));

      setReviewStatus('Review deleted successfully');
      setCanReview(true);
      setTimeout(() => setReviewStatus(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setError(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="comments-section">
      <div className="reviews-header">
        <h2>Reviews</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <FontAwesomeIcon icon={faStar} className="star active" />
            <span>{averageRating.toFixed(1)}</span>
          </div>
          <span className="total-reviews">({totalReviews} reviews)</span>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {reviewStatus && (
        <div className="booking-message">
          <p>{reviewStatus}</p>
        </div>
      )}
      
      {isLoggedIn && canReview && (
        <form onSubmit={handleSubmit} className="comment-form">
          <h3>Share Your Experience</h3>
          <div className="rating-input">
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                className={`star ${index < rating ? 'active' : ''} ${index < hoveredStar ? 'hovered' : ''}`}
                onClick={() => setRating(index + 1)}
                onMouseEnter={() => setHoveredStar(index + 1)}
                onMouseLeave={() => setHoveredStar(0)}
              />
            ))}
            {rating > 0 && <span className="rating-text">({rating} stars)</span>}
          </div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your experience with this property..."
            required
          />
          <button type="submit" className="submit-review">
            Submit Review
          </button>
        </form>
      )}

      <div className="comments-list">
        {reviews.length === 0 ? (
          <p className="no-comments">No reviews yet. Be the first to share your experience!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="comment" data-aos="fade-up">
              <div className="comment-header">
                <div className="user-info">
                  <FontAwesomeIcon icon={faUser} className="user-icon" />
                  <span className="user-name">{review.user?.name || 'Anonymous'}</span>
                  {review.user?.verified && (
                    <span className="verified-user">
                      <FontAwesomeIcon icon={faCheck} /> Verified Stay
                    </span>
                  )}
                </div>
                <div className="review-actions">
                  <div className="rating">
                    {[...Array(5)].map((_, index) => (
                      <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        className={`star ${index < review.rating ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                  {review.user_id === parseInt(localStorage.getItem('userId')) && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteReview(review.id, review.rating);
                      }}
                      className="delete-review"
                      title="Delete review"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
              <p className="comment-text">{review.comment}</p>
              <span className="comment-date">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
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

        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .rating-summary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .average-rating {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .total-reviews {
          color: #666;
        }

        .error-message {
          padding: 1rem;
          background: #fee;
          color: #c33;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .booking-message {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .comment-form {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .comment-form h3 {
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .rating-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .rating-text {
          font-size: 1rem;
          color: #666;
          margin-left: 0.5rem;
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
          min-height: 120px;
          resize: vertical;
          width: 100%;
          font-family: inherit;
        }

        .submit-review {
          padding: 0.8rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          width: 100%;
        }

        .submit-review:hover {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

        .verified-user {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #28a745;
          background: #e8f5e9;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
        }

        .rating {
          display: flex;
          gap: 0.25rem;
        }

        .comment-text {
          color: #444;
          line-height: 1.6;
          margin: 0.8rem 0;
        }

        .comment-date {
          display: block;
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.8rem;
        }

        .review-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .delete-review {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.2s ease;
          opacity: 0.7;
        }

        .delete-review:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .comment:hover .delete-review {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .comments-section {
            padding: 1rem;
          }

          .reviews-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .comment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
          }
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
