import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiHash } from 'react-icons/fi';

interface IRCContactProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  nick: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export default function IRCContact({ isOpen, onClose }: IRCContactProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !joined) {
      // Auto-join sequence
      setTimeout(() => {
        setMessages([
          { id: '1', nick: 'system', message: 'Connecting to irc.gemcity.xyz:6667...', timestamp: new Date(), isSystem: true },
          { id: '2', nick: 'system', message: 'Connected.', timestamp: new Date(), isSystem: true },
          { id: '3', nick: 'system', message: '*** vivi has joined #contact', timestamp: new Date(), isSystem: true },
          { id: '4', nick: 'vivi', message: 'Hey. Drop a message if you want. I\'ll get it eventually.', timestamp: new Date() },
        ]);
        setJoined(true);
      }, 500);
    }
  }, [isOpen, joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (input.startsWith('/msg vivi ')) {
      const msg = input.replace('/msg vivi ', '');
      const newMessage: Message = {
        id: Date.now().toString(),
        nick: 'guest',
        message: msg,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate save and auto-reply
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'IRC Guest',
            email: 'guest@irc.anon',
            message: msg,
          }),
        });
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            nick: 'system',
            message: '*** Message logged. vivi is away (probably breaking something).',
            timestamp: new Date(),
            isSystem: true,
          }]);
        }, 1000);
      } catch {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          nick: 'system',
          message: '*** Failed to log message. Try email instead: chad@gemcity.xyz',
          timestamp: new Date(),
          isSystem: true,
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        nick: 'system',
        message: '*** Use: /msg vivi [your message]',
        timestamp: new Date(),
        isSystem: true,
      }]);
    }
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiHash className="text-green-400" />
          <span className="text-gray-300">#contact @ irc.gemcity.xyz</span>
          <span className="text-xs text-gray-500 ml-2">(2 users)</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
          aria-label="Close IRC"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto p-4 space-y-1 bg-black">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${msg.isSystem ? 'text-gray-500 italic' : ''}`}
          >
            {msg.isSystem ? (
              <span>{msg.message}</span>
            ) : (
              <>
                <span className="text-gray-500">[{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] </span>
                <span className={msg.nick === 'vivi' ? 'text-green-400' : 'text-blue-400'}>
                  &lt;{msg.nick}&gt;
                </span>
                <span className="text-gray-300"> {msg.message}</span>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
        <span className="text-green-400">guest@#contact:</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="/msg vivi [message]"
          className="flex-1 bg-transparent text-gray-300 outline-none placeholder-gray-600"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={handleSend}
          className="text-gray-500 hover:text-green-400 transition-colors"
          aria-label="Send"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}
