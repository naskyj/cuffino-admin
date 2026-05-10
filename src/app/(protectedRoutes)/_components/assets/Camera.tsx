import React from "react";

const Camera = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5.63315 18.3333H14.3665C16.6665 18.3333 17.5831 16.925 17.6915 15.2083L18.1248 8.32499C18.2415 6.52499 16.8081 4.99999 14.9998 4.99999C14.4915 4.99999 14.0248 4.70832 13.7915 4.25832L13.1915 3.04999C12.8081 2.29166 11.8081 1.66666 10.9581 1.66666H9.04981C8.19148 1.66666 7.19148 2.29166 6.80815 3.04999L6.20815 4.25832C5.97481 4.70832 5.50815 4.99999 4.99981 4.99999C3.19148 4.99999 1.75815 6.52499 1.87481 8.32499L2.30815 15.2083C2.40815 16.925 3.33315 18.3333 5.63315 18.3333Z"
      stroke="#0A2463"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.75 6.66666H11.25"
      stroke="#0A2463"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0003 15C11.492 15 12.7087 13.7833 12.7087 12.2917C12.7087 10.8 11.492 9.58334 10.0003 9.58334C8.50866 9.58334 7.29199 10.8 7.29199 12.2917C7.29199 13.7833 8.50866 15 10.0003 15Z"
      stroke="#0A2463"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Camera;
