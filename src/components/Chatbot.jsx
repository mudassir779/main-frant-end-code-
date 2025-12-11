import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Bot, User, TreePine, Sparkles,
  Paperclip, MapPin, Phone, Star, Clock, Volume2, VolumeX,
  Image as ImageIcon, Loader
} from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { sendTreeAnalysisEmail } from '../utils/emailService';

// Sound effect for new messages (subtle pop)
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Vapi State
  const [isCallActive, setIsCallActive] = useState(false);
  const vapiRef = useRef(null);

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Business Hours Logic
  const isBusinessHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    // Mon-Fri, 8am-6pm
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
  };

  // Initialize Vapi
  useEffect(() => {
    try {
      const vapi = new Vapi('7649bce6-4568-49ed-bd41-b8665a5a583a');
      vapiRef.current = vapi;

      vapi.on('call-start', () => {
        setIsCallActive(true);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Voice call started. Listening...",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });

      vapi.on('call-end', () => {
        setIsCallActive(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Voice call ended.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });

      vapi.on('error', (e) => {
        console.error("Vapi Error:", e);
        setIsCallActive(false);
      });

    } catch (error) {
      console.error("Failed to initialize Vapi:", error);
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const toggleCall = () => {
    if (vapiRef.current) {
      if (isCallActive) {
        vapiRef.current.stop();
      } else {
        vapiRef.current.start('1db96221-98c5-4ef3-a4c7-f60c999a4883');
      }
    }
  };

  // Initial Welcome Message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hi👋 this is Abdias from American Tree Experts. How may I assist you today?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Play sound on new bot message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'bot' && soundEnabled) {
      notificationSound.volume = 0.5;
      notificationSound.play().catch(e => console.log("Audio play failed", e));
    }
  }, [messages, soundEnabled]);

  // Tree service Q&A database - Comprehensive conversation flow
  const qaDatabase = [
    {
      // General Greeting / Initial Call
      keywords: ['hello', 'hi', 'hey', 'calling', 'leaning', 'worried', 'concern', 'help with a tree'],
      response: "Thank you for calling. I understand your concern. We can definitely help with that. Could you tell me a little more about the tree and its location?"
    },
    {
      // Specific Tree Details
      keywords: ['species', 'tall', 'height', 'feet', 'branches', 'touching', 'wires', 'power lines'],
      response: "Okay, we'll need to take a closer look at it to determine the best course of action. We may need to trim the branches or remove the entire tree. We also need to ensure that we're working safely around the power lines."
    },
    {
      // Cost / Price
      keywords: ['cost', 'price', 'charge', 'how much', 'estimate', 'rates'],
      response: "We can give you a more accurate estimate once we've assessed the situation. However, for a job like this, we typically charge between $500-$2000 depending on the complexity and size of the tree."
    },
    {
      // Insurance / Certification
      keywords: ['insurance', 'insured', 'certified', 'arborist', 'license', 'staff'],
      response: "Yes, we are fully insured and have certified arborists on staff who are trained and experienced in working with trees."
    },
    {
      // Quote / Assessment Request
      keywords: ['quote', 'assessment', 'come out', 'visit', 'inspect', 'comfortable'],
      response: "Absolutely. We can schedule a time for you to come out and assess the situation. We'll also discuss all the details of the job with you and provide a written quote."
    },
    {
      // Safety
      keywords: ['safety', 'safe', 'protection', 'protect', 'damage', 'equipment', 'glasses', 'gloves', 'helmet'],
      response: "We take safety very seriously. All our crews are trained in safety procedures, and we use the proper safety equipment, including helmets, safety glasses, and gloves. We also take precautions to protect your property by using drop cloths and ensuring that no debris damages your fences or landscaping."
    },
    {
      // Liability / Damage Concerns
      keywords: ['wrong', 'falls', 'house', 'damage', 'insurance policy', 'liability'],
      response: "We understand your concerns. Our insurance policy covers any damage to your property during the work. We also have a policy of working with you throughout the entire process to ensure that you are comfortable with our work."
    },
    {
      // Scheduling Finalization
      keywords: ['book', 'schedule', 'appointment', 'address', 'time works'],
      response: "Sounds good. We'll need to know your address and a time that works for you to assess the situation."
    },
    {
      // "I need some trees serviced" - Initial Quote Request
      keywords: ['need tree', 'service', 'yard', 'get a quote', 'serviced'],
      response: "I'd be happy to help you get a quote! To provide you with an accurate estimate, I'll need some information:\n\n1. What type of service are you looking for?\n   • Tree trimming/pruning\n   • Tree removal\n   • Stump grinding/removal\n   • Emergency tree service\n   • Tree planting"
    },
    {
      // Tree Information Gathering
      keywords: ['number', 'type', 'oak', 'maple', 'pine', 'size', 'condition', 'diseased', 'healthy', 'location'],
      response: "Great! Can you tell me about the tree(s) in question?\n\n• Number of trees: How many trees need attention?\n• Tree type: What kind of tree is it (e.g., Oak, Maple, Pine, Crepe Myrtle)?\n• Tree size: How tall is the tree?\n  - Small (up to 30 feet)\n  - Medium (30-60 feet)\n  - Large (over 60 feet)\n• Tree condition: Is the tree healthy, diseased, or damaged?\n• Location: Where is the tree located on your property? Is it near structures, power lines, fences, or other obstacles?"
    },
    {
      // Specific Goals/Concerns
      keywords: ['goal', 'dead', 'decaying', 'interfering', 'roof', 'shape', 'appearance', 'construction'],
      response: "What are your specific concerns or goals for the tree service?\n\n• Are you concerned about dead or decaying branches that could fall?\n• Are branches interfering with power lines or your roof?\n• Are you looking to improve the tree's shape or appearance?\n• Are you planning a construction project that requires tree removal?"
    },
    {
      // Timing
      keywords: ['when', 'timeframe', 'soon', 'emergency', 'immediate', 'urgent'],
      response: "When would you like the service to be performed?\n\n• Is this an emergency situation requiring immediate attention?\n• Do you have a preferred timeframe for the work?"
    },
    {
      // Budget
      keywords: ['budget', 'afford', 'range'],
      response: "What is your budget for this service? While this can be discussed during negotiation, knowing your budget can help us tailor the quote to your needs."
    },
    {
      // Quote Details
      keywords: ['include', 'breakdown', 'timeline', 'payment', 'terms'],
      response: "A complete tree service quote or estimate will include:\n\n• Company Name and Contact Information\n• Client's Name and Contact Information\n• Estimate Number and Job Name (for record-keeping)\n• Detailed Description of Services (e.g., trimming, removal, stump grinding)\n• Breakdown of Costs (including labor, materials, equipment rental, taxes, discounts)\n• Project Timeline (if applicable)\n• Payment Terms and Methods\n• Proof of Insurance and Licensing"
    },
    {
      // Services Definitions
      keywords: ['trimming', 'pruning', 'trim'],
      response: "Tree trimming and pruning services help maintain the health and appearance of your trees. We can remove dead or overgrown branches, improve tree structure, and ensure safety around your property."
    },
    {
      keywords: ['removal', 'remove', 'cut down'],
      response: "Tree removal may be necessary for diseased, damaged, or hazardous trees. We safely remove trees of all sizes, ensuring no damage to your property or surrounding structures."
    },
    {
      keywords: ['stump', 'grinding'],
      response: "After tree removal, we offer stump grinding and removal services to completely clear the area. This prevents regrowth and allows you to use the space for landscaping or construction."
    },
    {
      keywords: ['planting', 'plant'],
      response: "We also provide tree planting services! We can help you select the right tree species for your property and ensure proper planting for healthy growth."
    }
  ];

  const findBestResponse = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;

    for (const qa of qaDatabase) {
      const matches = qa.keywords.reduce((count, keyword) => {
        return count + (input.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = qa.response;
      }
    }

    return bestMatch || "Thank you for your message. One of our tree care specialists will be with you shortly to answer your specific question. In the meantime, feel free to ask about our services, pricing, insurance, or schedule an assessment.";
  };

  const handleSendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;

    if (!textToSend.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setShowQuickReplies(false);
    setIsTyping(true);

    try {
      // Call Backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages // Send history for context
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error:', error);
      // Fallback response if API fails
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to the server right now. Please call us at 812-457-3433 for immediate assistance.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server
      // Here we'll just simulate sending an image
      const userMessage = {
        id: Date.now(),
        text: `Sent an image: ${file.name}`,
        sender: 'user',
        isImage: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: "I've received your photo. This helps us assess the situation better. Could you provide a brief description of what we're looking at?",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);

    // Simulate analysis based on previous messages (simplified)
    const analysis = "Customer requested a quote via chatbot. Please review chat history for details.";

    const emailData = {
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      analysis: analysis,
      price: "$500 - $2000 (Estimate)", // You might want to make this dynamic
      imageUrl: "Image available in chat"
    };

    const result = await sendTreeAnalysisEmail(emailData);

    setIsSendingEmail(false);
    setShowContactForm(false);

    if (result.success) {
      const botMessage = {
        id: Date.now(),
        text: "Thank you! Your request has been sent to our team. We will contact you shortly to schedule your assessment.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      const botMessage = {
        id: Date.now(),
        text: "I apologize, but there was an issue sending your request. Please try again or call us directly.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }
    setContactForm({ name: '', email: '', phone: '' });
  };

  const handleQuickReply = (reply) => {
    if (reply === "Request a Quote" || reply === "Schedule Service") {
      const botMessage = {
        id: Date.now(),
        text: "I can help with that! Please provide your contact details so we can reach you.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setShowContactForm(true);
    } else {
      handleSendMessage(null, reply);
    }
  };

  const quickReplies = [
    "Request a Quote",
    "Schedule Service",
    "Emergency Tree Removal",
    "Tree Health Assessment"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
        }
        .pattern-grid {
          background-image: radial-gradient(#166534 0.5px, transparent 0.5px);
          background-size: 10px 10px;
          opacity: 0.03;
        }
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-br from-lime-600 to-green-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 border-[3px] border-lime-200/30"
          aria-label="Open chat"
        >
          <div className="absolute inset-0 rounded-full bg-lime-300/30 blur-md group-hover:blur-lg transition-all"></div>
          <div className="relative flex items-center justify-center">
            <Bot size={32} className="animate-float drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel rounded-3xl shadow-2xl w-[350px] sm:w-[400px] flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5 transition-all duration-300 animate-fade-in-up" style={{ height: '600px', maxHeight: '85vh' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-lime-700 via-green-700 to-green-800 p-4 flex justify-between items-center text-white relative overflow-hidden shrink-0 shadow-md">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-400/20 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden shadow-lg bg-lime-100 flex items-center justify-center">
                  <Bot size={28} className="text-lime-700" />
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-green-800 rounded-full ${isBusinessHours() ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide leading-tight text-white drop-shadow-sm">Abdias</h3>
                <p className="text-xs text-lime-100/90 flex items-center gap-1">
                  Tree Specialist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              {/* Call Button */}
              <button
                onClick={toggleCall}
                className={`p-2 rounded-full transition-all duration-300 ${isCallActive ? 'bg-red-500 text-white animate-pulse' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                title={isCallActive ? "End Call" : "Start Voice Call"}
              >
                <Phone size={18} className={isCallActive ? "fill-current" : ""} />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/80 relative space-y-4 custom-scrollbar">
            <div className="absolute inset-0 pattern-grid pointer-events-none"></div>

            <div className="text-center text-xs text-gray-400 my-2 font-medium flex items-center justify-center gap-2">
              <span className="h-px w-12 bg-gray-200"></span>
              <span>Today</span>
              <span className="h-px w-12 bg-gray-200"></span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 relative z-10 animate-slide-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-lime-200 flex-shrink-0 shadow-sm bg-lime-50 flex items-center justify-center">
                    <Bot size={18} className="text-lime-700" />
                  </div>
                )}

                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[280px] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-lime-600 to-green-700 text-white rounded-br-none shadow-lime-200'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-gray-100'
                      }`}
                  >
                    {msg.text}
                    {msg.isImage && (
                      <div className="mt-2 flex items-center gap-2 bg-white/20 p-2 rounded-lg text-xs">
                        <ImageIcon size={14} />
                        <span>Image attached</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 border border-gray-200 shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2.5 animate-slide-up">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-lime-200 flex-shrink-0 shadow-sm bg-lime-50 flex items-center justify-center">
                  <Bot size={18} className="text-lime-700" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center h-10">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form Overlay */}
          {showContactForm && (
            <div className="absolute inset-0 bg-white/95 z-30 flex flex-col justify-center p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-green-800">Contact Details</h3>
                <button onClick={() => setShowContactForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none text-sm"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none text-sm"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none text-sm"
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full bg-gradient-to-r from-lime-600 to-green-700 text-white p-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Replies */}
          {showQuickReplies && !isTyping && messages.length < 3 && !showContactForm && (
            <div className="px-4 py-2 bg-gray-50/50 flex gap-2 overflow-x-auto scrollbar-none">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white border border-lime-200 text-lime-700 text-xs rounded-full hover:bg-lime-50 transition-colors shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-white border-t border-gray-100 relative z-20 shrink-0">
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-lime-500/20 focus-within:border-lime-500 outline-none transition-all shadow-inner">

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-lime-600 transition-colors rounded-full hover:bg-gray-100"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-2 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-lime-600 to-green-700 hover:from-lime-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all shadow-md transform active:scale-95 flex items-center justify-center"
              >
                <Send size={16} className={inputText.trim() ? 'ml-0.5' : ''} />
              </button>
            </div>

            <div className="text-center mt-2.5 flex justify-between items-center px-2">
              <div className="flex flex-col items-start">
                <p className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Call for more information</p>
                <a href="tel:812-457-3433" className="text-sm font-black text-gray-900 flex items-center gap-1 hover:text-lime-700 transition-colors">
                  <Phone size={14} className="text-green-600 fill-green-600" />
                  812-457-3433
                </a>
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
                <span className="flex items-center gap-0.5 text-lime-700/80">
                  <TreePine size={10} />
                  <span className="tracking-tight">American Tree Experts</span>
                </span>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
