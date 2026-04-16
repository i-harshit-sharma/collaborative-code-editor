import React from "react";
import CodeEditor from "../components/features/editor/CodeEditor";
import { Link } from "react-router-dom";

const Try = () => {
  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-500 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
        <Link to='/' className="text-xl md:text-2xl font-bold text-white tracking-tight">Code Collab</Link>
        <Link to="/sign-in" className="w-full sm:w-auto text-center bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">Sign In</Link>
      </div>
      <div className="mt-2">
        <CodeEditor />
      </div>
    </div>
  );
};

export default Try;
