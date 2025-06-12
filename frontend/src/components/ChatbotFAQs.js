// ChatbotFAQs.js
// This file contains FAQs for the chatbot

const chatbotFAQs = [
  {
    question: "How can I fix duplicate close buttons in the chatbot interface?",
    answer: "To fix duplicate close buttons in the chatbot interface, you need to make several changes to the code:\n\n1. Remove one of the close buttons from the chatbot header\n2. Add a backdrop that allows users to close the chatbot by clicking outside of it\n3. Replace the close button with a minimize button that has a different icon (down arrow)\n4. Improve the z-index of the chatbot dialog to ensure it appears above other elements\n\nThese changes maintain the functionality to close the chatbot while providing a more intuitive user experience. The chatbot can now be closed by clicking the minimize button in the header, clicking outside the chatbot (on the backdrop), or pressing the Escape key.",
    keywords: ["chatbot", "interface", "close button", "duplicate", "minimize", "UI", "user experience", "backdrop", "z-index"],
    category: "other"
  },
  {
    question: "What are the steps to add a copy conversation button to the chatbot?",
    answer: "To add a copy conversation button to the chatbot with a futuristic design:\n\n1. Add a button in the chatbot header with a copy icon\n2. Implement the copy functionality using navigator.clipboard.writeText()\n3. Add visual feedback when copying (tooltip and animation)\n4. Style the button with futuristic design elements including hover effects, glowing elements, and tooltips\n5. Ensure the button matches the existing aesthetic of the chatbot\n\nThis allows users to easily copy the entire conversation to their clipboard with a single click.",
    keywords: ["chatbot", "copy button", "conversation", "clipboard", "UI", "user experience", "futuristic design"],
    category: "other"
  },
  {
    question: "How do I add a new conversation button to the chatbot?",
    answer: "To add a new conversation button to the chatbot:\n\n1. Add a button in the chatbot header with a plus or refresh icon\n2. Implement the reset functionality to clear the current conversation\n3. Reset the conversation to the initial welcome message\n4. Style the button to match the futuristic design of the chatbot\n5. Add tooltips for better user experience\n\nThis allows users to start a fresh conversation without closing and reopening the chatbot.",
    keywords: ["chatbot", "new conversation", "reset", "UI", "user experience"],
    category: "other"
  }
];

export default chatbotFAQs;
