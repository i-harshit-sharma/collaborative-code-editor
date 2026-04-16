import { useState } from "react";
import { executeCode } from "./api";

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      setIsError(!!result.stderr);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.run?.output || error.message || "An unexpected error occurred";
      setOutput(errorMsg.split("\n"));
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-2 text-lg font-medium text-white">Output</h2>

      <button
        onClick={runCode}
        disabled={isLoading}
        className="mb-6 px-4 py-2 border border-green-600 cursor-pointer text-green-400 rounded hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Running..." : "Run Code"}
      </button>

      <div
        className={`h-[50vh] md:h-[75vh] p-4 rounded border ${isError ? "text-red-400 border-red-500" : "text-white border-[#333]"
          } overflow-y-auto whitespace-pre-wrap bg-[#1e1e1e]`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse font-medium">Executing your code...</p>
          </div>
        ) : output ? (
          output.map((line, i) => <p key={i}>{line}</p>)
        ) : (
          <span className="text-gray-500 italic">Click "Run Code" to see the output here</span>
        )}
      </div>
    </div>
  );
};

export default Output;
