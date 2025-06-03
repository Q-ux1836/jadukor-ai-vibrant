
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mic, Volume2, Trash2, Send, Sparkles, Upload, Info } from 'lucide-react';
import { toast } from 'sonner';
import { isMathProblem, solveMathProblem } from '@/utils/mathOperations';
import BuilderInfoDialog from '@/components/BuilderInfoDialog';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  fileContent?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(1);
  const [showBuilderInfo, setShowBuilderInfo] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastBotResponse = useRef('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix mobile scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, sender: 'user' | 'bot' | 'system', fileUrl?: string, fileName?: string, fileContent?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      fileUrl,
      fileName,
      fileContent
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      setTimeout(() => {
        if (sender !== 'system' || updated.length > 1) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
      return updated;
    });
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
      if (isMathProblem(userMessage)) {
        const localSolution = solveMathProblem(userMessage);
        if (localSolution) {
          setTimeout(() => {
            addMessage(localSolution, 'bot');
            setIsLoading(false);
            toast.success('Calculated locally');
          }, 300);
          return;
        }
      }

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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = (event: any) => {
      toast.error(`Voice recognition error: ${event.error}`);
    };
    recognition.start();
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  // Enhanced file upload with text extraction for AI reading
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      
      // Try to read text content from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        let fileContent = '';
        
        // Extract text based on file type
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          fileContent = content;
        } else if (file.type === 'application/json') {
          try {
            fileContent = JSON.stringify(JSON.parse(content), null, 2);
          } catch {
            fileContent = content;
          }
        }
        
        addMessage(
          `📄 Uploaded: ${file.name}${fileContent ? '\n\nFile content:\n' + fileContent.substring(0, 1000) + (fileContent.length > 1000 ? '...' : '') : '\n(Binary file - content not readable)'}`,
          'system',
          localUrl,
          file.name,
          fileContent
        );
      };
      
      reader.readAsText(file);
      toast.success(`File "${file.name}" uploaded!`);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-teal via-teal-600 to-mystical-green relative overflow-hidden">
      {/* Sparkles */}
      <div className="absolute top-10 left-10 text-mystical-gold animate-sparkle">
        <Sparkles size={24} />
      </div>
      <div className="absolute top-20 right-16 text-mystical-gold animate-sparkle">
        <Sparkles size={20} />
      </div>
      <div className="absolute bottom-32 left-20 text-mystical-gold animate-sparkle delay-2000">
        <Sparkles size={28} />
      </div>
      <div className="absolute bottom-20 right-10 text-mystical-gold animate-sparkle delay-500">
        <Sparkles size={22} />
      </div>

      {/* Info Button */}
      <Button
        className="fixed top-6 right-8 z-50 bg-white bg-opacity-90 hover:bg-mystical-gold/[0.85] text-mystical-gold border border-mystical-gold transition-all shadow-xl rounded-full p-0 flex items-center justify-center w-11 h-11"
        style={{
          minWidth: '2.5rem',
          width: '2.75rem',
          opacity: 1
        }}
        size="icon"
        variant="secondary"
        onClick={() => setShowBuilderInfo(true)}
        aria-label="Builder Info"
      >
        <Info size={24} />
      </Button>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <header className="text-center mb-8 animate-float relative">
          <div className="flex justify-center items-center mb-4 flex-col">
            <div className="rounded-full bg-white p-1 mb-2 shadow-lg">
              <img 
                src="/lovable-uploads/2d8c25c0-04a6-4070-9f86-cf375f3b7528.png"
                alt="Mistry AI Logo"
                className="w-24 h-24 rounded-full drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-cinzel-deco text-5xl font-bold text-white drop-shadow-lg mb-2 tracking-wide">
                Mistry AI
              </h1>
              <p className="font-cinzel-deco text-xl text-mystical-light/90 mb-2">
                Mistry AI
              </p>
              <p className="font-cinzel-deco text-xl text-mystical-light/90">
                The Mystical AI Assistant
              </p>
            </div>
          </div>
          <p className="font-poppins text-mystical-light/80 italic">
            "Wisdom from ancient scrolls, powered by modern enchantments"
          </p>
        </header>

        {/* Chat Box */}
        <Card className="bg-white/10 backdrop-blur-sm border-mystical-gold/30 mb-6 h-80 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center mt-8">
                  <div className="bg-white rounded-lg p-8 mx-auto max-w-md shadow-lg">
                    <Sparkles className="mx-auto mb-4 text-mystical-gold" size={48} />
                    <h3 className="text-xl font-quicksand font-semibold text-mystical-dark mb-3">
                      Welcome to the mystical realm...
                    </h3>
                    <p className="text-mystical-dark/80 font-quicksand">
                      Ask Mistry AI anything, and receive wisdom beyond time
                    </p>
                  </div>
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
                          : message.sender === 'system'
                            ? 'bg-mystical-dark/80 text-mystical-gold border border-mystical-gold/60 italic'
                            : 'bg-white/20 text-mystical-light border border-mystical-gold/20'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.fileUrl ? (
                          <a href={message.fileUrl} download={message.fileName} target="_blank" rel="noopener noreferrer"
                             className="underline hover:text-mystical-gold animate-pulse">
                            {message.text}
                          </a>
                        ) : (
                          message.text
                        )}
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
                      <span className="ml-2">Mistry AI is consulting the ancient texts...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </Card>

        {/* Controls - Made white as requested */}
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          <Button
            onClick={() => setCurrentModel(currentModel === 1 ? 2 : 1)}
            variant="secondary"
            className="bg-white text-mystical-dark hover:bg-gray-100 font-railway border border-mystical-gold/30"
          >
            Scroll: {currentModel}
          </Button>
          <Button
            onClick={speakResponse}
            variant="secondary"
            className="bg-white text-mystical-dark hover:bg-gray-100 font-railway border border-mystical-gold/30"
          >
            <Volume2 size={16} className="mr-2" />
            Speak Wisdom
          </Button>
          <Button
            onClick={startVoiceRecognition}
            variant="secondary"
            className="bg-white text-mystical-dark hover:bg-gray-100 font-railway border border-mystical-gold/30"
          >
            <Mic size={16} className="mr-2" />
            Voice Spell
          </Button>
          <Button
            onClick={clearChat}
            variant="secondary"
            className="bg-white text-mystical-dark hover:bg-gray-100 font-railway border border-mystical-gold/30"
          >
            <Trash2 size={16} className="mr-2" />
            Clear Scrolls
          </Button>
        </div>

        {/* Input Area with Upload */}
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            aria-label="Upload file"
          />
          <Button
            variant="secondary"
            className="bg-mystical-gold/80 hover:bg-mystical-gold text-mystical-dark font-railway"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            type="button"
            aria-label="Upload file"
          >
            <Upload size={20} className="mr-2" />
            Upload
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Speak your query to Mistry AI..."
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

        <BuilderInfoDialog open={showBuilderInfo} onOpenChange={setShowBuilderInfo} />

        <footer className="text-center mt-8 text-mystical-light/60 font-quicksand">
          <p>&copy; 2025 Mistry AI - Where ancient wisdom meets modern intelligence</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
