import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-16 h-screen md:p-12 p-4">
    <div className="md:w-2/5 w-full">
      <Image src="/logo.svg" alt="Unlokr" width={180} height={100} />
      <div className=" flex h-full w-full  items-center justify-center">
        {children}
      </div>
    </div>
    <div className="w-3/5 hidden shadow-md rounded-lg  md:flex items-center justify-center bg-[#F9FAFB] h-full" />
  </div>
);

export default AuthLayout;
