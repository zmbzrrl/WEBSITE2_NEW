import React, { useState } from 'react';
import { testBasicConnection, testTableStructure } from '../utils/testDatabase';

const DatabaseTest: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      console.log('🧪 Running database tests...');
      
      // Test basic connection
      const connectionTest = await testBasicConnection();
      console.log('Connection test:', connectionTest);
      
      // Test table structure
      const tableTest = await testTableStructure();
      console.log('Table test:', tableTest);
      
      setResults({
        connection: connectionTest,
        tables: tableTest
      });
    } catch (error) {
      console.error('Test failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Database Connection Test</h1>
      
      <button 
        onClick={runTests}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Results:</h2>
          
          {results.error ? (
            <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
              ❌ Error: {results.error}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                <h3>Connection Test:</h3>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: results.connection?.success ? '#e6ffe6' : '#ffe6e6',
                  borderRadius: '5px',
                  color: results.connection?.success ? 'green' : 'red'
                }}>
                  {results.connection?.success ? '✅' : '❌'} {results.connection?.message || 'Failed'}
                </div>
              </div>

              <div>
                <h3>Table Structure Test:</h3>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: results.tables?.success ? '#e6ffe6' : '#ffe6e6',
                  borderRadius: '5px',
                  color: results.tables?.success ? 'green' : 'red'
                }}>
                  {results.tables?.success ? '✅' : '❌'} {results.tables?.message || 'Failed'}
                </div>
                
                {results.tables?.results && (
                  <div style={{ marginTop: '10px' }}>
                    <h4>Tables:</h4>
                    {Object.entries(results.tables.results).map(([table, result]: [string, any]) => (
                      <div key={table} style={{ 
                        margin: '5px 0',
                        padding: '5px',
                        backgroundColor: result.exists ? '#e6ffe6' : '#ffe6e6',
                        borderRadius: '3px'
                      }}>
                        {result.exists ? '✅' : '❌'} {table}
                        {result.error && <span style={{ color: 'red', marginLeft: '10px' }}>({result.error})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>What This Tests:</h3>
        <ul>
          <li>✅ Connection to your Supabase database</li>
          <li>✅ Access to all required tables</li>
          <li>✅ Proper API key configuration</li>
        </ul>
        
        <p><strong>Expected Result:</strong> All tests should pass with ✅ marks if your database is properly connected.</p>
      </div>
    </div>
  );
};

export default DatabaseTest;
