"use client"
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MessageCircle, X } from "lucide-react";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  {code:'ml',name:'Malayalam'},
  {code:'ta',name:'Tamil'},
  {code:'te',name:'Telugu'},
];

const getSystemMessage = (language) => ({
  role: "system",
  content: `You are a knowledgeable travel assistant. Communicate in ${language}. Help users plan their trips, suggest destinations, provide travel tips, and answer questions about different locations. Include information about local customs, best times to visit, must-see attractions, and practical travel advice. Keep responses concise and friendly. If user writes in a different language, respond in that language.`
});

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const scrollRef = useRef(null);

  useEffect(() => {
    // Verify API key exists
    if (!openai.apiKey) {
      setError('OpenAI API key not configured');
    }

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          getSystemMessage(selectedLanguage),
          ...messages,
          { role: 'user', content: input }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 200
      });

      let streamedMessage = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        streamedMessage += content;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = streamedMessage;
          return updated;
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center p-3 border-b">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                } max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                {msg.content}
              </div>
            ))}
          </ScrollArea>
          
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Send'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;