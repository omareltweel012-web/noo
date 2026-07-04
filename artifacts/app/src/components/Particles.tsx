import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#FFB800', '#f5a623', '#FF4500', '#8A2BE2', '#4169E1'];

export default function Particles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; duration: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full blur-[2px]"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0.4,
          }}
          animate={{
            y: [`${p.y}%`, `${p.y - 20}%`, `${p.y}%`],
            x: [`${p.x}%`, `${p.x + 10}%`, `${p.x}%`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}