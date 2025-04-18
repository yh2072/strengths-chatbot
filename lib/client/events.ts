export const triggerPointsUpdate = (points: number) => {
  console.log('触发积分更新事件:', points);
  const event = new CustomEvent('pointsUpdated', {
    detail: { points }
  });
  window.dispatchEvent(event);
  return true;
};

export const setupEventListeners = (callback: (points: number) => void) => {
  const handlePointsUpdate = (event: CustomEvent) => {
    console.log('接收到积分更新事件:', event.detail);
    if (event.detail && typeof event.detail.points === 'number') {
      callback(event.detail.points);
    }
  };
  
  window.addEventListener('pointsUpdated', handlePointsUpdate as EventListener);
  
  return () => {
    window.removeEventListener('pointsUpdated', handlePointsUpdate as EventListener);
  };
}; 