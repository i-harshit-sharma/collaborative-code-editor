// Chat.jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
import { Paperclip } from "lucide-react";

const socket = io("http://localhost:4000"); // Point to server

function Chat() {
  const { user } = useUser();
  const username = user?.firstName || "Anonymous"; // Fallback to "Anonymous" if no user
  const img = user?.imageUrl || "";
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { username, type: "text", content: message, img: img });
      setMessage("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      console.log(username  )
      socket.emit("send_message", {
        username,
        type: file.type.startsWith("image") ? "image" : "video",
        content: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="p-4 max-w-xl mx-auto h-full">
      <h1 className="text-xl font-bold mb-2">Send messages or files</h1>
      <div className="border border-dark-1 rounded p-4 h-10/12 overflow-y-scroll mb-4 no-scrollbar text-white">
        {chat.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <img src={msg.img} alt="User Avatar" className="w-6 h-6 text-sm rounded-full inline-block mr-2" />
            <strong>{msg.username}: </strong>
            {msg.type === "text" && msg.content}
            {msg.type === "image" && <img src={msg.content} alt="img" className="max-w-64" />}
            {msg.type === "video" && (
              <video controls autoPlay playsInline className="max-w-64">
                <source src={msg.content} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          className="flex-grow border border-dark-1 px-2 text-sm py-1.5 rounded outline-0 ring-0 focus:border-blue-500"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
      <label htmlFor="file-upload" className="text-sm text-gray-400"><Paperclip size={16} /></label>
        <button className="bg-blue-1 text-white px-2 text-sm py-1.5  rounded hover:bg-blue-500" onClick={sendMessage}>
          Send
        </button>
      </div>
      <input type="file" id="file-upload" accept="image/*,video/*" onChange={handleFileUpload} className="hidden"/>
    </div>
  );
}

export default Chat;
