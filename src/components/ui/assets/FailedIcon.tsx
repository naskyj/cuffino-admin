import React from "react";

const FailedIcon = ({ className }: { className?: string }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="50" fill="url(#paint0_linear_failed)" />
    <path
      d="M30 30L70 70M70 30L30 70"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_failed"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF4444" />
        <stop offset="1" stopColor="#CC0000" />
      </linearGradient>
    </defs>
  </svg>
);

export default FailedIcon;
