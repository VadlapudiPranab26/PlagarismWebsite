"use client";

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsProps {
  uniquePercentage: number;
  plagiarizedText: string;
  sources: { title: string; url: string }[];
}

const Results: React.FC<ResultsProps> = ({ uniquePercentage, plagiarizedText, sources }) => {

  const exportToPdf = () => {
    const reportElement = document.getElementById('report');
    if (reportElement) {
      html2canvas(reportElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save('plagiarism-report.pdf');
      });
    }
  };

  const highlightText = () => {
    const parts = plagiarizedText.split(/(<plagiarized>.*?<\/plagiarized>)/g);
    return parts.map((part, index) => {
      if (part.startsWith('<plagiarized>')) {
        return <span key={index} className="bg-red-200">{part.replace(/<\/?plagiarized>/g, '')}</span>;
      }
      return part;
    });
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
      <button
        onClick={exportToPdf}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
        Export as PDF
      </button>
    </div>
  );
};

export default Results;
