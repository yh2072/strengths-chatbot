'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TestExercisePage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const autoExerciseId = searchParams.get('exercise');
  
  const testComplete = async (exerciseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/game/complete-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: exerciseId
        }),
      });
      
      const data = await response.json();
      setResult(data);
      
      // 触发积分更新事件
      if (response.ok && data.success) {
        const pointsUpdateEvent = new CustomEvent('pointsUpdated', {
          detail: { points: data.totalPoints }
        });
        window.dispatchEvent(pointsUpdateEvent);
      }
    } catch (error) {
      console.error('测试出错:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testPoints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-points');
      const data = await response.json();
      setResult(data);
      
      if (response.ok && data.success) {
        // 触发刷新事件
        const event = new CustomEvent('pointsUpdated', {});
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('测试出错:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (autoExerciseId) {
      testComplete(autoExerciseId);
    }
  }, [autoExerciseId]);
  
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">练习完成测试工具</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">完成练习测试</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            onClick={() => testComplete('strengths-alignment')}
            disabled={isLoading}
          >
            领取"优势对齐"练习奖励
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={testPoints}
            disabled={isLoading}
          >
            测试积分更新 (+50)
          </button>
        </div>
      </div>
      
      {result && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium mb-2">测试结果:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 