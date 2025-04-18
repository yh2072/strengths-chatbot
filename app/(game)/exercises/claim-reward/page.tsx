'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { triggerPointsUpdate } from '@/lib/client/events';

export default function ClaimRewardPage() {
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get('id');
  
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!exerciseId) {
      setError('缺少练习ID参数');
    }
  }, [exerciseId]);
  
  const claimReward = async () => {
    if (claiming || !exerciseId) return;
    
    setClaiming(true);
    try {
      const response = await fetch('/api/game/complete-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          claim: true
        }),
      });
      
      const data = await response.json();
      setClaimResult(data);
      
      if (response.ok && data.success) {
        // 触发积分更新事件
        if (typeof data.totalPoints === 'number') {
          triggerPointsUpdate(data.totalPoints);
        }
      } else {
        setError(data.error || '领取奖励失败');
      }
    } catch (error) {
      console.error('领取奖励出错:', error);
      setError('网络错误，请重试');
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className="container max-w-lg mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-indigo-800 mb-2">练习完成奖励</h1>
          <p className="text-gray-600">
            恭喜完成练习！请领取您的积分奖励。
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {claimResult ? (
          <div className="text-center mb-6">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-4">
              <p className="font-medium mb-1">奖励领取成功!</p>
              <p className="text-lg font-bold mb-1">+{claimResult.pointsAwarded} 积分</p>
              <p className="text-sm">当前总积分: {claimResult.totalPoints}</p>
            </div>
            
            <Link 
              href="/exercises" 
              className="inline-block px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              返回练习列表
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={claimReward}
              disabled={claiming || !exerciseId}
              className={`
                px-8 py-4 rounded-lg font-medium text-white text-lg mb-6 w-full max-w-xs
                ${claiming || !exerciseId
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}
                transition duration-200 shadow-md
              `}
            >
              {claiming ? '领取中...' : '领取积分奖励'}
            </button>
            
            <Link 
              href="/exercises" 
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              返回练习列表
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 