import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { 
  Trees, 
  Truck, 
  Box, 
  Cog, 
  Archive, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Batch {
  harvesting: {
    farmer: string;
    date: string;
    location: string;
    method: string;
    quantity: string;
    variety: string;
  };
  transportation: {
    duration: string;
    conditions: string;
    transporterId: string;
    vehicleType: string;
  };
  storageBeforePressing: {
    duration: string;
    pressingId: string;
    conditions: string;
    temperature: string;
    humidity: string;
    goodOlives: string;
    badOlives: string;
  };
  pressingProcess: {
    date: string;
    pressingId: string;
    facility: string;
    method: string;
    conditions: string;
    temperature: string;
    pressure: string;
    operatorName: string;
  };
  storageAfterPressing: {
    tankId: string;
    pressingId: string;
    duration: string;
    conditions: string;
    temperature: string;
    humidity: string;
    inertAtmosphere: boolean;
  };
  qualityCheck: {
    lab: string;
    onhId: string;
    acidity: string;
    quality: string;
    area: string;
    peroxideValue: string;
    certifiedOrganic: boolean;
  };
  isFinalized: boolean;
}

export default function BatchDetails() {
  const { batchId } = useParams();
  const { connect, contract } = useWallet();
  const [data, setData] = useState<Batch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!batchId) {
      setError('No batch ID provided.');
      return;
    }
    const id = parseInt(batchId);
    if (isNaN(id) || id < 0) {
      setError('Batch ID must be a valid non-negative integer.');
      return;
    }
    if (!contract) {
      try {
        await connect();
        if (!contract) {
          // setError('Please connect your wallet to view batch details.');
          return;
        }
      } catch (e: any) {
        setError('Failed to connect wallet: ' + (e?.message || 'Unknown error'));
        return;
      }
    }
    try {
      setLoading(true);
      const res = await contract.getBatch(id);
      if (!res.harvesting || !res.harvesting.farmer) {
        setError('Batch does not exist.');
        setData(null);
        return;
      }
      setData(res);
    } catch (e: any) {
      setError(e?.reason || e?.message || 'Failed to load batch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [batchId, contract, connect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Batch Details</h1>
            <p className="text-xl opacity-90">Complete supply chain journey for olive oil batch.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Batch Details</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Batch Info */}
            {data && (
              <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full font-semibold">
                      Batch ID: {batchId}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.isFinalized 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Status: {data.isFinalized ? 'Complete' : 'In Progress'}
                    </div>
                  </div>
                  <a 
                    href="/transporter/batches"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Batches</span>
                  </a>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Journey</h2>
                <p className="text-gray-600">
                  Discover the complete story behind your olive oil. Each batch is meticulously documented—from harvest
                  to bottle—ensuring full traceability, premium quality, and authenticity at every step of the journey.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={load}
                  className="ml-4 px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading batch details...</p>
              </div>
            )}

            {/* Supply Chain Journey */}
            {!loading && data && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Supply Chain Journey</h2>
                  <p className="text-gray-600">Trace every step of your olive oil's production process with our transparent supply chain tracking.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Harvesting */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <Trees className="h-6 w-6 text-rose-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Harvesting</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Farmer:</span>
                          <span className="ml-2 text-gray-900">{data.harvesting?.farmer || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Date:</span>
                          <span className="ml-2 text-gray-900">{data.harvesting?.date || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-900">{data.harvesting?.location || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Method:</span>
                          <span className="ml-2 text-gray-900">{data.harvesting?.method || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <span className="ml-2 text-gray-900">
                            {data.harvesting?.quantity ? (Number(data.harvesting.quantity.toString())/1000).toFixed(2) : 'N/A'} kg
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Variety:</span>
                          <span className="ml-2 text-gray-900">{data.harvesting?.variety || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <Truck className="h-6 w-6 text-rose-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Transportation</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Transporter ID:</span>
                          <span className="ml-2 text-gray-900">{data.transportation?.transporterId || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Duration:</span>
                          <span className="ml-2 text-gray-900">
                            {data.transportation?.duration ? (Number(data.transportation.duration.toString())/10).toFixed(1) : 'N/A'} hours
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Conditions:</span>
                          <span className="ml-2 text-gray-900">{data.transportation?.conditions || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Vehicle Type:</span>
                          <span className="ml-2 text-gray-900">{data.transportation?.vehicleType || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Storage Before Pressing */}
                  {data.storageBeforePressing && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <Box className="h-6 w-6 text-rose-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Storage Before Pressing</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Pressing ID:</span>
                            <span className="ml-2 text-gray-900">{data.storageBeforePressing?.pressingId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-900">
                              {data.storageBeforePressing?.duration ? (Number(data.storageBeforePressing.duration.toString())/10).toFixed(1) : 'N/A'} hours
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Conditions:</span>
                            <span className="ml-2 text-gray-900">{data.storageBeforePressing?.conditions || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Temperature:</span>
                            <span className="ml-2 text-gray-900">
                              {data.storageBeforePressing?.temperature ? (Number(data.storageBeforePressing.temperature.toString())/10).toFixed(1) : 'N/A'} °C
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Humidity:</span>
                            <span className="ml-2 text-gray-900">
                              {data.storageBeforePressing?.humidity ? (Number(data.storageBeforePressing.humidity.toString())/10).toFixed(1) : 'N/A'} %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pressing Process */}
                  {data.pressingProcess && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <Cog className="h-6 w-6 text-rose-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Pressing Process</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Date:</span>
                            <span className="ml-2 text-gray-900">{data.pressingProcess?.date || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Pressing ID:</span>
                            <span className="ml-2 text-gray-900">{data.pressingProcess?.pressingId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Facility:</span>
                            <span className="ml-2 text-gray-900">{data.pressingProcess?.facility || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Method:</span>
                            <span className="ml-2 text-gray-900">{data.pressingProcess?.method || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Operator:</span>
                            <span className="ml-2 text-gray-900">{data.pressingProcess?.operatorName || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Storage After Pressing */}
                  {data.storageAfterPressing && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            5
                          </div>
                          <Archive className="h-6 w-6 text-rose-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Storage After Pressing</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Tank ID:</span>
                            <span className="ml-2 text-gray-900">{data.storageAfterPressing?.tankId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Pressing ID:</span>
                            <span className="ml-2 text-gray-900">{data.storageAfterPressing?.pressingId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-900">
                              {data.storageAfterPressing?.duration ? (Number(data.storageAfterPressing.duration.toString())/10).toFixed(1) : 'N/A'} hours
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Conditions:</span>
                            <span className="ml-2 text-gray-900">{data.storageAfterPressing?.conditions || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Inert Atmosphere:</span>
                            <span className="ml-2 text-gray-900">{data.storageAfterPressing?.inertAtmosphere ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quality Check */}
                  {data.qualityCheck && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            6
                          </div>
                          <CheckCircle className="h-6 w-6 text-rose-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Quality Check</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Lab:</span>
                            <span className="ml-2 text-gray-900">{data.qualityCheck?.lab || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">ONH ID:</span>
                            <span className="ml-2 text-gray-900">{data.qualityCheck?.onhId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Acidity:</span>
                            <span className="ml-2 text-gray-900">
                              {data.qualityCheck?.acidity ? (Number(data.qualityCheck.acidity.toString())/10).toFixed(1) : 'N/A'} %
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Quality:</span>
                            <span className="ml-2 text-gray-900">{data.qualityCheck?.quality || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Area:</span>
                            <span className="ml-2 text-gray-900">{data.qualityCheck?.area || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Certified Organic:</span>
                            <span className="ml-2 text-gray-900">{data.qualityCheck?.certifiedOrganic ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !data && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batch Data</h3>
                <p className="text-gray-600">No batch details available.</p>
                <button
                  onClick={load}
                  className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}