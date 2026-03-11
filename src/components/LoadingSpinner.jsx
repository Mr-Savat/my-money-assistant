import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 16, text = '', className = '' }) => {
  return (
    <span className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader size={size} className="animate-spin" />
      {text && <span>{text}</span>}
    </span>
  );
};

export default LoadingSpinner;