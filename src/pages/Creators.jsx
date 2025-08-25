import React from 'react';
import HomeButton from '../components/HomeButton';

const Creators = () => {
  return (
    <div style={{ padding: '2rem', height: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
      <HomeButton />
      <h1 style={{ fontSize: '3rem', textAlign: 'center' }}>Creators Page</h1>
      <p style={{ textAlign: 'center', marginTop: '2rem' }}>Welcome to the Creators page!</p>
    </div>
  );
};

export default Creators;