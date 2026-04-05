'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickReply {
  label: string;
  value: string;
}

const tabCategories = [
  { id: 'claims', label: 'Claims', icon: 'description' },
  { id: 'premiums', label: 'Premiums', icon: 'attach_money' },
  { id: 'registration', label: 'Register', icon: 'how_to_reg' },
  { id: 'coverage', label: 'Coverage', icon: 'bolt' },
  { id: 'account', label: 'Account', icon: 'account_circle' },
];

const quickRepliesByCategory: { [key: string]: QuickReply[] } = {
  claims: [
    { label: 'How do I file a claim?', value: 'How do I file a claim' },
    { label: 'When do I get paid?', value: 'When do I get paid' },
    { label: 'Why was my claim rejected?', value: 'Why was my claim rejected' },
    { label: 'How much will I receive?', value: 'How much will I receive' },
  ],
  premiums: [
    { label: 'How is my premium calculated?', value: 'How is my premium calculated' },
    { label: 'When do I pay?', value: 'When do I pay' },
    { label: 'Can I get a refund?', value: 'Can I get a refund' },
    { label: 'Is there a discount?', value: 'Is there a discount for good behavior' },
  ],
  registration: [
    { label: 'How do I register?', value: 'How do I register' },
    { label: 'What documents needed?', value: 'What documents do I need' },
    { label: 'Which platforms supported?', value: 'Which platforms are supported' },
    { label: 'How long does it take?', value: 'How long does registration take' },
  ],
  coverage: [
    { label: 'What triggers are covered?', value: 'What triggers are covered' },
    { label: 'How do I know if trigger is active?', value: 'How do I know if a trigger is active' },
    { label: 'What if multiple triggers?', value: 'What if multiple triggers activate at once' },
    { label: 'Do I need to file a claim?', value: 'Do I need to file a claim manually' },
  ],
  account: [
    { label: 'How do I cancel?', value: 'How do I cancel my policy' },
    { label: 'How do I contact support?', value: 'How do I contact support' },
    { label: 'Is my data secure?', value: 'Is my data secure' },
    { label: 'How do I update my number?', value: 'How do I update my phone number' },
  ],
};

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'agent',
      text: 'Hi! I\'m GigShield Support Bot. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('claims');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 0,
          sender: 'agent',
          text: 'Hi! I\'m GigShield Support Bot. How can I help you today?',
          timestamp: new Date(),
        },
      ]);
      setShowQuickReplies(true);
      setActiveTab('claims');
    }
  }, [isOpen]);

  const getAutomatedResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('claim') && (message.includes('file') || message.includes('how') || message.includes('do'))) {
      return 'You don\'t need to file claims manually! GigShield automatically detects when covered triggers activate in your area and generates claims on your behalf. No paperwork needed - it\'s completely automatic!';
    }
    if (message.includes('paid') || message.includes('payment') || message.includes('receive') || message.includes('payout')) {
      return 'Approved claims are processed within 30 minutes! Payouts are sent via UPI to your registered phone number. You\'ll receive an SMS notification once the payment is initiated.';
    }
    if (message.includes('reject') || message.includes('denied') || message.includes('why')) {
      return 'Claims may be rejected if: (1) GPS data shows you weren\'t in the affected area, (2) Multiple claims show suspicious patterns, (3) Behavioral analysis flags potential fraud. You can appeal rejected claims through the dashboard.';
    }
    if (message.includes('much') || message.includes('amount') || message.includes('receive')) {
      return 'Payout amounts vary by trigger: Rain Surge (₹500), Extreme Heat (₹300), Pollution Alert (₹250), Flood Alert (₹750), Curfew/Lockdown (₹1000), Platform Outage (₹400), Demand Surge (₹350), Traffic Disruption (₹200), Transport Strike (₹450).';
    }
    if (message.includes('premium') || message.includes('price') || message.includes('cost') || message.includes('calculate')) {
      return 'Your premium is calculated based on your city risk zone, delivery platform, average weekly earnings, and behavior score. The AI analyzes these factors to determine a fair weekly price between ₹25-₹100.';
    }
    if (message.includes('when') && message.includes('pay')) {
      return 'Premiums are auto-deducted weekly from your UPI-linked account. You only need to ensure sufficient balance. The deduction happens every Monday at 6AM.';
    }
    if (message.includes('refund') || message.includes('money back')) {
      return 'There\'s no refund for the current week once deducted. However, you can cancel anytime with 24-hour notice to stop future deductions.';
    }
    if (message.includes('discount') || message.includes('reward') || message.includes('behavior')) {
      return 'Yes! Workers with good claim history and no fraud flags receive up to 20% discount on their premiums. Good behavior is rewarded!';
    }
    if (message.includes('register') || message.includes('sign up') || message.includes('start')) {
      return 'To register, click "Register My Gear" on the homepage, fill in your personal details, select your delivery platform (Zomato, Swiggy, Amazon, Zepto, or Blinkit), and complete the 4-step registration process. Your coverage starts immediately!';
    }
    if (message.includes('document') || message.includes('need') || message.includes('required')) {
      return 'You only need your Aadhaar-linked phone number for UPI payouts. No paperwork, no documents to upload - completely digital!';
    }
    if (message.includes('platform') || message.includes('swiggy') || message.includes('zomato') || message.includes('amazon') || message.includes('supported')) {
      return 'GigShield works with all major delivery platforms: Zomato, Swiggy, Amazon, Zepto, and Blinkit. We support delivery partners across 7 cities in India!';
    }
    if (message.includes('long') || message.includes('take') || message.includes('time')) {
      return 'The entire registration process takes less than 5 minutes. Just fill in your details, select your platform, and you\'re covered!';
    }
    if (message.includes('trigger') || message.includes('covered') || message.includes('coverage')) {
      return 'GigShield covers 9 parametric triggers: Rain Surge (50mm/hr+), Extreme Heat (45°C+), Pollution Alert (AQI 300+), Flood Alert, Curfew/Lockdown, Platform Outage, Demand Surge, Traffic Disruption, and Transport Strike.';
    }
    if (message.includes('know') && message.includes('active')) {
      return 'You\'ll receive an SMS and in-app notification when a trigger activates in your area. You can also check the dashboard for active triggers in real-time.';
    }
    if ((message.includes('multiple') || message.includes('many')) && message.includes('trigger')) {
      return 'You receive payout for each activated trigger. There\'s no limit on the number of claims per week. If 3 triggers activate in your area, you get paid for all 3!';
    }
    if (message.includes('manually') || (message.includes('file') && message.includes('claim'))) {
      return 'No! Claims are automatically generated when covered triggers activate in your area. No paperwork needed - it\'s completely automatic!';
    }
    if (message.includes('cancel') || message.includes('stop') || message.includes('end')) {
      return 'Go to Settings page and click "Cancel Policy". There\'s no cancellation fee, but you won\'t receive a refund for the current week. You can cancel anytime with 24-hour notice.';
    }
    if (message.includes('contact') || message.includes('support') || message.includes('help')) {
      return 'You can: (1) Use this Live Chat, (2) Email support@gigshield.in, (3) Call 1800-XXX-XXXX (Mon-Sat, 9AM-6PM). Our team is here to help!';
    }
    if (message.includes('secure') || message.includes('safe') || message.includes('data') || message.includes('privacy')) {
      return 'Yes! We use bank-level encryption and never share your personal data with third parties. Your information is completely secure and protected.';
    }
    if (message.includes('update') && message.includes('number') || message.includes('phone')) {
      return 'Go to Profile page and update your phone number. Make sure it\'s linked to UPI for seamless payouts.';
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start')) {
      return 'Hello! Welcome to GigShield. I can help you with: claims, premiums, registration, coverage, payouts, cancellations, and more. Just ask!';
    }
    if (message.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with? Feel free to ask more questions or click the quick replies below.';
    }

    return 'I\'m here to help! You can ask me about claims, premiums, registration, coverage, payouts, cancellations, or any other questions about GigShield. You can also click the quick replies below for common questions.';
  };

  const handleQuickReply = (value: string) => {
    setShowQuickReplies(false);
    
    const userMessage: Message = {
      id: messages.length,
      sender: 'user',
      text: value,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const agentResponse: Message = {
        id: messages.length + 1,
        sender: 'agent',
        text: getAutomatedResponse(value),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setShowQuickReplies(false);

    const userMessage: Message = {
      id: messages.length,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const agentResponse: Message = {
        id: messages.length + 1,
        sender: 'agent',
        text: getAutomatedResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 h-[600px] flex flex-col overflow-hidden glass-card">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">support_agent</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface">GigShield Support</h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        {/* Tab Categories */}
        <div className="flex gap-1 px-2 py-2 border-b border-white/10 overflow-x-auto">
          {tabCategories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-br-md'
                    : 'bg-surface-container-low text-on-surface rounded-bl-md'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-on-primary/70' : 'text-on-surface/50'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low p-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-on-surface/30 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-on-surface/30 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-on-surface/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          {/* Quick Replies - Above Input Field */}
          {showQuickReplies && (
            <div className="mb-3">
              <p className="text-xs text-on-surface/50 mb-2">Tap a question to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickRepliesByCategory[activeTab]?.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply.value)}
                    className="px-3 py-2 bg-surface-container-low border border-white/10 rounded-xl text-xs text-on-surface hover:bg-primary/10 hover:border-primary/30 transition-all text-left"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.length > 1 && showQuickReplies === false && (
            <button
              onClick={() => setShowQuickReplies(true)}
              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mb-3 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              Show more suggestions
            </button>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-on-primary">send</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-on-surface/50 mt-2">
            AI-powered assistant • Available 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
