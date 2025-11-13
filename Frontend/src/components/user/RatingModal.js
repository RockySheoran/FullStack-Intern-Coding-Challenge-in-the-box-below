import React, { useState } from 'react';

const RatingModal = ({ store, onSubmit, onCancel }) => {
  const [selectedRating, setSelectedRating] = useState(store?.user_rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`modal-star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onStarClick(i) : undefined}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    setError('');
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(selectedRating);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="rating-modal">
        <div className="modal-header">
          <h3>Rate {store?.name}</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="store-info">
            <p className="store-address">{store?.address}</p>
            <div className="current-average">
              <span>Current average: </span>
              {renderStars(Math.round(store?.average_rating || 0))}
              <span className="average-text">
                {store?.average_rating ? store.average_rating.toFixed(1) : '0.0'} 
                ({store?.total_ratings || 0} reviews)
              </span>
            </div>
          </div>

          <div className="rating-section">
            <h4>Your Rating:</h4>
            <div className="rating-stars">
              {renderStars(selectedRating, true, handleStarClick)}
            </div>
            <div className="rating-labels">
              <span className="rating-label">
                {selectedRating === 0 && 'Select a rating'}
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || selectedRating === 0}
            className="btn-submit"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;