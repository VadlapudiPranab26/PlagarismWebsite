"use client";

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SidebarProps {
  sources: { title: string; url: string }[];
  sentenceResults: { sentence: string; similarity: number }[];
  token: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ sources, sentenceResults, token }) => {
  const [paraphrasedText, setParaphrasedText] = useState<Record<number, string>>({});
  const [isParaphrasing, setIsParaphrasing] = useState<Record<number, boolean>>({});

  const handleParaphrase = async (sentence: string, index: number) => {
    if (!token) return;
    setIsParaphrasing(prev => ({ ...prev, [index]: true }));
    try {
      const res = await axios.post(`${API_URL}/paraphrase`, { text: sentence }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParaphrasedText(prev => ({ ...prev, [index]: res.data.paraphrasedText }));
    } catch (error) {
      console.error("Error paraphrasing:", error);
      setParaphrasedText(prev => ({ ...prev, [index]: "Could not paraphrase." }));
    } finally {
      setIsParaphrasing(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Report Details</h2>

      <div>
        <h3 className="text-lg font-semibold">Sources</h3>
        {sources.length > 0 ? (
          <ul className="list-disc pl-5 mt-2 space-y-2">
            {sources.map((source, index) => (
              <li key={index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        ) : <p>No potential sources found.</p>}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Sentence Breakdown</h3>
        <ul className="mt-2 space-y-3">
          {sentenceResults.map((result, index) => (
            <li key={index} className={`border-l-4 p-2 ${result.similarity > 0.8 ? 'border-red-400' : 'border-green-400'}`}>
              <p className="text-sm">{result.sentence}</p>
              <p className="text-xs font-semibold mt-1">Similarity: {(result.similarity * 100).toFixed(2)}%</p>
              {result.similarity > 0.8 && (
                <div className="mt-2">
                  <button
                    onClick={() => handleParaphrase(result.sentence, index)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={isParaphrasing[index]}
                  >
                    {isParaphrasing[index] ? '...' : 'Paraphrase'}
                  </button>
                  {paraphrasedText[index] && <p className="text-xs mt-2 p-2 bg-gray-100 rounded">{paraphrasedText[index]}</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
