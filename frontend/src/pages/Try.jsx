import React from "react";
import CodeEditor from "../components/CodeEditor";
import { Link } from "react-router-dom";

const Try = () => {
  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-500 px-6 ">
      <div className="flex justify-between pt-2">
      <Link to='/' className="text-2xl font-bold  text-white ">Code Collab</Link>
      <Link to="/sign-in" className="bg-blue-500 text-white px-2.5 py-1.5 rounded">Sign In </Link>
      </div>
      <CodeEditor />
    </div>
  );
};

export default Try;
