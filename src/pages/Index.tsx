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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, sender: 'user' | 'bot' | 'system', fileUrl?: string, fileName?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      fileUrl,
      fileName
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

  const processFileContent = async (file: File) => {
    if (file.type === 'text/plain') {
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
        
        const prompt = `Please analyze this text file content: ${content}`;
        
        // Send to AI for processing
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (response.ok) {
          const data = await response.json();
          addMessage(data.reply, 'bot');
          toast.success('Text file analyzed successfully');
        } else {
          throw new Error('Failed to process file');
        }
      } catch (error) {
        addMessage('⚠️ Error processing text file. Using local analysis instead.', 'bot');
        toast.error('Could not process file with AI');
      }
    } else {
      addMessage(`📄 File uploaded: ${file.name} (Only text files can be analyzed by AI)`, 'system');
      toast.success(`File "${file.name}" uploaded!`);
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
      addMessage('⚠️ Error: Could not connect to Mistry AI. Please try again.', 'bot');
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

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFileContent(file);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 relative overflow-hidden">
      {/* Sparkles - made brighter */}
      <div className="absolute top-10 left-10 text-blue-600 animate-sparkle">
        <Sparkles size={24} />
      </div>
      <div className="absolute top-20 right-16 text-blue-600 animate-sparkle">
        <Sparkles size={20} />
      </div>
      <div className="absolute bottom-32 left-20 text-blue-600 animate-sparkle delay-2000">
        <Sparkles size={28} />
      </div>
      <div className="absolute bottom-20 right-10 text-blue-600 animate-sparkle delay-500">
        <Sparkles size={22} />
      </div>

      {/* Info Button */}
      <Button
        className="fixed top-6 right-8 z-50 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 transition-all shadow-xl rounded-full p-0 flex items-center justify-center w-11 h-11"
        size="icon"
        variant="secondary"
        onClick={() => setShowBuilderInfo(true)}
        aria-label="Builder Info"
      >
        <Info size={24} />
      </Button>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header - Updated with Mistry branding */}
        <header className="text-center mb-8 animate-float relative">
          <div className="flex justify-center items-center mb-4 flex-col">
            <div className="rounded-full bg-white p-1 mb-2 shadow-lg">
              <img 
                src="/lovable-uploads/2d8c25c0-04a6-4070-9f86-cf375f3b7528.png"
                alt="Mistry AI Logo"
                className="w-20 h-20 rounded-full drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-cinzel-deco text-4xl font-bold text-blue-800 drop-shadow-lg mb-2 tracking-wide">
                Mistry
              </h1>
              <p className="font-cinzel-deco text-lg text-blue-600">
                AI Assistant
              </p>
            </div>
          </div>
          <p className="font-poppins text-blue-500 italic">
            "Your intelligent companion for every question"
          </p>
        </header>

        {/* Chat Box - Made brighter */}
        <Card className="bg-white border-blue-200 mb-8 h-80 overflow-hidden shadow-lg">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="bg-white rounded-xl shadow-lg max-w-sm mx-auto p-8 text-center border border-blue-100">
                    <Sparkles className="mx-auto mb-4 text-blue-500" size={48} />
                    <p className="text-lg font-semibold text-blue-800 mb-2">Welcome to Mistry AI</p>
                    <p className="text-sm text-blue-600">Ask me anything and get intelligent responses</p>
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
                          ? 'bg-blue-500 text-white'
                          : message.sender === 'system'
                            ? 'bg-gray-100 text-blue-800 border border-blue-200 italic'
                            : 'bg-white text-blue-800 border border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.fileUrl ? (
                          <a href={message.fileUrl} download={message.fileName} target="_blank" rel="noopener noreferrer"
                             className="underline hover:text-blue-600 animate-pulse">
                            📄 {message.fileName}
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
                  <div className="bg-white text-blue-800 border border-blue-200 shadow-sm px-4 py-3 rounded-lg font-quicksand">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                      <span className="ml-2">Mistry AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </Card>

        {/* Controls - Made brighter */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <Button
            onClick={() => setCurrentModel(currentModel === 1 ? 2 : 1)}
            variant="secondary"
            className="bg-white text-blue-800 border-blue-200 hover:bg-blue-50 font-railway shadow-md"
          >
            Model: {currentModel}
          </Button>
          <Button
            onClick={speakResponse}
            variant="secondary"
            className="bg-white text-blue-800 border-blue-200 hover:bg-blue-50 font-railway shadow-md"
          >
            <Volume2 size={16} className="mr-2" />
            Speak
          </Button>
          <Button
            onClick={startVoiceRecognition}
            variant="secondary"
            className="bg-white text-blue-800 border-blue-200 hover:bg-blue-50 font-railway shadow-md"
          >
            <Mic size={16} className="mr-2" />
            Voice
          </Button>
          <Button
            onClick={clearChat}
            variant="secondary"
            className="bg-white text-blue-800 border-blue-200 hover:bg-blue-50 font-railway shadow-md"
          >
            <Trash2 size={16} className="mr-2" />
            Clear
          </Button>
        </div>

        {/* Input Area - Made brighter with more white space */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileInput}
              aria-label="Upload text file"
            />
            <Button
              variant="secondary"
              className="bg-blue-500 hover:bg-blue-600 text-white font-railway shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              type="button"
              aria-label="Upload text file"
            >
              <Upload size={20} className="mr-2" />
              Upload Text
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Mistry AI anything or upload a text file..."
              className="flex-1 bg-white border-blue-200 text-blue-800 placeholder-blue-400 font-poppins focus:border-blue-400 focus:ring-blue-400"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 text-white hover:bg-blue-600 font-railway shadow-md"
            >
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Builder Info Pop-up */}
        <BuilderInfoDialog open={showBuilderInfo} onOpenChange={setShowBuilderInfo} />

        {/* Footer */}
        <footer className="text-center mt-8 text-blue-400 font-quicksand">
          <p>&copy; 2025 Mistry AI - Your intelligent companion</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
