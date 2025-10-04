import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Search, AlertCircle, Package, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

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

export default function FindTransporterBatch() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const viewBatchById = async () => {
    if (!batchId) {
      showError('Please enter a batch ID');
      return;
    }

    const id = parseInt(batchId);
    if (isNaN(id) || id < 0) {
      showError('Batch ID must be a valid non-negative integer');
      return;
    }

    if (!contract || !account) {
      try {
        await connect();
        if (!contract || !account) {
          showError('Please connect your wallet to search for batches');
          return;
        }
      } catch (e: any) {
        showError('Failed to connect wallet: ' + (e?.message || 'Unknown error'));
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setBatch(null);

    //   // Check TRANSPORTER_ROLE
    //   const hasTransporterRole = await contract.hasRole(
    //     ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TRANSPORTER_ROLE")),
    //     account
    //   );
    //   if (!hasTransporterRole) {
    //     showError('Your account does not have the transporter role');
    //     return;
    //   }

      const batchData = await contract.getBatch(id);
      if (!batchData || !batchData.harvesting || !batchData.harvesting.farmer) {
        throw new Error('Batch does not exist');
      }

      // Verify transporterId matches account
      if (batchData.transportation?.transporterId.toLowerCase() !== account.toLowerCase()) {
        showError('You are not the transporter for this batch');
        return;
      }

      setBatch(batchData);
    } catch (err: any) {
      console.error(err);
      showError(`Error: ${err?.reason || err?.message || 'Batch does not exist'}`);
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    viewBatchById();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find Transported Batch</h1>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Find Transported Batch</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Transported Batch</h3>
              <p className="text-gray-600 mb-6">Quickly search and access your transported batch records by entering a valid batch ID below!</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Enter Batch ID"
                    className="w-full px-4 py-3 border-2 border-rose-500 rounded-lg focus:border-rose-600 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Find Batch</span>
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={viewBatchById}
                    className="ml-4 px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>

            {/* Batch Details */}
            {batch && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src="/assets/img/blog/oilveoil.jpg" 
                      alt="Batch Image" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxNDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTA5OTQwIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxMDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTBBOTgxIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE0Ij5PbGl2ZSBPaWw8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Meta Info */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-rose-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {batch.transportation?.transporterId ? `${batch.transportation.transporterId.slice(0, 6)}...${batch.transportation.transporterId.slice(-4)}` : 'Unknown Transporter'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 mb-1">Batch ID</h5>
                        <span className="text-gray-600">{batchId}</span>
                      </div>
                      <div className="w-px h-12 bg-gray-200 mx-4" />
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 mb-1">Status</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          batch.isFinalized 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batch.isFinalized ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 text-sm text-gray-600">
                      <p><strong>Transporter ID:</strong> {batch.transportation?.transporterId ? `${batch.transportation.transporterId.slice(0, 6)}...${batch.transportation.transporterId.slice(-4)}` : 'Unknown'}</p>
                      <p><strong>Duration:</strong> {batch.transportation?.duration ? `${(Number(batch.transportation.duration.toString()) / 10).toFixed(1)} hours` : 'Unknown'}</p>
                      <p><strong>Conditions:</strong> {batch.transportation?.conditions || 'Unknown'}</p>
                      <p><strong>Vehicle Type:</strong> {batch.transportation?.vehicleType || 'Unknown'}</p>
                      <p><strong>Farmer:</strong> {batch.harvesting?.farmer || 'Unknown'}</p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <a 
                        href={`/transporter/batch/${batchId}`}
                        className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                      >
                        <span>More Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !batch && !error && batchId && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batch Found</h3>
                <p className="text-gray-600">Enter a valid batch ID to search for batch details.</p>
                <button
                  onClick={viewBatchById}
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