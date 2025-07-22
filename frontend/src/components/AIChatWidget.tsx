import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BACKEND_CHAT_URL = import.meta.env.VITE_CHAT_API_URL || 'https://api.openai.com/v1/chat/completions'; // or your own endpoint

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Example: OpenAI API (replace with your backend if needed)
      const response = await axios.post(
        BACKEND_CHAT_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMsg],
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const aiMsg = response.data.choices[0].message;
      setMessages(msgs => [...msgs, aiMsg]);
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'assistant', content: 'Sorry, there was an error.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-primary/90 transition"
        aria-label="Open AI Chat"
      >
        💬
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[95vw] bg-white border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
            <span>AI Chat</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">&times;</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto max-h-96">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-white px-4 py-1 rounded disabled:opacity-50"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
} 