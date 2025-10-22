"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Check {
  _id: string;
  content: string;
  percentage: number;
  timestamp: string;
}

const DashboardPage: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    const fetchChecks = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('http://localhost:5000/api/checks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChecks(res.data);
      }
    };
    fetchChecks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Previous Checks</h2>
        <ul>
          {checks.map(check => (
            <li key={check._id} className="border-b py-2">
              <p><strong>Content:</strong> {check.content.substring(0, 100)}...</p>
              <p><strong>Uniqueness:</strong> {check.percentage}%</p>
              <p><strong>Date:</strong> {new Date(check.timestamp).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
