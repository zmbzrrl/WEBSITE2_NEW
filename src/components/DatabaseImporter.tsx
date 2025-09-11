// 📥 DATABASE IMPORTER COMPONENT
// A React component for importing JSON data into the database

import React, { useState } from 'react';
import { importDatabaseData, loadJsonFromFile, validateImportData } from '../utils/databaseImporter';

interface ImportResults {
  success: boolean;
  message: string;
  results?: {
    projects_created: number;
    designs_created: number;
    configurations_created: number;
    errors: string[];
  };
}

const DatabaseImporter: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileImport = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportResults({
        success: false,
        message: 'Please select a JSON file'
      });
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      // Load and validate the JSON file
      const jsonData = await loadJsonFromFile(file);
      const validation = validateImportData(jsonData);
      
      if (!validation.valid) {
        setImportResults({
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        });
        return;
      }

      // Import the data
      const results = await importDatabaseData(jsonData);
      setImportResults(results);

    } catch (error) {
      setImportResults({
        success: false,
        message: `Import failed: ${error}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileImport(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>📥 Database Importer</h2>
      <p>Import JSON data into your Supabase database</p>

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f8f9fa' : '#fff',
          marginBottom: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
          {dragActive ? 'Drop your JSON file here' : 'Drag & drop a JSON file here'}
        </p>
        <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
          or
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          Choose File
        </label>
      </div>

      {/* Loading State */}
      {isImporting && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Importing data...</p>
        </div>
      )}

      {/* Results */}
      {importResults && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: importResults.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${importResults.success ? '#c3e6cb' : '#f5c6cb'}`,
            color: importResults.success ? '#155724' : '#721c24'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>
            {importResults.success ? '✅ Import Successful!' : '❌ Import Failed'}
          </h3>
          <p style={{ margin: '0 0 10px 0' }}>{importResults.message}</p>
          
          {importResults.results && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Results:</strong></p>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Projects created: {importResults.results.projects_created}</li>
                <li>Designs created: {importResults.results.designs_created}</li>
                <li>Configurations created: {importResults.results.configurations_created}</li>
              </ul>
              
              {importResults.results.errors.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Errors:</strong></p>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {importResults.results.errors.map((error, index) => (
                      <li key={index} style={{ fontSize: '12px' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📋 Instructions</h3>
        <ol style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Use the provided <code>database-import-template.json</code> as a starting point</li>
          <li>Modify the JSON structure to match your data</li>
          <li>Ensure all required fields are present (user_email, project_name, design_name, etc.)</li>
          <li>Upload the JSON file using the interface above</li>
          <li>Check the results and any error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseImporter;
