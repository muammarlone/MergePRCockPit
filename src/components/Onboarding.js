import React, { useState } from 'react';
import './Onboarding.css';

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState('');

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleGetStarted = () => {
    onComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onboarding-step fade-in">
            <div className="onboarding-icon">🚀</div>
            <h2>Welcome to Merge Cockpit!</h2>
            <p>Your new favorite tool for managing GitHub pull requests</p>
            
            <div className="features-list">
              <div className="feature">
                <div className="feature-icon">👀</div>
                <h3>Complete Visibility</h3>
                <p>See all PR activity at a glance</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Fast Management</h3>
                <p>Merge, review, and update PRs instantly</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🤖</div>
                <h3>Smart Insights</h3>
                <p>AI-powered analysis with local Ollama</p>
              </div>
            </div>

            <div className="onboarding-actions">
              <button className="btn-primary" onClick={handleNextStep}>
                Get Started →
              </button>
              <button className="btn-secondary" onClick={handleSkip}>
                Skip Tour
              </button>
            </div>
          </div>
        )}

        {/* Step 2: How It Works */}
        {step === 2 && (
          <div className="onboarding-step fade-in">
            <div className="onboarding-icon">📚</div>
            <h2>How It Works</h2>
            
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Authenticate</h3>
                  <p>Sign in with GitHub, Google, or a personal token</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Select Repository</h3>
                  <p>Choose which GitHub repository to manage</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Manage PRs</h3>
                  <p>View, review, merge, and track all pull requests</p>
                </div>
              </div>
            </div>

            <div className="onboarding-actions">
              <button className="btn-primary" onClick={handleNextStep}>
                Continue →
              </button>
              <button className="btn-secondary" onClick={handleSkip}>
                Skip Tour
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Get Started */}
        {step === 3 && (
          <div className="onboarding-step fade-in">
            <div className="onboarding-icon">✨</div>
            <h2>You're All Set!</h2>
            <p>Ready to take control of your pull requests?</p>
            
            <div className="tips-box">
              <h3>💡 Quick Tips</h3>
              <ul>
                <li>Use the search and filters to find PRs quickly</li>
                <li>Enable Ollama for AI-powered PR insights</li>
                <li>Click on a PR to see full details and reviews</li>
                <li>Use merge options to customize your workflow</li>
              </ul>
            </div>

            <div className="onboarding-actions">
              <button className="btn-primary" onClick={handleGetStarted}>
                Start Using Merge Cockpit
              </button>
            </div>
          </div>
        )}

        <div className="onboarding-progress">
          <div className={`dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
