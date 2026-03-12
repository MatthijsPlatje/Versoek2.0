// client/src/components/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet /> {/* This is where your page components will be rendered */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
