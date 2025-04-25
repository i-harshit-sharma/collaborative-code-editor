import React, { useState } from "react";

function TextArea() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "API key is missing." },
      ]);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: input }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "Failed to fetch data.");
      }
      const agentText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const agentMessage = { sender: "agent", text: agentText };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "Error reaching the assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col items-center p-4">
      {/* <h1 className="text-2xl font-bold mb-4">🧠 Code Assistant</h1> */}

      <div className="w-full max-w-2xl shadow-md rounded-lg flex flex-col p-4 space-y-4 h-[70vh] overflow-y-auto border border-dark-1 no-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-2 py-1 rounded-lg whitespace-pre-wrap max-w-[80%] ${msg.sender === "user"
              ? "bg-dark-4 self-end text-right"
              : "bg-dark-4  border-dark-1 self-start"
              }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div class="flex items-center space-x-1">
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          </div>

        )}
      </div>

      <div className="w-full max-w-2xl mt-4 flex">
        <input
          type="text"
          className="flex-1 p-3 border border-dark-1 rounded-l-lg focus:outline-none outline-0 ring-0 focus:border-1 focus:border-blue-1"
          placeholder="Ask a coding question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition cursor-pointer"
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default TextArea;
