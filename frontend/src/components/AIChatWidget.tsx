import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  Calendar,
  ShoppingCart,
  Car,
  Utensils,
  Home,
  PiggyBank,
  BarChart3,
  Receipt,
  Building2
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const suggestedQuestions = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Where did I spend the most last month?",
    category: "spending"
  },
  {
    icon: <Car className="h-4 w-4" />,
    text: "How much did I spend on travel this year?",
    category: "category"
  },
  {
    icon: <Target className="h-4 w-4" />,
    text: "Give me a monthly budget plan",
    category: "budget"
  },
  {
    icon: <PiggyBank className="h-4 w-4" />,
    text: "Suggest ways to cut spending",
    category: "savings"
  },
  {
    icon: <Utensils className="h-4 w-4" />,
    text: "What was my average food bill last 3 months?",
    category: "average"
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    text: "Show me my spending trends",
    category: "trends"
  },
  {
    icon: <Receipt className="h-4 w-4" />,
    text: "What are my recent transactions?",
    category: "transactions"
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    text: "Who are my top vendors?",
    category: "vendors"
  }
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your comprehensive AI financial advisor with complete knowledge of your financial data. I can help you with:\n\n• Complete spending analysis with all your transactions\n• Savings tracking and recommendations\n• Category-wise spending breakdown\n• Budget monitoring and alerts\n• Spending trends and patterns\n• Vendor and merchant analysis\n• Monthly and yearly comparisons\n• Personalized financial advice\n\nI have access to all your financial data including transactions, spending history, savings patterns, and budget information. Ask me anything about your finances!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || loading) return;
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      content,
      timestamp: new Date()
    };
    
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post('http://localhost:8000/api/upload-receipt/chat/', {
        message: content
      }, config);
      
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };
      
      setMessages(msgs => [...msgs, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err.message === 'Authentication required') {
        setError('Please log in to use the chat feature.');
      } else if (err.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError('Failed to get response. Please try again.');
      }
      
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date()
      };
      
      setMessages(msgs => [...msgs, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Widget */}
      {open && (
        <Card className="fixed bottom-20 right-4 w-96 h-[500px] shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              SmartBudget AI
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-start">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && !loading && (
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleSuggestedQuestion(question.text)}
                    >
                      <span className="mr-2">{question.icon}</span>
                      <span className="text-xs">{question.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your finances..."
                  className="flex-1"
                  disabled={loading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 