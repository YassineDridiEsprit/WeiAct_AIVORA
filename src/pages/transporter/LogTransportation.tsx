import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Truck, AlertCircle, CheckCircle, Loader2, Clock, MapPin, Car } from 'lucide-react';

export default function LogTransportation() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [conditions, setConditions] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!contract) await connect();
    if (!account) await connect();
    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id < 0) {
        setMessage('Batch ID must be a valid non-negative integer');
        return;
      }
      const dur = Math.round(parseFloat(durationHours) * 10);
      if (isNaN(dur) || dur <= 0) {
        setMessage('Duration must be a positive number');
        return;
      }
      if (!conditions.trim()) {
        setMessage('Transport conditions are required');
        return;
      }
      if (!vehicleType.trim()) {
        setMessage('Vehicle type is required');
        return;
      }
      setLoading(true);
      const tx = await contract.logTransportation(
        id,
        dur,
        conditions,
        account?.toLowerCase(), // Use account as string for transporterId
        vehicleType,
        { gasLimit: 500000 }
      );
      await tx.wait();
      setMessage('Transportation logged successfully');
      setBatchId('');
      setDurationHours('');
      setConditions('');
      setVehicleType('');
    } catch (err: any) {
      setMessage(err?.reason || err?.message || 'Error logging transportation');
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
            <h1 className="text-4xl font-bold mb-4">Log Transportation</h1>
            <p className="text-xl opacity-90">Record transportation details for olive oil batches.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Log Transportation</li>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Transportation Details</h3>
              
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Batch ID */}
                  <div>
                    <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                      Batch ID
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="batchId"
                        type="number"
                        required
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Batch ID"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="durationHours"
                        type="number"
                        step="0.1"
                        required
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Duration"
                      />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Conditions
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

                  {/* Vehicle Type */}
                  <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="vehicleType"
                        type="text"
                        required
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter Vehicle Type"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`p-4 rounded-lg flex items-start space-x-3 ${
                    message.includes('successfully') 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {message.includes('successfully') ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      message.includes('successfully') ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Log Transportation'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}