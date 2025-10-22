"use client";

import React, { useState } from 'react';
import axios from 'axios';

const Auth: React.FC<{ setToken: (token: string) => void }> = ({ setToken }) => {
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password123');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/${isLogin ? 'login' : 'register'}`;
    console.log(`Sending request to: ${url}`);
    try {
      const res = await axios.post(url, { username, password });
      console.log('Response:', res.data);
      if (isLogin) {
        setToken(res.data.token);
      } else {
        alert('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Error during auth:', error.response?.data || error.message);
      alert('An error occurred.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="mt-2 text-sm text-blue-500">
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
};

export default Auth;
