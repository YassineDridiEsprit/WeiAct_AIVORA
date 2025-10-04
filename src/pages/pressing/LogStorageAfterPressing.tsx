import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { 
  MapPin, 
  Clock, 
  Thermometer, 
  Droplets, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Loader2
} from 'lucide-react';

export default function LogStorageAfterPressing() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [tankId, setTankId] = useState('');
  const [duration, setDuration] = useState('');
  const [conditions, setConditions] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [inertAtmosphere, setInertAtmosphere] = useState(false);
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
    
    if (!batchId || !tankId || !duration || !conditions || !temperature || !humidity) {
      showMessage('Please fill in all fields');
      return;
    }

    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id <= 0) {
        showMessage('Batch ID must be a valid positive integer.');
        return;
      }

      const durationScaled = Math.round(parseFloat(duration) * 10);
      const tempScaled = Math.round(parseFloat(temperature) * 10);
      const humidityScaled = Math.round(parseFloat(humidity) * 10);
      
      if (isNaN(durationScaled) || isNaN(tempScaled) || isNaN(humidityScaled)) {
        showMessage('Duration, Temperature, and Humidity must be valid numbers.');
        return;
      }

      setLoading(true);
      showMessage('Checking batch status...');

      const batch = await contract.getBatch(id);
      if (!batch || !batch.harvesting || batch.harvesting.quantity <= 0) {
        throw new Error('Batch does not exist');
      }

      showMessage('Processing transaction...');

      const tx = await contract.logStorageAfterPressing(
        id,
        toChecksumAddress(account || ''),
        tankId,
        durationScaled,
        conditions,
        tempScaled,
        humidityScaled,
        inertAtmosphere,
        { gasLimit: 500000 }
      );
      
      showMessage('Transaction sent, waiting for confirmation...');
      await tx.wait();
      
      showMessage('Storage after pressing logged successfully!', 'success');
      
      // Reset form
      setBatchId('');
      setTankId('');
      setDuration('');
      setConditions('');
      setTemperature('');
      setHumidity('');
      setInertAtmosphere(false);
      
    } catch (err: any) {
      console.error('Full error:', err);
      let errorMessage = err?.reason || err?.data?.message || err?.message || 'Unknown error';
      showMessage(errorMessage);
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
            <h1 className="text-4xl font-bold mb-4">Log Storage After Pressing</h1>
            <p className="text-xl opacity-90">Record storage details after pressing for an olive oil batch.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Log Storage After Pressing</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Log Storage After Pressing</h3>
              
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

                  {/* Tank ID */}
                  <div>
                    <label htmlFor="tankId" className="block text-sm font-medium text-gray-700 mb-2">
                      Tank ID
                    </label>
                    <div className="relative">
                      <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="tankId"
                        type="text"
                        required
                        value={tankId}
                        onChange={(e) => setTankId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Tank ID"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="duration"
                        type="number"
                        step="0.1"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Duration"
                      />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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

                  {/* Humidity */}
                  <div>
                    <label htmlFor="humidity" className="block text-sm font-medium text-gray-700 mb-2">
                      Humidity (%)
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="humidity"
                        type="number"
                        step="0.1"
                        required
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Humidity"
                      />
                    </div>
                  </div>
                </div>

                {/* Inert Atmosphere Checkbox */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <input
                      id="inertAtmosphere"
                      type="checkbox"
                      checked={inertAtmosphere}
                      onChange={(e) => setInertAtmosphere(e.target.checked)}
                      className="w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="inertAtmosphere" className="text-lg font-medium text-gray-700">
                      Enable Inert Atmosphere
                    </label>
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
    </div>
  );
}
