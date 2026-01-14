import React from 'react';

interface Props {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<Props> = ({ steps, currentStep }) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-circle">
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
