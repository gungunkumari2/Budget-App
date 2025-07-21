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
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  { icon: TrendingUp, label: 'Show spending trends', query: 'Show me my spending trends for this month' },
  { icon: DollarSign, label: 'Budget analysis', query: 'Analyze my current budget performance' },
  { icon: PieChart, label: 'Category breakdown', query: 'Break down my expenses by category' },
  { icon: Target, label: 'Savings tips', query: 'Give me personalized savings tips' },
];

const sampleResponses = {
  'spending trends': {
    content: "Based on your recent transactions, here's what I found:\n\n📈 **This Month's Trends:**\n• Food & Dining: Up 12% ($1,250)\n• Transportation: Down 5% ($850)\n• Shopping: Up 8% ($650)\n\n**Key Insights:**\n✅ You're spending less on transportation - great job!\n⚠️ Food expenses are above average - consider meal planning\n💡 Your weekend spending spikes by 40%\n\nWould you like specific tips to reduce food costs?",
    suggestions: ['Yes, show food saving tips', 'Analyze weekend spending', 'Compare to last month']
  },
  'budget': {
    content: "Here's your budget performance analysis:\n\n🎯 **Overall Performance: 85/100**\n\n**Category Status:**\n🟢 Entertainment: 75% used ($150/$200)\n🟡 Transportation: 105% used ($420/$400)\n🔴 Food: 81% used ($650/$800)\n\n**Recommendations:**\n1. You're $20 over transportation budget\n2. Great job staying under food budget!\n3. Consider reallocating $50 from food to transportation\n\nYour savings rate this month: 18.5%",
    suggestions: ['Reallocate budgets', 'Set spending alerts', 'View savings goals']
  },
  'category': {
    content: "📊 **Expense Breakdown (Last 30 days):**\n\n🍕 Food & Dining: $1,250 (35%)\n🚗 Transportation: $850 (24%)\n🛍️ Shopping: $650 (18%)\n🎬 Entertainment: $450 (13%)\n⚡ Utilities: $350 (10%)\n\n**Compared to average users:**\n• Your food spending is 15% higher\n• Transportation is 8% lower\n• Entertainment is perfectly balanced\n\n**Smart Tip:** Reducing food costs by just 10% could save you $125/month!",
    suggestions: ['Food saving strategies', 'Compare with similar users', 'Set category alerts']
  },
  'savings': {
    content: "💰 **Personalized Savings Tips for You:**\n\n**Immediate Wins (Save $280/month):**\n1. **Meal Planning** - Save $120/month\n   • Cook 3 more meals at home weekly\n   • Prep lunches on Sundays\n\n2. **Transportation Optimization** - Save $80/month\n   • Combine errands into single trips\n   • Use bike for trips under 2 miles\n\n3. **Subscription Audit** - Save $80/month\n   • Cancel unused streaming services\n   • Switch to annual plans for 15% savings\n\n**Next Level (Save $150/month):**\n• Set up automatic transfers to savings\n• Use the 24-hour rule for purchases over $50",
    suggestions: ['Create meal plan', 'Find subscription savings', 'Set savings automation']
  }
};

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI budget advisor. I can help you analyze spending, optimize budgets, and find savings opportunities. What would you like to know?",
      timestamp: new Date(),
      suggestions: ['Show spending trends', 'Analyze my budget', 'Give me savings tips']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (content: string) => {
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    let responseData = sampleResponses['savings']; // default
    
    if (input.includes('trend') || input.includes('spending')) {
      responseData = sampleResponses['spending trends'];
    } else if (input.includes('budget') || input.includes('performance')) {
      responseData = sampleResponses['budget'];
    } else if (input.includes('category') || input.includes('breakdown')) {
      responseData = sampleResponses['category'];
    } else if (input.includes('saving') || input.includes('tip')) {
      responseData = sampleResponses['savings'];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: responseData.content,
      timestamp: new Date(),
      suggestions: responseData.suggestions
    };
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Budget Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your finances and get personalized insights
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
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
            placeholder="Ask about your budget, expenses, or savings..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
            className="flex-1"
          />
          <Button onClick={() => sendMessage(inputValue)} disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};