'use client';

import { useState } from 'react';
import { triggerPointsUpdate } from '@/lib/client/events';

export function RewardClaim({ exerciseId, onClose, showAlert = true }) {
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  
  const claimReward = async () => {
    if (claiming) return;
    
    setClaiming(true);
    try {
      const response = await fetch('/api/game/complete-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          claim: true // 标记这是领取奖励的请求
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('奖励领取响应:', data);
        setClaimResult(data);
        
        // 显式触发积分更新事件
        if (data.success && typeof data.totalPoints === 'number') {
          triggerPointsUpdate(data.totalPoints);
          
          if (showAlert) {
            const displayPoints = data.pointsAwarded !== undefined ? data.pointsAwarded : '未知';
            alert(`恭喜！成功领取了 ${displayPoints} 积分奖励！总积分：${data.totalPoints}`);
          }
          
          // 延迟后刷新页面以确保积分更新显示
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        console.error('奖励领取失败:', response.status);
        setClaimResult({ success: false, error: '领取失败，请重试' });
      }
    } catch (error) {
      console.error('领取奖励出错:', error);
      setClaimResult({ success: false, error: error.message });
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-indigo-800 mb-2">恭喜完成练习!</h2>
          <p className="text-gray-600 mb-4">您已完成练习，可以领取积分奖励了。</p>
          
          {claimResult ? (
            <div className={`p-4 rounded-lg mb-4 ${claimResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              {claimResult.success ? (
                <div className="text-green-700">
                  <p className="font-medium">奖励领取成功!</p>
                  <p>获得 {claimResult.pointsAwarded} 积分</p>
                  <p className="text-sm mt-1">当前总积分: {claimResult.totalPoints}</p>
                </div>
              ) : (
                <div className="text-red-700 font-medium">
                  {claimResult.error || "领取失败，请重试"}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={claimReward}
              disabled={claiming}
              className={`
                w-full py-3 rounded-lg font-medium text-white mb-4
                ${claiming 
                  ? 'bg-gray-400' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}
                transition duration-200 shadow-md
              `}
            >
              {claiming ? '领取中...' : '领取积分奖励'}
            </button>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/exercises'}
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              返回练习列表
            </button>
            
            {!claiming && (
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                稍后领取
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 