import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { API_URL } from '../config/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/test');
        setTestResult(response.data);
        setError(null);
      } catch (err) {
        console.error('API Test Error:', err);
        setError(err.message || 'Unknown error occurred');
        setTestResult(null);
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="api-test" style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
      <h3>API Connection Test</h3>
      <p>API URL: {API_URL}</p>
      
      {loading && <p>Testing API connection...</p>}
      
      {!loading && testResult && (
        <div style={{ color: 'green', fontWeight: 'bold' }}>
          <p>✅ API Connection Successful</p>
          <p>Response: {JSON.stringify(testResult)}</p>
        </div>
      )}
      
      {!loading && error && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          <p>❌ API Connection Failed</p>
          <p>Error: {error}</p>
          <p>
            Possible solutions:
            <ul>
              <li>Check if the backend server is running</li>
              <li>Verify the API URL in src/config/api.js</li>
              <li>Check CORS configuration on the backend</li>
              <li>Check browser console for more details</li>
            </ul>
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
