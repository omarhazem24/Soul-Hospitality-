import React, { useMemo } from 'react';
import { Star } from 'lucide-react';

const formatDate = (value) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString();
};

const ReviewStars = ({ value }) => {
  const rounded = Math.round(Number(value) || 0);

  return (
    <div className="flex items-center gap-1" aria-label={`${rounded} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= rounded;

        return (
          <Star
            key={index}
            className="h-4 w-4 text-amber-500"
            fill={filled ? 'currentColor' : 'none'}
            strokeWidth={2}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
};

export default function UnitReviewsDisplay({ reviews = [], unitAverageRating = 0, unitReviewCount = 0, loading = false, error = '' }) {
  const summary = useMemo(() => {
    if (!reviews.length) {
      return {
        averageRating: Number(unitAverageRating || 0),
        reviewCount: Number(unitReviewCount || 0)
      };
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);

    return {
      averageRating: total / reviews.length,
      reviewCount: reviews.length
    };
  }, [reviews, unitAverageRating, unitReviewCount]);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Guest Feedback</p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <div className="text-3xl font-bold text-slate-900">{summary.averageRating.toFixed(1)}</div>
          <ReviewStars value={summary.averageRating} />
          <p className="pb-1 text-sm text-slate-500">{summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet. Be the first guest to share your stay.</p>
      ) : null}

      {reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => {
            const key = review._id || `${review.guestName}-${review.createdAt}`;

            return (
              <article key={key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{review.guestName || 'Guest'}</h4>
                    <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                  </div>
                  <ReviewStars value={review.rating} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
