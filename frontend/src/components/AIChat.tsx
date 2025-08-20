import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  DollarSign,
  PieChart,
  Target,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isLoading?: boolean;
}

const quickActions = [
  { icon: TrendingUp, label: 'Spending Analysis', query: 'Analyze my spending patterns and trends' },
  { icon: DollarSign, label: 'Budget Review', query: 'Review my budget and suggest improvements' },
  { icon: PieChart, label: 'Financial Health', query: 'How is my overall financial health?' },
  { icon: Target, label: 'Smart Advice', query: 'Give me personalized financial advice' },
];

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI financial assistant. Ask me about your spending, budget, or any financial questions.",
      timestamp: new Date(),
      suggestions: ['Analyze my spending', 'Review my budget', 'Financial advice', 'Explain a concept']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await apiService.sendChatMessage({
        message: content
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.message,
        timestamp: new Date(),
        suggestions: generateSuggestions(content, response.data.message)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsConnected(true);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting to my financial analysis system right now. Please try again in a moment, or you can ask me general financial questions and I'll do my best to help!",
        timestamp: new Date(),
        suggestions: ['Try again', 'General financial advice', 'Budget tips']
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsConnected(false);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSuggestions = (userQuery: string, aiResponse: string): string[] => {
    const query = userQuery.toLowerCase();
    const response = aiResponse.toLowerCase();
    
    // Generate contextual suggestions based on the conversation
    const suggestions = [];
    
    if (query.includes('spending') || query.includes('expense')) {
      suggestions.push('Show me spending trends', 'Break down by category', 'Compare to last month');
    } else if (query.includes('budget') || query.includes('planning')) {
      suggestions.push('Set budget goals', 'Review budget performance', 'Budget optimization tips');
    } else if (query.includes('save') || query.includes('saving')) {
      suggestions.push('Savings strategies', 'Emergency fund advice', 'Investment basics');
    } else if (query.includes('income') || query.includes('earn')) {
      suggestions.push('Income optimization', 'Side hustle ideas', 'Salary negotiation tips');
    } else if (query.includes('debt') || query.includes('loan')) {
      suggestions.push('Debt management strategies', 'Debt payoff methods', 'Credit score tips');
    } else if (query.includes('invest') || query.includes('investment')) {
      suggestions.push('Investment basics', 'Portfolio diversification', 'Risk assessment');
    } else {
      // General suggestions for any query
      suggestions.push('Analyze my finances', 'Financial health check', 'Smart money tips');
    }
    
    return suggestions.slice(0, 3);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleRetry = () => {
    if (messages.length > 1) {
      const lastUserMessage = messages.findLast(msg => msg.type === 'user');
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI financial assistant. Ask me about your spending, budget, or any financial questions.",
      timestamp: new Date(),
      suggestions: ['Analyze my spending', 'Review my budget', 'Financial advice', 'Explain a concept']
    }]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>AI Financial Assistant</CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        <CardDescription>
          Get precise answers about your finances
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-3"
                onClick={() => handleQuickAction(action.query)}
              >
                <action.icon className="h-4 w-4 mr-2" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary/10' : 'bg-muted'}`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg max-w-sm ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {/* AI Suggestions */}
                {message.type === 'ai' && message.suggestions && (
                  <div className="mt-2 ml-10 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-2 text-xs text-left justify-start bg-background/50 hover:bg-background"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your finances...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your finances..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={() => sendMessage(inputValue)} 
            disabled={!inputValue.trim() || isTyping}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Connection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};