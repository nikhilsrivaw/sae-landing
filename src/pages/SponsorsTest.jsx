import React, { useState } from 'react';

const SponsorsTest = () => {
  const [step, setStep] = useState(0);

  const testSteps = [
    { name: 'Basic Component', component: () => <div>Basic Test Works</div> },
    { name: 'With Assets', component: () => <div><img src="/logoSAE.png" alt="test" style={{width: '50px'}} />Assets Work</div> },
    { name: 'With GSAP Import', component: () => {
      try {
        const { gsap } = require('gsap');
        return <div>GSAP Import Works</div>;
      } catch (e) {
        return <div>GSAP Import Failed: {e.message}</div>;
      }
    }},
    { name: 'With Components', component: () => {
      try {
        const HomeButton = require('../components/HomeButton').default;
        return <div><HomeButton />Components Work</div>;
      } catch (e) {
        return <div>Component Import Failed: {e.message}</div>;
      }
    }},
    { name: 'LoadingScreen Test', component: () => {
      try {
        const LoadingScreen = require('../components/LoadingScreen').default;
        return <div>LoadingScreen Import Works</div>;
      } catch (e) {
        return <div>LoadingScreen Import Failed: {e.message}</div>;
      }
    }},
    { name: 'Full Original Component', component: () => {
      try {
        const OriginalSponsors = require('./Sponsors').default;
        return <OriginalSponsors />;
      } catch (e) {
        return <div>Original Component Failed: {e.message}</div>;
      }
    }}
  ];

  const CurrentTest = testSteps[step]?.component || (() => <div>No more tests</div>);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <h1>🔍 SPONSORS PAGE DEBUG TEST</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current Test:</strong> {testSteps[step]?.name || 'Complete'}</p>
        <p><strong>Step:</strong> {step + 1} of {testSteps.length}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: step === 0 ? '#333' : '#007acc',
            color: '#fff',
            border: 'none',
            cursor: step === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setStep(Math.min(testSteps.length - 1, step + 1))}
          disabled={step === testSteps.length - 1}
          style={{
            padding: '10px 20px',
            backgroundColor: step === testSteps.length - 1 ? '#333' : '#007acc',
            color: '#fff',
            border: 'none',
            cursor: step === testSteps.length - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>

      <div style={{
        border: '2px solid #333',
        padding: '20px',
        backgroundColor: '#111',
        minHeight: '400px'
      }}>
        <h3>Test Result:</h3>
        <div style={{ marginTop: '10px' }}>
          <CurrentTest />
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>This test isolates components step by step to identify the exact cause of errors.</p>
      </div>
    </div>
  );
};

export default SponsorsTest;