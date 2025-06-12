// addChatbotFAQs.js
// Utility script to add chatbot FAQs to the database

import axios from 'axios';
import config from '../config';
import chatbotFAQs from '../components/ChatbotFAQs';

/**
 * Adds chatbot FAQs to the database
 * @param {string} token - Admin authentication token
 * @returns {Promise<Array>} - Array of added FAQs
 */
const addChatbotFAQs = async (token) => {
  if (!token) {
    console.error('Authentication token is required');
    return [];
  }

  const addedFAQs = [];
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  for (const faq of chatbotFAQs) {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/chatbot/faqs`,
        faq,
        { headers }
      );
      
      addedFAQs.push(response.data);
      console.log(`Added FAQ: ${faq.question}`);
    } catch (error) {
      console.error(`Error adding FAQ: ${faq.question}`, error.response?.data || error.message);
    }
  }

  return addedFAQs;
};

export default addChatbotFAQs;
