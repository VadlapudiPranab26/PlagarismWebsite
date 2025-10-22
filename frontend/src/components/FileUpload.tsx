"use client";

import React from 'react';
import { renderAsync } from 'docx-preview';
import * as pdfjs from 'pdfjs-dist/build/pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onTextExtracted: (text: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onTextExtracted }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await renderAsync(arrayBuffer, document.createElement('div'));
        const text = result.textContent || '';
        onTextExtracted(text);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ');
        }
        onTextExtracted(text);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            onTextExtracted(text);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Or Upload a File</h2>
      <input
        type="file"
        accept=".txt,.docx,.pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
    </div>
  );
};

export default FileUpload;
