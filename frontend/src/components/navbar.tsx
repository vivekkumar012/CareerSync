"use client";

import Link from "next/link";
import React, { useState } from "react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isAuth = false;

  const logoutHandler = () => {};
  return (
    <nav className="z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
                <Link href={"/"} className="flex items-center gap-1 group">
                    <div className="text-2xl font-bold tracking-tight">
                        <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">Career</span>
                        <span className="text-red-500">Sync</span>
                    </div>
                </Link>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
