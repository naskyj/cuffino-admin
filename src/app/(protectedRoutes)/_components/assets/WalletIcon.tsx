import React from "react";

const WalletIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M18.3334 9.99998V14.1666C18.3334 16.6666 16.6667 18.3333 14.1667 18.3333H5.83335C3.33335 18.3333 1.66669 16.6666 1.66669 14.1666V9.99998C1.66669 7.73331 3.03335 6.14998 5.15835 5.88331C5.37502 5.84998 5.60002 5.83331 5.83335 5.83331H14.1667C14.3834 5.83331 14.5917 5.84164 14.7917 5.87497C16.9417 6.12497 18.3334 7.71665 18.3334 9.99998Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.7928 5.87502C14.5928 5.84169 14.3845 5.83336 14.1678 5.83336H5.83448C5.60115 5.83336 5.37615 5.85003 5.15948 5.88336C5.27615 5.65003 5.44282 5.43336 5.64282 5.23336L8.35115 2.51669C9.49282 1.38335 11.3428 1.38335 12.4845 2.51669L13.9428 3.9917C14.4762 4.5167 14.7595 5.18335 14.7928 5.87502Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.3334 10.4167H15.8334C14.9167 10.4167 14.1667 11.1667 14.1667 12.0834C14.1667 13 14.9167 13.75 15.8334 13.75H18.3334"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default WalletIcon;
