"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import TextInput from '@/components/TextInput';
import FileUpload from '@/components/FileUpload';
import Results from '@/components/Results';
import Sidebar from '@/components/Sidebar';
import Auth from '@/components/Auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const HomePage: React.FC = () => {
  const [results, setResults] = useState<{
    uniquePercentage: number;
    plagiarizedText: string;
    sources: { title: string; url: string }[];
    sentenceResults: { sentence: string; similarity: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSetToken = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleCheck = async (text: string) => {
    if (!token) {
      setError("Please log in to check for plagiarism.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/check`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextExtracted = (text: string) => {
    handleCheck(text);
  };

  return (
    <div>
      <Header isLoggedIn={!!token} onLogout={handleLogout} />
      <div className="container mx-auto p-4">
        {!token ? <Auth setToken={handleSetToken} /> : (
            <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
                <TextInput onCheck={handleCheck} isLoading={isLoading} />
                <FileUpload onFileUpload={() => {}} onTextExtracted={handleTextExtracted} />
                {error && <div className="mt-4 p-2 text-red-600 bg-red-100 rounded-md">{error}</div>}
            </div>
            <div className="w-full lg:w-1/3">
                {isLoading && <div className="text-center">Checking...</div>}
                {results && (
                <>
                    <Results
                    uniquePercentage={results.uniquePercentage}
                    plagiarizedText={results.plagiarizedText}
                    sources={results.sources}
                    />
                    <div className="mt-4">
                    <Sidebar
                        sources={results.sources}
                        sentenceResults={results.sentenceResults}
                        token={token}
                    />
                    </div>
                </>
                )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
