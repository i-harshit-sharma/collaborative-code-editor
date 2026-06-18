import { useState, useEffect, useRef } from "react";
import { executeCode } from "../../../api/repos";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [execTime, setExecTime] = useState(null);   // ms, null = not run yet
  const [elapsed, setElapsed] = useState(0);         // live counter while running
  const timerRef = useRef(null);

  // Live elapsed timer while running
  useEffect(() => {
    if (isLoading) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 100);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isLoading]);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      setExecTime(null);
      const start = performance.now();
      const { run: result } = await executeCode(language, sourceCode);
      const end = performance.now();
      setExecTime(Math.round(end - start));
      setOutput(result.output.split("\n"));
      setIsError(!!result.stderr);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.run?.output || error.message || "An unexpected error occurred";
      setOutput(errorMsg.split("\n"));
      setIsError(true);
      setExecTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-white">Output</h2>
        {/* Execution time badge */}
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full animate-pulse">
            <Clock size={12} />
            {formatTime(elapsed)}
          </span>
        ) : execTime !== null ? (
          <span className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
            isError
              ? "text-red-400 bg-red-500/10 border-red-500/20"
              : "text-green-400 bg-green-500/10 border-green-500/20"
          }`}>
            {isError ? <XCircle size={12} /> : <CheckCircle size={12} />}
            {formatTime(execTime)}
          </span>
        ) : null}
      </div>

      <button
        onClick={runCode}
        disabled={isLoading}
        className="mb-4 px-4 py-2 border border-green-600 cursor-pointer text-green-400 rounded hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Running..." : "Run Code"}
      </button>

      <div
        className={`h-[50vh] md:h-[75vh] p-4 rounded border ${
          isError ? "text-red-400 border-red-500" : "text-white border-[#333]"
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

