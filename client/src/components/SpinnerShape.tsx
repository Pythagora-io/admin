import React from 'react';
import Lottie from 'lottie-react';
import animationData from './icons/spinner-animation.json';

interface SpinnerShapeProps {
  className?: string;
}

const SpinnerShape: React.FC<SpinnerShapeProps> = ({ className = 'w-12 h-12' }) => {
  console.log('SpinnerShape: Rendering loading spinner');
  
  return (
    <div className="flex justify-center items-center">
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        className={`${className}`}
      />
    </div>
  );
};

export default SpinnerShape;