import React, { useState } from 'react';
import { farmAPI } from '../lib/api';

export default function ApiDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPersonnel = async () => {
    setLoading(true);
    addLog('Testing Personnel API...');
    
    try {
      // Test GET first
      addLog('Testing GET /api/farm/personnel');
      const getResponse = await farmAPI.getPersonnel();
      addLog(`GET SUCCESS: Received ${getResponse.data.length} personnel records`);
      
      // Test POST with minimal data
      addLog('Testing POST /api/farm/personnel');
      const postData = {
        name: 'Test Person',
        role: 'WORKER',
        hourly_rate: 15.50
      };
      addLog(`POST data: ${JSON.stringify(postData, null, 2)}`);
      
      const postResponse = await farmAPI.createPersonnel(postData);
      addLog(`POST SUCCESS: Created personnel with ID ${postResponse.data.id}`);
      
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Status Text: ${error.response.statusText}`);
        addLog(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      if (error.request) {
        addLog(`Request: ${JSON.stringify(error.request, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testEquipment = async () => {
    setLoading(true);
    addLog('Testing Equipment API...');
    
    try {
      const postData = {
        name: 'Test Tractor',
        equipment_type: 'TRACTOR',
        hourly_cost: 25.00
      };
      addLog(`POST data: ${JSON.stringify(postData, null, 2)}`);
      
      const response = await farmAPI.createEquipment(postData);
      addLog(`SUCCESS: Created equipment with ID ${response.data.id}`);
      
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      if (error.response) {
        addLog(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testInputs = async () => {
    setLoading(true);
    addLog('Testing Inputs API...');
    
    try {
      const postData = {
        name: 'Test Seed',
        input_type: 'SEED',
        unit: 'Kg',
        unit_price: 5.50,
        current_stock: 100,
        minimum_stock_alert: 10
      };
      addLog(`POST data: ${JSON.stringify(postData, null, 2)}`);
      
      const response = await farmAPI.createInput(postData);
      addLog(`SUCCESS: Created input with ID ${response.data.id}`);
      
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      if (error.response) {
        addLog(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    addLog('Testing Authentication...');
    
    try {
      // Check if we have tokens
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      addLog(`Access Token: ${accessToken ? 'EXISTS' : 'MISSING'}`);
      addLog(`Refresh Token: ${refreshToken ? 'EXISTS' : 'MISSING'}`);
      
      if (accessToken) {
        // Try to decode the token payload (just for debugging)
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        addLog(`Token payload: ${JSON.stringify(tokenPayload, null, 2)}`);
      }
      
    } catch (error: any) {
      addLog(`AUTH ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">API Debugger</h3>
        <button 
          onClick={clearLogs}
          className="text-sm bg-gray-100 px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testAuth}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Auth
        </button>
        <button 
          onClick={testPersonnel}
          disabled={loading}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Personnel
        </button>
        <button 
          onClick={testEquipment}
          disabled={loading}
          className="w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Equipment
        </button>
        <button 
          onClick={testInputs}
          disabled={loading}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Inputs
        </button>
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-xs max-h-48 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Click a test button.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 break-words">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}