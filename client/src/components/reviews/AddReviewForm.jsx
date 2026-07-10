import React, { useState } from 'react';
import { Star } from 'lucide-react';

const MAX_COMMENT_LENGTH = 500;

export default function AddReviewForm({ onSubmit, submitting = false }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const activeRating = hoverRating || rating;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError('Please write a short comment about your stay.');
      return;
    }

    setError('');
    const success = await onSubmit({ rating, comment: trimmedComment });

    if (success) {
      setRating(0);
      setHoverRating(0);
      setComment('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-900">Add Your Review</h3>
        <p className="text-sm text-slate-600">Share your experience to help future guests choose with confidence.</p>
      </div>

      <div className="flex items-center gap-2" role="radiogroup" aria-label="Select star rating">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const filled = value <= activeRating;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-300 hover:text-amber-500"
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className="h-5 w-5"
                strokeWidth={2}
                fill={filled ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-semibold text-slate-700">Comment</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="What stood out during your stay?"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-[#283f5e] focus:ring-2 focus:ring-[#283f5e]/20"
        />
        <p className="text-xs text-slate-500">{comment.length}/{MAX_COMMENT_LENGTH}</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Post review'}
      </button>
    </form>
  );
}
