import React from 'react';

interface SidebarProps {
  sources: { title: string; url: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ sources }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Detected Sources</h2>
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
      ) : (
        <p>No potential sources found.</p>
      )}
    </div>
  );
};

export default Sidebar;
