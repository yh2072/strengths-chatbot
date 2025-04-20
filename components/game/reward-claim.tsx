'use client';

import { useState } from 'react';
import { triggerPointsUpdate } from '@/lib/client/events';

// 定义接口
interface RewardClaimProps {
  exerciseId: string;
  onClose: () => void;
  showAlert?: boolean;
}

// 定义响应结果类型
interface ClaimResult {
  success: boolean;
  totalPoints?: number;
  pointsAwarded?: number;
  error?: string;
  message?: string;
}

export function RewardClaim({ exerciseId, onClose, showAlert = true }: RewardClaimProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  
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
    } catch (error: unknown) {
      console.error('领取奖励出错:', error);
      setClaimResult({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      });
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-indigo-100 mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl sm:text-4xl">🎉</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">恭喜完成练习!</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">您已完成练习，可以领取积分奖励了。</p>
          
          {claimResult ? (
            <div className={`p-4 sm:p-5 rounded-xl mb-4 sm:mb-6 ${claimResult.success ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100' : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-100'}`}>
              {claimResult.success ? (
                <div className="text-green-700">
                  <p className="font-bold text-base sm:text-lg mb-1">奖励领取成功!</p>
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">+{claimResult.pointsAwarded}</span>
                    <span className="text-xs sm:text-sm text-amber-600">积分</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">当前总积分: {claimResult.totalPoints}</p>
                </div>
              ) : (
                <div className="text-red-700 font-medium text-sm sm:text-base">
                  {claimResult.error || "领取失败，请重试"}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={claimReward}
              disabled={claiming}
              className={`
                w-full py-2.5 sm:py-3.5 rounded-xl font-medium text-white mb-4 sm:mb-6 text-sm sm:text-base
                ${claiming 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg'}
              `}
            >
              {claiming ? '领取中...' : '领取积分奖励'}
            </button>
          )}
          
          <div className="flex justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
            <button
              onClick={() => window.location.href = '/exercises'}
              className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回练习列表
            </button>
            
            {!claiming && (
              <button
                onClick={onClose}
                className="font-medium text-gray-500 hover:text-gray-700 hover:underline"
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