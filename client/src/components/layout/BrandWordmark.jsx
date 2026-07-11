import React from 'react';

const LOGO_URL = 'https://res.cloudinary.com/ukaklyhf/image/upload/v1783000694/images__1_-removebg-preview_ira5jp.png';

export const BrandWordmark = ({ inverse = false, className = '' }) => {
  return (
    <img
      src={LOGO_URL}
      alt="Soul Hospitality Logo"
      className={[
        inverse ? 'h-24 w-auto object-contain brightness-0 invert' : 'h-24 w-auto object-contain',
        className,
        'transition-all duration-300 ease-out hover:opacity-90'
      ].join(' ')}
    />
  );
};
