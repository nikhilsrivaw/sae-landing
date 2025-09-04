import React, { useState, useEffect } from 'react';
import HomeButton from '../components/HomeButton';
import loadingImage from "../assets/Loadingpage.png";

const LoadingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 10;
        } else {
          clearInterval(timer);
          setLoading(false);
          return prev;
        }
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const styles = {
    loadingScreen: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background:
        'linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url("image03.jpg")',
      backgroundSize: 'cover',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'opacity 0.5s ease-out',
      color: '#fff',
      fontFamily: '"Arial", sans-serif'
    },
    loadingTitle: {
      fontSize: '3.5rem',
      color: '#ff8c00',
      textShadow:
        '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      marginBottom: '30px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    },
    loadingBarContainer: {
      width: '60%',
      maxWidth: '500px',
      height: '30px',
      backgroundColor: '#222',
      borderRadius: '5px',
      border: '2px solid #ff8c00',
      overflow: 'hidden',
      marginBottom: '20px'
    },
    loadingBar: {
      height: '100%',
      width: `${progress}%`, // yaha fix kiya hai
      background: 'linear-gradient(90deg, #ff8c00, #ffaa40)',
      transition: 'width 0.3s ease'
    },
    loadingText: {
      fontSize: '1.5rem',
      color: '#fff',
      textShadow: '2px 2px 0 #000'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <h2 style={styles.loadingTitle}></h2>
        <center>
          <img src= {loadingImage} alt="Loading..." width="300" height="200" />
        </center>
        <div style={styles.loadingBarContainer}>
          <div style={styles.loadingBar}></div>
        </div>
        <p style={styles.loadingText}>
          <center>LOADING {progress}%</center>
        </p>
      </div>
    );
  }

  return <HomeButton />;
};

export default LoadingScreen;
