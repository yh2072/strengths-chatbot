'use client';

import { useEffect, useState } from 'react';

export default function ParticleBackground() {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // 只在客户端生成粒子
    const newParticles = Array.from({ length: 20 }, () => ({
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10
    }));
    
    setParticles(newParticles);
  }, []);
  
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      {particles.map((particle, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animation: `float ${particle.duration}s linear infinite`
          }}
        ></div>
      ))}
    </div>
  );
} 