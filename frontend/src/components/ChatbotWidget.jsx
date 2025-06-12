import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import './ChatbotWidget.css';

// Common suggestion topics
const SUGGESTION_TOPICS = [
  { id: 1, text: 'Admission Process' },
  { id: 2, text: 'Course Information' },
  { id: 3, text: 'Faculty Details' },
  { id: 4, text: 'Campus Facilities' },
  { id: 5, text: 'Placement Services' },
  { id: 6, text: 'Hostel Accommodation' },
  { id: 7, text: 'Fee Structure' },
  { id: 8, text: 'Contact Information' }
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTION_TOPICS);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      type: 'bot',
      text: 'Hello! I\'m the GPC Itarsi AI Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);

    // Try to load chat history from localStorage
    try {
      const savedHistory = localStorage.getItem('gpc-chatbot-history');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Scroll to bottom of messages when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages]);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem('gpc-chatbot-history', JSON.stringify(chatHistory.slice(-20)));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [chatHistory]);

  // Toggle chatbot open/closed
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    handleSubmit(null, suggestion.text);
    setShowSuggestions(false);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle form submission
  const handleSubmit = async (e, suggestionText = null) => {
    if (e) e.preventDefault();

    const query = suggestionText || inputValue;
    if (!query.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Send query to backend using the full URL from config
      const response = await axios.post(`${config.apiUrl}/api/chatbot/query`, {
        query: userMessage.text,
        userId: localStorage.getItem('userId') // Optional: Send user ID if available
      });

      // Add bot response to chat
      const botMessage = {
        type: 'bot',
        text: response.data.answer,
        timestamp: new Date().toISOString(),
        category: response.data.category || 'general',
        confidence: response.data.confidence || 0
      };

      setMessages(prev => [...prev, botMessage]);

      // Update chat history
      setChatHistory(prev => [...prev, {
        question: userMessage.text,
        answer: botMessage.text,
        timestamp: botMessage.timestamp,
        category: botMessage.category
      }]);

      // If the backend provided suggestions, use them
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(
          response.data.suggestions.map((suggestion, index) => ({
            id: `s${index}`,
            text: suggestion
          }))
        );
        setShowSuggestions(true);
      } else {
        // Otherwise generate our own suggestions based on the conversation
        generateSuggestions(userMessage.text, botMessage.text);
      }
    } catch (error) {
      console.error('Error querying chatbot:', error);

      // Try to get error message from response if available
      const errorText = error.response?.data?.answer ||
                        error.response?.data?.message ||
                        'Sorry, I encountered an error. Please try again later.';

      // Add error message to chat
      const errorMessage = {
        type: 'bot',
        text: errorText,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);

      // Show general suggestions after an error
      setSuggestions(SUGGESTION_TOPICS.slice(0, 4));
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate contextual suggestions based on conversation
  const generateSuggestions = (question, answer) => {
    // Simple keyword matching to generate relevant suggestions
    const lowerQuestion = question.toLowerCase();
    const lowerAnswer = answer.toLowerCase();

    let newSuggestions = [];

    // Check for admission related queries
    if (lowerQuestion.includes('admission') || lowerQuestion.includes('apply') || lowerAnswer.includes('admission')) {
      newSuggestions.push({ id: 'a1', text: 'Admission Requirements' });
      newSuggestions.push({ id: 'a2', text: 'Application Deadline' });
      newSuggestions.push({ id: 'a3', text: 'Admission Process' });
    }

    // Check for course related queries
    if (lowerQuestion.includes('course') || lowerQuestion.includes('program') || lowerQuestion.includes('study') ||
        lowerAnswer.includes('course') || lowerAnswer.includes('program')) {
      newSuggestions.push({ id: 'c1', text: 'Course Duration' });
      newSuggestions.push({ id: 'c2', text: 'Available Courses' });
      newSuggestions.push({ id: 'c3', text: 'Course Syllabus' });
    }

    // Check for fee related queries
    if (lowerQuestion.includes('fee') || lowerQuestion.includes('cost') || lowerQuestion.includes('tuition') ||
        lowerAnswer.includes('fee') || lowerAnswer.includes('payment')) {
      newSuggestions.push({ id: 'f1', text: 'Fee Structure' });
      newSuggestions.push({ id: 'f2', text: 'Payment Methods' });
      newSuggestions.push({ id: 'f3', text: 'Scholarships' });
    }

    // If no specific suggestions, provide general ones
    if (newSuggestions.length === 0) {
      newSuggestions = SUGGESTION_TOPICS.slice(0, 4);
    }

    // Limit to 4 suggestions
    setSuggestions(newSuggestions.slice(0, 4));
    setShowSuggestions(true);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Escape key to close chatbot
    if (e.key === 'Escape' && isOpen) {
      toggleChatbot();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button - only shown when chatbot is closed */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="chatbot-toggle-btn"
          aria-label="Open chatbot"
        >
          {/* Tech scan effect */}
          <div className="tech-scan"></div>

          {/* Orbiting particles */}
          <div className="orbit-particle" style={{ top: '5%', left: '50%' }}></div>
          <div className="orbit-particle" style={{ top: '50%', right: '5%' }}></div>
          <div className="orbit-particle" style={{ bottom: '10%', left: '10%' }}></div>

          {/* Modern AI/Chatbot icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <circle cx="9" cy="10" r="1"></circle>
            <circle cx="15" cy="10" r="1"></circle>
            <path d="M9.5 14h5"></path>
          </svg>
        </button>
      )}

      {/* Chatbot dialog */}
      {isOpen && (
        <>
          {/* Backdrop to close chatbot when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={toggleChatbot}
            aria-hidden="true"
          ></div>
          <div className="chatbot-dialog z-50">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="9" cy="10" r="1"></circle>
                <circle cx="15" cy="10" r="1"></circle>
                <path d="M9.5 14h5"></path>
              </svg>
              <span className="chatbot-title-text">GPC Itarsi AI Assistant</span>
            </div>
            <div className="chatbot-actions">
              <div className="chatbot-action-wrapper">
                <button
                  onClick={() => {
                    // Copy conversation to clipboard
                    const conversationText = messages
                      .map(msg => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.text}`)
                      .join('\n\n');
                    navigator.clipboard.writeText(conversationText)
                      .then(() => {
                        // Show a brief visual feedback
                        const copyBtn = document.getElementById('copy-conversation-btn');
                        if (copyBtn) {
                          copyBtn.classList.add('copy-success');
                          setTimeout(() => copyBtn.classList.remove('copy-success'), 1500);
                        }
                        // Show tooltip
                        setShowCopyTooltip(true);
                        setTimeout(() => setShowCopyTooltip(false), 2000);
                      })
                      .catch(err => console.error('Failed to copy conversation:', err));
                  }}
                  id="copy-conversation-btn"
                  className="chatbot-action-btn"
                  aria-label="Copy conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <div className="chatbot-tooltip-hover">
                    Copy conversation
                  </div>
                  {showCopyTooltip && (
                    <div className="chatbot-tooltip">
                      Conversation copied!
                    </div>
                  )}
                </button>
              </div>
              <div className="chatbot-action-wrapper">
                <button
                  onClick={() => {
                    // Reset conversation
                    setMessages([{
                      type: 'bot',
                      text: 'Hello! I\'m the GPC Itarsi AI Assistant. How can I help you today?',
                      timestamp: new Date().toISOString()
                    }]);
                    setShowSuggestions(true);
                    setSuggestions(SUGGESTION_TOPICS.slice(0, 4));
                  }}
                  className="chatbot-action-btn"
                  aria-label="New conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="chatbot-tooltip-hover">
                    New conversation
                  </div>
                </button>
              </div>

              {/* Minimize button instead of close */}
              <div className="chatbot-action-wrapper">
                <button
                  onClick={toggleChatbot}
                  className="chatbot-action-btn"
                  aria-label="Minimize chatbot"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <div className="chatbot-tooltip-hover">
                    Minimize
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.type === 'user' ? 'user-message-container' : 'bot-message-container'}`}
              >
                <div
                  className={`message-bubble ${
                    message.type === 'user' ? 'user-message' : 'bot-message'
                  } ${message.isError ? 'error-message' : ''}`}
                >
                  {message.text}
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && !isLoading && (
              <div className="chatbot-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your question..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
        </>
      )}
    </div>
  );
};

export default ChatbotWidget;
