"use client";

import React from 'react';

interface ResultsProps {
  uniquePercentage: number;
  plagiarizedText: string;
  sources: { title: string; url: string }[];
}

const Results: React.FC<ResultsProps> = ({ uniquePercentage, plagiarizedText, sources }) => {

  const highlightText = () => {
    // This is a placeholder for a more complex highlighting logic.
    // A real implementation would involve splitting the text and wrapping plagiarized parts in a span.
    return <div dangerouslySetInnerHTML={{ __html: plagiarizedText }} />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md" id="report">
      <h2 className="text-xl font-semibold mb-4">Results</h2>
      <div className="text-center my-4">
        <div className={`text-5xl font-bold ${uniquePercentage > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
          {uniquePercentage.toFixed(2)}%
        </div>
        <div className="text-lg">Unique</div>
      </div>
      <div className="p-4 border rounded-md bg-gray-50">
        {highlightText()}
      </div>
    </div>
  );
};

export default Results;
