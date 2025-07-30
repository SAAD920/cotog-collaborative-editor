// src/components/Navbar.js - REPLACE your existing file with this
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return router.pathname === path;
  };

  const NavLink = ({ href, children, className = "" }) => (
    <Link 
      href={href} 
      className={`text-blue-500 hover:text-blue-700 hover:underline transition-colors ${
        isActive(href) ? 'font-semibold text-blue-700' : ''
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
              COTOG
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <NavLink href="/">Home</NavLink>
              
              {/* Code Editor - Always accessible */}
              <NavLink href="/code-editor">Code Editor</NavLink>
              
              {/* Authenticated User Navigation */}
              {isAuthenticated ? (
                <>
                  <NavLink href="/create-room">Create Room</NavLink>
                  <NavLink href="/my-rooms">My Rooms</NavLink>
                </>
              ) : (
                !isLoading && (
                  <>
                    <NavLink href="/login">Login</NavLink>
                    <NavLink href="/signup">Sign Up</NavLink>
                  </>
                )
              )}
            </div>
          </div>

          {/* User Menu (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.firstName || user?.username}
                  </span>
                  
                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={toggleDropdown}
                    >
                      <img
                        className="h-8 w-8 rounded-full border-2 border-gray-300"
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0D8ABC&color=fff`}
                        alt={user?.firstName + ' ' + user?.lastName}
                      />
                      <svg className="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                            <div className="truncate">{user?.email}</div>
                          </div>
                          
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="flex items-center">
                              <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile
                            </div>
                          </Link>
                          
                          {user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center">
                                <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin Panel
                              </div>
                            </Link>
                          )}
                          
                          <div className="border-t border-gray-100">
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <svg className="mr-3 h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Home</Link>
              <Link href="/code-editor" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Code Editor</Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/create-room" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Create Room</Link>
                  <Link href="/my-rooms" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">My Rooms</Link>
                  <div className="border-t pt-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                !isLoading && (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Login</Link>
                    <Link href="/signup" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Sign Up</Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
