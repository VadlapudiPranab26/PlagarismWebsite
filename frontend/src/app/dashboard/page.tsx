"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Check {
  _id: string;
  content: string;
  percentage: number;
  timestamp: string;
}

const DashboardPage: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const fetchChecks = async () => {
        const res = await axios.get(`${API_URL}/checks`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setChecks(res.data);
      };
      fetchChecks();
    } else {
        router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/');
  };

  return (
    <div>
      <Header isLoggedIn={!!token} onLogout={handleLogout} />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Previous Checks</h2>
          {checks.length > 0 ? (
            <ul>
              {checks.map(check => (
                <li key={check._id} className="border-b py-2">
                  <p className="font-semibold">Uniqueness: <span className="font-normal">{check.percentage.toFixed(2)}%</span></p>
                  <p className="font-semibold">Date: <span className="font-normal">{new Date(check.timestamp).toLocaleDateString()}</span></p>
                  <p className="text-gray-600 mt-1">{check.content.substring(0, 150)}...</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No previous checks found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
