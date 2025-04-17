'use client';

import { useState, useEffect } from 'react';

export function ProgressTracker({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
      <div 
        className="bg-indigo-600 h-2.5 rounded-full animate-progress" 
        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
      ></div>
      
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={`text-xs ${
              index <= currentStep 
                ? 'text-indigo-600 font-medium' 
                : 'text-gray-500'
            }`}
          >
            {step.title}
          </button>
        ))}
      </div>
    </div>
  );
} 