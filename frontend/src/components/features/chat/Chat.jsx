import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Paperclip, MessageSquare, Send, Image, Film } from "lucide-react";

function Chat({ socket, roomId }) {
  const { user } = useUser();
  const username = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous" : "Anonymous";
  const img = user?.imageUrl || "";
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;
    
    // Notify the server we joined
    socket.emit('join-room', { roomId });

    const handleReceiveMessage = (data) => {
      setChat((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, roomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (message.trim() && socket && roomId) {
      socket.emit("send_message", { roomId, username, type: "text", content: message, img: img });
      setMessage("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (socket && roomId) {
        socket.emit("send_message", {
          roomId,
          username,
          type: file.type.startsWith("image") ? "image" : "video",
          content: reader.result,
          img: img,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-dark-3 text-gray-200 font-sans">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-dark-4/40 backdrop-blur-md">
        <MessageSquare size={18} className="text-blue-500" />
        <h3 className="font-semibold text-sm tracking-wide">Room Chat</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-dark-3">
        {chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 italic space-y-2">
            <span className="text-2xl">💬</span>
            <span className="text-xs">No messages yet. Start the conversation!</span>
          </div>
        ) : (
          chat.map((msg, idx) => {
            const isSelf = msg.username === username;
            return (
              <div key={idx} className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                <img 
                  src={msg.img || "/icons/default-avatar.png"} 
                  alt={msg.username} 
                  className="w-8 h-8 rounded-full border border-white/10 object-cover mt-0.5" 
                />
                <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-500 font-medium px-1 mb-1">{msg.username}</span>
                  <div className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isSelf 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-dark-4 border border-white/5 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.type === "text" && <p className="whitespace-pre-wrap break-all">{msg.content}</p>}
                    {msg.type === "image" && (
                      <div className="relative group overflow-hidden rounded-lg mt-0.5">
                        <img src={msg.content} alt="img" className="max-w-full rounded-lg border border-white/10 group-hover:scale-[1.02] transition-transform duration-200" />
                      </div>
                    )}
                    {msg.type === "video" && (
                      <video controls playsInline className="max-w-full rounded-lg border border-white/10 mt-0.5">
                        <source src={msg.content} />
                      </video>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-3 bg-dark-4/60 border-t border-white/5 flex gap-2 items-center">
        <label 
          htmlFor="file-upload" 
          className="p-2 bg-dark-4 hover:bg-dark-2 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 transform"
          title="Upload image or video"
        >
          <Paperclip size={15} />
        </label>
        <input 
          type="file" 
          id="file-upload" 
          accept="image/*,video/*" 
          onChange={handleFileUpload} 
          className="hidden"
        />

        <input
          className="flex-1 bg-dark-4 border border-white/5 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs outline-none transition-all placeholder:text-gray-600 text-white"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message..."
        />

        <button 
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={sendMessage}
          disabled={!message.trim()}
          title="Send Message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default Chat;

