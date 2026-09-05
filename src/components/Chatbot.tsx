import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Send, Zap, Sparkles, Trash2, Cpu, Wifi } from 'lucide-react';
import { generateResponse, SUGGESTED_QUESTIONS } from '@/lib/sarcasticEngine';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  displayedText: string;
  isTyping: boolean;
}

let messageCounter = 0;

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: messageCounter++,
      role: 'bot',
      text: "ugh, you're back. fine. ask me something so I can not answer it.",
      displayedText: "ugh, you're back. fine. ask me something so I can not answer it.",
      isTyping: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setBootComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearAllTimers = () => {
    typingTimers.current.forEach((t) => clearTimeout(t));
    typingTimers.current = [];
  };

  useEffect(() => () => clearAllTimers(), []);

  const animateBotMessage = useCallback((msgId: number, fullText: string) => {
    let charIndex = 0;
    const typeNext = () => {
      if (charIndex >= fullText.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, isTyping: false } : m))
        );
        return;
      }
      charIndex++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, displayedText: fullText.slice(0, charIndex) } : m
        )
      );
      const timer = setTimeout(typeNext, 18 + Math.random() * 30);
      typingTimers.current.push(timer);
    };
    const startTimer = setTimeout(typeNext, 100);
    typingTimers.current.push(startTimer);
  }, []);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    clearAllTimers();

    const userMsg: Message = {
      id: messageCounter++,
      role: 'user',
      text: trimmed,
      displayedText: trimmed,
      isTyping: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const delay = 600 + Math.random() * 700;
    const timer = setTimeout(() => {
      const responseText = generateResponse(trimmed);
      const botMsg: Message = {
        id: messageCounter++,
        role: 'bot',
        text: responseText,
        displayedText: '',
        isTyping: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
      animateBotMessage(botMsg.id, responseText);
    }, delay);
    typingTimers.current.push(timer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    clearAllTimers();
    messageCounter = 0;
    setMessages([
      {
        id: messageCounter++,
        role: 'bot',
        text: "k we're starting over. ask me something. or don't. idc.",
        displayedText: '',
        isTyping: true,
      },
    ]);
    setInput('');
    setIsThinking(false);
    inputRef.current?.focus();
    setTimeout(() => animateBotMessage(0, "k we're starting over. ask me something. or don't. idc."), 200);
  };

  return (
    <div className="relative z-10 w-full max-w-2xl px-4">
      {/* Header / Branding */}
      <div className={`mb-6 text-center transition-all duration-700 ${bootComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="mb-2 flex items-center justify-center gap-3">
          <Sparkles className="h-6 w-6 text-accent animate-flicker sm:h-7 sm:w-7" />
          <h1 className="font-display text-3xl font-black tracking-[0.2em] text-accent text-glow-strong sm:text-5xl">
            ASK-O-TRON
          </h1>
          <Sparkles className="h-6 w-6 text-accent animate-flicker sm:h-7 sm:w-7" />
        </div>
        <p className="font-mono text-sm tracking-[0.3em] text-accent-light/80 text-glow sm:text-base">
          SASSY AND USELESS
        </p>
      </div>

      {/* Chat panel */}
      <div
        className={`retro-panel crt-screen rounded-lg overflow-hidden transition-all duration-700 relative ${bootComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ animation: bootComplete ? 'boot-up 0.6s ease-out' : 'none' }}
      >
        {/* Slowly moving gradient glow border overlay */}
        <div
          className="gradient-glow pointer-events-none absolute inset-0 z-0 rounded-lg"
          style={{ padding: '2px', maskImage: 'linear-gradient(black, black)', WebkitMaskComposite: 'xor', mixBlendMode: 'screen' }}
        />

        {/* Status bar */}
        <div className="relative z-20 flex items-center justify-between border-b-2 border-accent/40 bg-retro-panel-light px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-retro-teal animate-glow-pulse" style={{ boxShadow: '0 0 8px #36e2c4' }} />
            <span className="font-mono text-[10px] tracking-widest text-retro-teal text-glow-teal sm:text-xs">
              SYS::ONLINE
            </span>
          </div>
          <div className="hidden font-mono text-[10px] tracking-widest text-accent/70 sm:block sm:text-xs">
            V3.0.0-SASSY
          </div>
          <button
            onClick={handleReset}
            className="group flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-accent/70 transition-colors hover:text-accent sm:text-xs"
            aria-label="Clear chat"
          >
            <Trash2 className="h-3.5 w-3.5 transition-all group-hover:rotate-12 group-hover:scale-110" />
            CLEAR
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="retro-inset relative z-20 h-[38vh] min-h-[300px] overflow-y-auto p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isThinking && <ThinkingIndicator />}
          </div>
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && !isThinking && (
          <div className="relative z-20 border-t border-accent/30 bg-retro-panel/50 p-3">
            <p className="mb-2 font-mono text-[10px] tracking-widest text-retro-cream/40 sm:text-xs">
              &gt; SUGGESTED_INPUTS:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 5).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded border border-accent/40 bg-retro-panel-light px-3 py-1.5 font-mono text-[10px] text-retro-cream/70 transition-all hover:border-accent hover:bg-accent/20 hover:text-accent-glow sm:text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="relative z-20 flex items-center gap-2 border-t-2 border-accent/40 bg-retro-panel-light p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 font-mono text-accent">
            <Zap className="h-4 w-4 animate-flicker" />
            <span className="text-sm">&gt;</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ask me something... if you must"
            className="flex-1 bg-transparent font-mono text-sm text-retro-cream placeholder:text-retro-cream/30 focus:outline-none sm:text-base"
            autoFocus={bootComplete}
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="retro-btn rounded px-4 py-2 text-xs sm:text-sm"
          >
            <Send className="inline h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Futuristic footer */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-center">
          <Cpu className="h-3.5 w-3.5 text-accent/50" />
          <p className="font-mono text-[10px] tracking-[0.25em] text-retro-cream/40 sm:text-xs">
            NEURAL_SNARK_ENGINE_v3 // POWERED_BY_SPITE
          </p>
          <Wifi className="h-3.5 w-3.5 text-accent/50" />
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent/40" />
          <p className="font-mono text-[9px] tracking-[0.3em] text-retro-cream/25 sm:text-[10px]">
            ZERO_USEFUL_INFORMATION_PROCESSED
          </p>
          <span className="h-1 w-1 rounded-full bg-accent/40" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`mb-1 flex items-center gap-1.5 font-mono text-[10px] tracking-widest sm:text-xs ${
            isUser ? 'justify-end text-retro-teal' : 'text-accent/70'
          }`}
        >
          {!isUser && <Sparkles className="h-3 w-3" />}
          {isUser ? 'YOU' : 'ASK-O-TRON'}
          {isUser && <Sparkles className="h-3 w-3" />}
        </div>
        <div
          className={`rounded-lg border px-4 py-2.5 font-mono text-sm leading-relaxed sm:text-base ${
            isUser
              ? 'border-retro-teal/40 bg-retro-teal/10 text-retro-cream'
              : 'border-accent/50 bg-accent/10 text-retro-cream'
          }`}
        >
          {isUser ? (
            <span>{message.displayedText}</span>
          ) : (
            <span className="whitespace-pre-wrap text-glow">
              {message.displayedText}
              {message.isTyping && (
                <span className="ml-0.5 inline-block w-2 h-4 bg-accent animate-blink align-middle" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex animate-fade-in justify-start">
      <div className="max-w-[85%]">
        <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-accent/70 sm:text-xs">
          <Sparkles className="h-3 w-3" />
          ASK-O-TRON
        </div>
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0.4s' }} />
            <span className="ml-2 font-mono text-[10px] tracking-widest text-accent/60 sm:text-xs">
              PROCESSING_SNARK...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
