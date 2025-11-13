import React, { useState } from 'react';

const StoreCard = ({ store, onRate, onUpdateRating }) => {
  const [showRatingOptions, setShowRatingOptions] = useState(false);

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onStarClick(i) : undefined}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const handleQuickRate = async (rating) => {
    try {
      if (store.user_rating) {
        await onUpdateRating(store.rating_id, rating);
      } else {
        await onRate(store);
      }
      setShowRatingOptions(false);
    } catch (error) {
      console.error('Error rating store:', error);
    }
  };

  return (
    <div className="store-card">
      <div className="store-header">
        <h3 className="store-name">{store.name}</h3>
        <div className="store-rating">
          <div className="average-rating">
            {renderStars(Math.round(store.average_rating || 0))}
            <span className="rating-text">
              {store.average_rating ? store.average_rating.toFixed(1) : '0.0'}
              ({store.total_ratings || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="store-details">
        <div className="store-address">
          <span className="address-icon">📍</span>
          {store.address}
        </div>
        <div className="store-email">
          <span className="email-icon">✉️</span>
          {store.email}
        </div>
      </div>

      <div className="user-rating-section">
        {store.user_rating ? (
          <div className="current-rating">
            <span className="rating-label">Your rating:</span>
            <div className="user-rating-display">
              {renderStars(store.user_rating)}
              <span className="rating-value">{store.user_rating}/5</span>
            </div>
          </div>
        ) : (
          <div className="no-rating">
            <span className="rating-label">You haven't rated this store yet</span>
          </div>
        )}

        <div className="rating-actions">
          {!showRatingOptions ? (
            <button
              onClick={() => setShowRatingOptions(true)}
              className="rate-btn"
            >
              {store.user_rating ? 'Update Rating' : 'Rate Store'}
            </button>
          ) : (
            <div className="quick-rating">
              <span className="quick-rating-label">Rate:</span>
              <div className="quick-rating-stars">
                {renderStars(0, true, handleQuickRate)}
              </div>
              <button
                onClick={() => setShowRatingOptions(false)}
                className="cancel-rating"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;