"use client";

import React, { useState } from 'react';

interface TextInputProps {
  onCheck: (text: string) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onCheck, isLoading }) => {
  const [text, setText] = useState('To be, or not to be, that is the question.');

  const handleCheck = () => {
    if (text.trim() && !isLoading) {
      onCheck(text);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Enter Text</h2>
      <textarea
        className="w-full h-64 p-2 border rounded-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
        disabled={isLoading}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        onClick={handleCheck}
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Check Plagiarism'}
      </button>
    </div>
  );
};

export default TextInput;
