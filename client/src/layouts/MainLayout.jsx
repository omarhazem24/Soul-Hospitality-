import React from 'react';
import { MainHeader } from '../components/layout/MainHeader.jsx';
import { HeroViewport } from '../components/hero/HeroViewport.jsx';
import { SearchFilterBar } from '../components/search/SearchFilterBar.jsx';
import { PropertyGrid } from '../components/inventory/PropertyGrid.jsx';

export const MainLayout = () => {
  return (
    <div className="page-shell">
      <MainHeader />
      <main>
        <HeroViewport />
        <SearchFilterBar />
        <PropertyGrid />
      </main>
    </div>
  );
};
