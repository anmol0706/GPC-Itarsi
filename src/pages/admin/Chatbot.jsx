import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentFaqId, setCurrentFaqId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Test chatbot state
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch all FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/chatbot/faqs');
      setFaqs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('Failed to load FAQs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormMode('add');
    setCurrentFaqId(null);
    setQuestion('');
    setAnswer('');
    setKeywords('');
  };

  // Edit FAQ
  const handleEdit = (faq) => {
    setFormMode('edit');
    setCurrentFaqId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setKeywords(faq.keywords ? faq.keywords.join(', ') : '');
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/chatbot/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('FAQ deleted successfully');
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!question.trim() || !answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    // Parse keywords
    const keywordsArray = keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword !== '');

    try {
      if (formMode === 'add') {
        // Add new FAQ
        await axios.post(
          'http://localhost:5001/api/chatbot/faqs',
          { question, answer, keywords: keywordsArray },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('FAQ added successfully');
      } else {
        // Update existing FAQ
        await axios.put(
          `http://localhost:5001/api/chatbot/faqs/${currentFaqId}`,
          { question, answer, keywords: keywordsArray },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('FAQ updated successfully');
      }

      // Reset form and fetch updated FAQs
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error(`Failed to ${formMode === 'add' ? 'add' : 'update'} FAQ`);
    }
  };

  // Test chatbot
  const handleTestChatbot = async (e) => {
    e.preventDefault();

    if (!testQuery.trim()) {
      toast.error('Please enter a query to test');
      return;
    }

    try {
      setTestLoading(true);
      const response = await axios.post('http://localhost:5001/api/chatbot/query', { query: testQuery });
      setTestResponse(response.data);
      setTestLoading(false);
    } catch (error) {
      console.error('Error testing chatbot:', error);
      toast.error('Failed to test chatbot');
      setTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chatbot Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQ Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {formMode === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
                Question
              </label>
              <input
                type="text"
                id="question"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answer">
                Answer
              </label>
              <textarea
                id="answer"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="keywords">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                id="keywords"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter keywords separated by commas"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: admission, apply, join
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {formMode === 'add' ? 'Add FAQ' : 'Update FAQ'}
              </button>
              
              {formMode === 'edit' && (
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Test Chatbot */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Chatbot</h2>
          
          <form onSubmit={handleTestChatbot}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testQuery">
                Ask a question
              </label>
              <input
                type="text"
                id="testQuery"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Type your question here"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={testLoading}
            >
              {testLoading ? 'Processing...' : 'Ask'}
            </button>
          </form>
          
          {testResponse && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Response:</h3>
              {testResponse.found ? (
                <>
                  <p className="font-medium text-primary-700">{testResponse.question}</p>
                  <p className="mt-2">{testResponse.answer}</p>
                </>
              ) : (
                <p className="text-red-500">{testResponse.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* FAQ List */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Existing FAQs</h2>
        
        {loading ? (
          <p>Loading FAQs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : faqs.length === 0 ? (
          <p>No FAQs found. Add your first FAQ above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Keywords
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq._id}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {faq.question}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {faq.keywords && faq.keywords.join(', ')}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
