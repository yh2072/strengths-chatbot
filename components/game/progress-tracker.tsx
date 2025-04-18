'use client';

import { useState, useEffect } from 'react';

export function ProgressTracker({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full mb-4 sm:mb-6">
      <div className="relative w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full h-2.5 sm:h-3 mb-3 sm:mb-4 shadow-inner overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all ease-out duration-500" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, 
                  boxShadow: '0 0 10px rgba(79, 70, 229, 0.3)' }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 sm:mt-3 flex-wrap gap-y-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-300 transform ${
              index <= currentStep 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-md hover:shadow-lg' 
                : 'text-gray-500 bg-white hover:bg-gray-100 border border-gray-200'
            } ${index === currentStep ? 'scale-110' : ''}`}
          >
            {step.title}
          </button>
        ))}
      </div>
    </div>
  );
} 