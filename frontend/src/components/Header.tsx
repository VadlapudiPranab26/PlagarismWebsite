"use client";

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        <Link href="/">Plagiarism Checker</Link>
      </h1>
      <nav>
        <ul className="flex items-center space-x-4">
          <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
          {isLoggedIn && (
            <>
              <li><Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
              <li>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
