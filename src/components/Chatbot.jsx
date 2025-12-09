import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, TreePine, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi👋 this is Abdias from American Tree Experts. How may I assist you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Count how many keywords from the list are present in the user input
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    // Simulate bot response with intelligent matching
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: findBestResponse(currentInput),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .pattern-grid {
          background-image: radial-gradient(#166534 0.5px, transparent 0.5px);
          background-size: 10px 10px;
          opacity: 0.03;
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
        <div className="glass-panel rounded-3xl shadow-2xl w-[350px] sm:w-96 flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5 transition-all duration-300 animate-fade-in-up" style={{ height: '550px', maxHeight: '80vh' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-lime-700 via-green-700 to-green-800 p-5 flex justify-between items-center text-white relative overflow-hidden shrink-0">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/15 p-2.5 rounded-xl border border-white/20 backdrop-blur-md shadow-inner">
                <Bot size={26} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide leading-tight text-white drop-shadow-sm">American Tree<br />Experts</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/80 relative space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="absolute inset-0 pattern-grid pointer-events-none"></div>

            <div className="text-center text-xs text-gray-400 my-2 font-medium">
              <span>Today</span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 relative z-10 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-lime-100 to-green-100 border border-lime-200 flex-shrink-0 flex items-center justify-center shadow-sm">
                    <Bot size={16} className="text-green-700" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-br from-lime-600 to-green-700 text-white rounded-br-none shadow-lime-200'
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-gray-100'
                    }`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 border border-gray-200 shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 relative z-20 shrink-0">
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-lime-500/20 focus-within:border-lime-500 transition-all shadow-inner">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-3 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-lime-600 to-green-700 hover:from-lime-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all shadow-md transform active:scale-95 flex items-center justify-center"
              >
                <Send size={16} className={inputText.trim() ? 'ml-0.5' : ''} />
              </button>
            </div>
            <div className="text-center mt-2.5">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5 font-medium">
                <span className="flex items-center gap-0.5 text-lime-700/80">
                  <TreePine size={10} />
                  <span className="tracking-tight">American Tree Experts</span>
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                <span>AI Assistant</span>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
