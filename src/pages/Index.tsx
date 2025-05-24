import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mic, Volume2, Trash2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { isMathProblem, solveMathProblem } from '@/utils/mathOperations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastBotResponse = useRef('');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    if (sender === 'bot') {
      lastBotResponse.current = text;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    addMessage(userMessage, 'user');
    setIsLoading(true);
    
    try {
      // Check if this is a math problem we can solve locally
      if (isMathProblem(userMessage)) {
        const localSolution = solveMathProblem(userMessage);
        if (localSolution) {
          // We solved it locally! No need to query the backend
          setTimeout(() => {
            addMessage(localSolution, 'bot');
            setIsLoading(false);
            toast.success('Calculated locally');
          }, 300); // Small delay for better UX
          return;
        }
      }

      // If not a math problem or we couldn't solve it locally, send to backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      addMessage(data.reply, 'bot');
      toast.success('Response received');
    } catch (error) {
      addMessage('⚠️ Error: Could not connect to the mystical realm. Please try again.', 'bot');
      toast.error('Failed to get response');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakResponse = () => {
    if (!lastBotResponse.current) return;
    const utterance = new SpeechSynthesisUtterance(lastBotResponse.current);
    utterance.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = (event) => {
      toast.error(`Voice recognition error: ${event.error}`);
    };
    recognition.start();
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-teal via-teal-600 to-mystical-green relative overflow-hidden">
      {/* Animated sparkles */}
      <div className="absolute top-10 left-10 text-mystical-gold animate-sparkle">
        <Sparkles size={24} />
      </div>
      <div className="absolute top-20 right-16 text-mystical-gold animate-sparkle delay-1000">
        <Sparkles size={20} />
      </div>
      <div className="absolute bottom-32 left-20 text-mystical-gold animate-sparkle delay-2000">
        <Sparkles size={28} />
      </div>
      <div className="absolute bottom-20 right-10 text-mystical-gold animate-sparkle delay-500">
        <Sparkles size={22} />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl relative z-10">
        {/* Header - Made more compact */}
        <header className="text-center mb-4 animate-float">
          <div className="flex justify-center items-center mb-2 flex-col">
            {/* Updated logo with white ring */}
            <div className="rounded-full bg-white p-1 mb-1 shadow-lg">
              <img 
                src="/lovable-uploads/d3a914eb-613e-46ae-aff0-f38016cd35be.png"
                alt="জাদুকর Logo"
                className="w-16 h-16 rounded-full drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-cinzel text-3xl font-semibold text-white drop-shadow-lg mb-1">
                জাদুকর
              </h1>
              {/* Added English name */}
              <p className="font-railway text-lg text-mystical-light/90 mb-1">
                JADOOKOR
              </p>
              <p className="font-railway text-sm text-mystical-light/90">
                The Mystical AI Assistant
              </p>
            </div>
          </div>
          <p className="font-poppins text-sm text-mystical-light/80 italic">
            "Wisdom from ancient scrolls, powered by modern enchantments"
          </p>
        </header>

        {/* Chat Box - Increased height since header is smaller */}
        <Card className="bg-white/10 backdrop-blur-sm border-mystical-gold/30 mb-4 h-96 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-mystical-light/70 font-quicksand mt-20">
                  <Sparkles className="mx-auto mb-4 text-mystical-gold" size={48} />
                  <p className="text-lg">Welcome to the mystical realm...</p>
                  <p className="text-sm">Ask জাদুকর anything, and receive wisdom beyond time</p>
                  <p className="text-xs mt-4 text-mystical-gold font-railway">Try math questions directly for instant calculations!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg font-quicksand ${
                        message.sender === 'user'
                          ? 'bg-mystical-gold text-mystical-dark'
                          : 'bg-white/20 text-mystical-light border border-mystical-gold/20'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.text}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/20 text-mystical-light border border-mystical-gold/20 px-4 py-3 rounded-lg font-quicksand">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-mystical-gold rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-mystical-gold rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-mystical-gold rounded-full animate-bounce delay-200"></div>
                      <span className="ml-2">জাদুকর is consulting the ancient texts...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </Card>

        {/* Controls - Made more compact */}
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          <Button
            onClick={() => setCurrentModel(currentModel === 1 ? 2 : 1)}
            variant="secondary"
            className="bg-white/20 text-mystical-light border-mystical-gold/30 hover:bg-white/30 font-railway"
          >
            Scroll: {currentModel}
          </Button>
          <Button
            onClick={speakResponse}
            variant="secondary"
            className="bg-white/20 text-mystical-light border-mystical-gold/30 hover:bg-white/30 font-railway"
          >
            <Volume2 size={16} className="mr-2" />
            Speak Wisdom
          </Button>
          <Button
            onClick={startVoiceRecognition}
            variant="secondary"
            className="bg-white/20 text-mystical-light border-mystical-gold/30 hover:bg-white/30 font-railway"
          >
            <Mic size={16} className="mr-2" />
            Voice Spell
          </Button>
          <Button
            onClick={clearChat}
            variant="secondary"
            className="bg-white/20 text-mystical-light border-mystical-gold/30 hover:bg-white/30 font-railway"
          >
            <Trash2 size={16} className="mr-2" />
            Clear Scrolls
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Speak your query to জাদুকর..."
            className="flex-1 bg-white/20 border-mystical-gold/30 text-mystical-light placeholder-mystical-light/60 font-poppins"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-mystical-gold text-mystical-dark hover:bg-mystical-gold/80 font-railway"
          >
            <Send size={16} className="mr-2" />
            Cast
          </Button>
        </div>

        {/* Footer - Made more compact */}
        <footer className="text-center mt-4 text-mystical-light/60 font-quicksand">
          <p className="text-xs">&copy; 2025 জাদুকর (JADOOKOR) - Where ancient wisdom meets modern intelligence</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
