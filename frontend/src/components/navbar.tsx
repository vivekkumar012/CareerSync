83"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Briefcase,
  Ghost,
  Home,
  Info,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { useAppData } from "@/context/AppContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
-
  const { isAuth, user, setIsAuth, setUser, loading } = useAppData();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoutHandler = () => {};
  return (
    <nav className="z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center gap-1 group">
              <div className="text-2xl font-bold tracking-tight">
                <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Career
                </span>
                <span className="text-red-500">Sync</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href={"/"}>
              <Button
                variant={"ghost"}
                className="flex items-center gap-2 font-medium"
              >
                <Home size={16} /> Home
              </Button>
            </Link>

            <Link href={"/jobs"}>
              <Button
                variant={"ghost"}
                className="flex items-center gap-2 font-medium"
              >
                <Briefcase size={16} /> Jobs
              </Button>
            </Link>

            <Link href={"/about"}>
              <Button
                variant={"ghost"}
                className="flex items-center gap-2 font-medium"
              >
                <Info size={16} /> About
              </Button>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {
              loading ? "" : <>{isAuth ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-blue-500 cursor-pointer hover:ring-blue-500/40 transition-all">
                      <AvatarImage
                        src={user ? (user.profile_pic as string) : ""}
                        alt={user ? user.name : ""}
                      />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 ">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-56 p-2" align="end">
                  <div className="px-3 py-2 mb-2 border-b">
                    <p className="text-sm font-semibold">Vivek</p>
                    <p className="text-xs opacity-60 truncate">
                      vivek@gmail.com
                    </p>
                  </div>

                  <Link href={"/account"}>
                    <Button
                      className="w-full justify-start gap-2"
                      variant={"ghost"}
                    >
                      <User size={16} /> My Profile
                    </Button>
                  </Link>

                  <Button
                    className="w-full justify-start gap-2 mt-1"
                    variant={"ghost"}
                    onClick={logoutHandler}
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link href={"/login"}>
                <Button className={"gap-2"}>
                  <User size={16} />
                  Sign In
                </Button>
              </Link>
            )}</>
            }

            <ModeToggle />
          </div>

          {/* Mobile menu buttons */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />

            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-accent transition-colors "
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile view */}
      <div
        className={`md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-3 py-3 space-y-1 bg-background/95 backdrop-blur-md ">
          {/* isAuth or user */}
          <Link href={"/"} onClick={toggleMenu}>
            <Button
              className="w-full justify-start gap-3 h-11 cursor-pointer"
              variant={"ghost"}
            >
              <Home size={18} /> Home
            </Button>
          </Link>

          <Link href={"/jobs"} onClick={toggleMenu}>
            <Button
              className="w-full justify-start gap-3 h-11 cursor-pointer"
              variant={"ghost"}
            >
              <Briefcase size={18} /> Jobs
            </Button>
          </Link>

          <Link href={"/"} onClick={toggleMenu}>
            <Button
              className="w-full justify-start gap-3 h-11 cursor-pointer"
              variant={"ghost"}
            >
              <Info size={18} /> About
            </Button>
          </Link>

          {isAuth ? (
            <>
              <Link href={"/"} onClick={toggleMenu}>
                <Button
                  className="w-full justify-start gap-3 h-11 cursor-pointer"
                  variant={"ghost"}
                >
                  <User size={18} /> My Profile
                </Button>
              </Link>
              <Button
                className="w-full justify-start gap-3 h-11 cursor-pointer"
                variant={"destructive"}
                onClick={() => {
                  logoutHandler();
                  toggleMenu();
                }}
              >
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <Link href={"/login"} onClick={toggleMenu}>
              <Button className="w-full justify-start gap-3 h-11 mt-2 cursor-pointer">
                <User size={18} /> SignIn
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
