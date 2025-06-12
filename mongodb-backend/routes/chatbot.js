const express = require('express');
const router = express.Router();
const ChatbotFAQ = require('../models/ChatbotFAQ');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all chatbot FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await ChatbotFAQ.find().sort({ category: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching chatbot FAQs:', error);
    res.status(500).json({ message: 'Failed to fetch chatbot FAQs' });
  }
});

// Get chatbot FAQ by ID
router.get('/faqs/:id', async (req, res) => {
  try {
    const faq = await ChatbotFAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ message: 'Failed to fetch FAQ' });
  }
});

// Add a new chatbot FAQ (admin only)
router.post('/faqs', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { question, answer, keywords, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    // Create new FAQ
    const faq = new ChatbotFAQ({
      question,
      answer,
      keywords: keywords || [],
      category: category || 'general'
    });

    await faq.save();

    res.status(201).json(faq);
  } catch (error) {
    console.error('Error adding FAQ:', error);
    res.status(500).json({ message: 'Failed to add FAQ', error: error.message });
  }
});

// Update chatbot FAQ (admin only)
router.put('/faqs/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const faq = await ChatbotFAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Update fields
    const fieldsToUpdate = ['question', 'answer', 'keywords', 'category'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        faq[field] = req.body[field];
      }
    });

    faq.updatedAt = Date.now();
    await faq.save();

    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Failed to update FAQ', error: error.message });
  }
});

// Delete chatbot FAQ (admin only)
router.delete('/faqs/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const faq = await ChatbotFAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await ChatbotFAQ.findByIdAndDelete(req.params.id);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Failed to delete FAQ' });
  }
});

// Get chatbot response for a query
router.post('/query', async (req, res) => {
  try {
    const { query, userId } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Log the query for analytics (optional)
    console.log(`Chatbot query: "${query}" ${userId ? `from user: ${userId}` : ''}`);

    // Enhanced keyword matching algorithm with context awareness
    const faqs = await ChatbotFAQ.find();
    let matches = [];

    // Convert query to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();

    // Tokenize the query into words
    const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
    const queryWordSet = new Set(queryWords);

    // Check each FAQ for matches
    for (const faq of faqs) {
      let score = 0;
      const lowerQuestion = faq.question.toLowerCase();

      // Exact match gets highest score
      if (lowerQuery === lowerQuestion) {
        score += 50;
      }

      // Check if query contains the entire question
      if (lowerQuery.includes(lowerQuestion)) {
        score += 20;
      }

      // Check if question contains the entire query
      if (lowerQuestion.includes(lowerQuery)) {
        score += 15;
      }

      // Check for keyword matches
      for (const keyword of faq.keywords) {
        const lowerKeyword = keyword.toLowerCase();

        // Exact keyword match
        if (lowerQuery.includes(lowerKeyword)) {
          // Weight by keyword length - longer keywords are more specific
          score += 5 + Math.min(lowerKeyword.length / 2, 5);
        }

        // Partial keyword match (for compound keywords)
        if (lowerKeyword.length > 5 && lowerKeyword.split(/\s+/).some(part => lowerQuery.includes(part))) {
          score += 2;
        }
      }

      // Check for word overlap between query and question
      const questionWords = lowerQuestion.split(/\s+/).filter(word => word.length > 2);
      const questionWordSet = new Set(questionWords);

      // Calculate word overlap
      let overlapCount = 0;
      for (const word of queryWordSet) {
        if (questionWordSet.has(word)) {
          overlapCount++;
        }
      }

      // Add score based on percentage of overlap
      if (queryWordSet.size > 0) {
        const overlapPercentage = overlapCount / queryWordSet.size;
        score += overlapPercentage * 10;
      }

      // Category-based boosting
      if (query.toLowerCase().includes(faq.category.toLowerCase())) {
        score += 5;
      }

      // Add to matches if score is above threshold
      if (score > 2) {
        matches.push({
          faq,
          score,
          confidence: Math.min(score / 30, 1) // Normalize confidence score between 0 and 1
        });
      }
    }

    // Sort matches by score (descending)
    matches.sort((a, b) => b.score - a.score);

    // If no good match found, return a default response with suggestions
    if (matches.length === 0) {
      // Get top categories to suggest
      const categories = [...new Set(faqs.map(faq => faq.category))];

      return res.json({
        answer: "I'm sorry, I don't have specific information about that. Please try asking about our admission process, courses, facilities, or contact the college office for more details.",
        confidence: 0,
        suggestions: categories.slice(0, 5)
      });
    }

    // Get the best match
    const bestMatch = matches[0];

    // Check if we should provide alternative suggestions
    let suggestions = [];
    if (matches.length > 1 && bestMatch.confidence < 0.8) {
      // Add alternative questions as suggestions
      suggestions = matches.slice(1, 4).map(match => match.faq.question);
    }

    // Format the response with rich content support
    let formattedAnswer = bestMatch.faq.answer;

    // Return the best matching FAQ with suggestions
    res.json({
      answer: formattedAnswer,
      confidence: bestMatch.confidence,
      category: bestMatch.faq.category,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({
      message: 'Failed to process chatbot query',
      answer: "I'm experiencing technical difficulties right now. Please try again later or contact the college office directly."
    });
  }
});

module.exports = router;
