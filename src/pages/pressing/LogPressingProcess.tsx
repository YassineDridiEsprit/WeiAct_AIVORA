import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { Calendar, Building, Settings, Thermometer, Gauge, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function LogPressingProcess() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState('');
  const [facility, setFacility] = useState('');
  const [method, setMethod] = useState('');
  const [conditions, setConditions] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pressure, setPressure] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const showMessage = (msg: string, type: 'success' | 'error' = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!contract) await connect();
    if (!account) await connect();
    
    if (!batchId || !date || !facility || !method || !conditions || !temperature || !pressure || !operatorName) {
      showMessage('All fields are required. Please fill in every field.');
      return;
    }

    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id <= 0) {
        showMessage('Batch ID must be a valid positive integer.');
        return;
      }

      const tempScaled = Math.round(parseFloat(temperature) * 10);
      const pressScaled = Math.round(parseFloat(pressure) * 10);
      
      if (isNaN(tempScaled) || isNaN(pressScaled)) {
        showMessage('Temperature and Pressure must be valid numbers.');
        return;
      }

      setLoading(true);
      showMessage('Checking batch status...');

      // Check if batch exists
      const batch = await contract.getBatch(id);
      if (!batch || !batch.harvesting || batch.harvesting.quantity <= 0) {
        throw new Error('Batch does not exist');
      }

      showMessage('Processing transaction...');

      const tx = await contract.logPressingProcess(
        id,
        toChecksumAddress(account || ''),
        date,
        facility,
        method,
        conditions,
        tempScaled,
        pressScaled,
        operatorName
      );
      
      showMessage('Transaction sent, waiting for confirmation...');
      await tx.wait();
      
      showMessage('Pressing process logged successfully!', 'success');
      
      // Reset form
      setBatchId('');
      setDate('');
      setFacility('');
      setMethod('');
      setConditions('');
      setTemperature('');
      setPressure('');
      setOperatorName('');
    } catch (err: any) {
      let errorMessage = err?.reason || err?.data?.message || err?.message || 'Unknown error';
      if (errorMessage.includes('Internal JSON-RPC error')) {
        errorMessage = 'Transaction failed: Invalid batch ID or contract error. Please verify the Batch ID or network settings.';
      }
      showMessage(`Error logging pressing process: ${errorMessage}. Please verify the Batch ID or create a new batch.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Log Pressing Process</h1>
            <p className="text-xl opacity-90">Record pressing process details for an olive oil batch.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Log Pressing Process</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Log Pressing Process</h2>
            <p className="text-gray-600 text-lg">Record Details for Olive Oil Pressing</p>
          </div>

          {/* <div className="max-w-4xl mx-auto">
            {/* Connected Account }
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">
                Connected Account: <span className="font-mono text-gray-900">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not connected'}</span>
              </p>
              <button 
                onClick={connect} 
                className="mt-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all"
              >
                {account ? 'Connected' : 'Connect MetaMask'}
              </button>
            </div> }*/}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Log Pressing Process</h3>
              
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Batch ID */}
                  <div>
                    <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                      Batch ID
                    </label>
                    <div className="relative">
                      <input
                        id="batchId"
                        type="number"
                        required
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Batch ID"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Facility */}
                  <div>
                    <label htmlFor="facility" className="block text-sm font-medium text-gray-700 mb-2">
                      Facility
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="facility"
                        type="text"
                        required
                        value={facility}
                        onChange={(e) => setFacility(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Facility"
                      />
                    </div>
                  </div>

                  {/* Method */}
                  <div>
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                      Method
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="method"
                        type="text"
                        required
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Method"
                      />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions
                    </label>
                    <div className="relative">
                      <input
                        id="conditions"
                        type="text"
                        required
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Conditions"
                      />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°C)
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="temperature"
                        type="number"
                        step="0.1"
                        required
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Temperature"
                      />
                    </div>
                  </div>

                  {/* Pressure */}
                  <div>
                    <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-2">
                      Pressure (bar)
                    </label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="pressure"
                        type="number"
                        step="0.1"
                        required
                        value={pressure}
                        onChange={(e) => setPressure(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Pressure"
                      />
                    </div>
                  </div>

                  {/* Operator Name */}
                  <div>
                    <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-2">
                      Operator Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="operator"
                        type="text"
                        required
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Operator Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`p-4 rounded-lg flex items-start space-x-3 ${
                    messageType === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {messageType === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      messageType === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-600 mr-2" />
                    <span className="text-gray-600">Processing...</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}