import React from 'react';

const LoadingSpinner = ({ className, message }: { className?: string; message?: string;}) => {
  return (
    <div id="loading-spinner" className={className}>
      <div className="flex flex-col items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        {message && <p className="mt-2 text-center spinner-message py-4">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
