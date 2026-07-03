import React, { useEffect, useState } from 'react';
import { createAdminSlideshow, deleteAdminSlideshow, fetchAdminSlideshows } from '../api/http.js';

export const AdminSlideshow = () => {
  const [slides, setSlides] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadSlides = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchAdminSlideshows();
      setSlides(Array.isArray(response) ? response : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      setMessage('Please choose an image before submitting.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      await createAdminSlideshow(formData);
      setImageFile(null);
      event.target.reset();
      setMessage('Slideshow image uploaded successfully.');
      await loadSlides();
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slideId) => {
    try {
      await deleteAdminSlideshow(slideId);
      await loadSlides();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Slideshow Banner Controller</p>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-brand">Homepage slideshow assets</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border border-slate-200 bg-white p-6">
        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
            required
          />
        </label>

        {message ? <div className="border border-slate-200 bg-slate-50 p-3 text-sm text-brand/75">{message}</div> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-70"
        >
          {submitting ? 'Uploading...' : 'Upload Banner'}
        </button>
      </form>

      {loading ? (
        <div className="border border-slate-200 bg-slate-50 p-4 text-sm uppercase tracking-[0.18em] text-brand/70">
          Loading slideshow banners...
        </div>
      ) : null}

      {error ? <div className="border border-slate-200 bg-slate-50 p-4 text-sm text-brand/75">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((slide) => (
          <article key={slide._id} className="overflow-hidden border border-slate-200 bg-white shadow-[0_18px_60px_rgba(40,63,94,0.06)]">
            <img src={slide.imageUrl} alt={slide.caption || 'Slideshow banner'} className="h-56 w-full object-cover" />
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/60">Banner</p>
                  <h2 className="mt-2 text-lg font-semibold uppercase tracking-[0.14em] text-brand">
                    {slide.caption || 'Untitled slide'}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.16em] text-brand">Order {slide.order ?? 0}</span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(slide._id)}
                className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand"
              >
                Delete Banner
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
