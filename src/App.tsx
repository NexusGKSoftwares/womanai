import React, { useState } from 'react';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AvatarCustomizer } from './components/AvatarCustomizer';

interface Message {
  text: string;
  isUser: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! I'm your NexusGK AI assistant. How can I help you today?", isUser: false }
  ]);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAIResponse = async (userMessage: string) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_OPENAI_API_KEY` // Replace with a secure method
        },
        body: JSON.stringify({
          model: "gpt-4", // Adjust based on the model you want to use
          messages: [
            { role: "system", content: "You are a helpful AI assistant for NexusGK." },
            ...messages.map(m => ({ role: m.isUser ? "user" : "assistant", content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Oops! Something went wrong. Please try again.";
    }
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setIsProcessing(true);
    
    const aiResponse = await fetchAIResponse(message);
    
    setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="relative min-h-screen max-w-6xl mx-auto px-4 py-8 flex flex-col">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
        <div className="relative flex-1 flex flex-col">
          <div className="flex flex-col items-center mb-8 animate-fade-in">
            <Avatar customAvatar={customAvatar} onCustomize={() => setShowAvatarCustomizer(true)} />
            <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NexusGK AI Assistant
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Your personal AI companion, ready to assist 24/7 NexusGK Company
            </p>
          </div>
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
            <div className="bg-black/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/10">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message.text} isUser={message.isUser} />
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
      {showAvatarCustomizer && (
        <AvatarCustomizer onClose={() => setShowAvatarCustomizer(false)} onSelectAvatar={setCustomAvatar} />
      )}
    </div>
  );
}

export default App;