import React from 'react';
import Hero from '../sections/Hero';

const Home = () => {
  // const [heroState, setHeroState] = useState({
  //   experienceStarted: false,
  //   showMainContent: false
  // });

  // const handleHeroStateChange = (newState) => {
  //   setHeroState(newState);
  // };

  return (
    <div className="home-container">
      <Hero />
    </div>
  );
};

export default Home;