'use client';

import { useState, useEffect } from 'react';

export function StepProgress({ 
  currentStep, 
  totalSteps, 
  isLoading, 
  canProceed,
  onNextStep
}) {
  return (
    <div className="fixed bottom-20 right-4 sm:right-6 bg-white rounded-xl shadow-lg p-2.5 sm:p-3 flex flex-col items-center border border-indigo-100 animate-in slide-in-from-right-2 duration-300 w-[calc(100%-2rem)] sm:w-auto max-w-[250px] sm:max-w-none mx-auto sm:mx-0">
      <div className="text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        步骤 {currentStep + 1}/{totalSteps}
      </div>
      
      <div className="w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full h-2 mb-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <button
        onClick={onNextStep}
        disabled={isLoading || !canProceed}
        className={`
          w-full text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ${
            isLoading || !canProceed
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 shadow-md'
          }
        `}
      >
        {isLoading ? 
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            等待AI回复...
          </div> 
          : '继续下一步'
        }
      </button>
    </div>
  );
} 