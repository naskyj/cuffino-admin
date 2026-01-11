import React from "react";

const Menu = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M3 7H21" stroke="#292D32" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H21" stroke="#292D32" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 17H21" stroke="#292D32" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default Menu;
