
import React from 'react';

interface GlassCircleProps {
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: string;
  opacity?: string;
  blur?: string;
  gradient?: string;
}

export const GlassCircle: React.FC<GlassCircleProps> = ({ 
  size, top, left, right, bottom, delay = "0s", opacity = "opacity-30", blur = "blur-3xl",
  gradient = "from-blue-100/50 via-purple-100/30 to-rose-100/50"
}) => {
  return (
    <div 
      className={`absolute rounded-full bg-gradient-to-br ${gradient} ${opacity} ${blur} animate-pulse`}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        animationDelay: delay,
        animationDuration: '10s'
      }}
    />
  );
};
