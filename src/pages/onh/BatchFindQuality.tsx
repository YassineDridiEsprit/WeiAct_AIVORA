import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowRight
} from 'lucide-react';

interface BatchDetails {
  id: string;
  status: string;
  farmer: string;
  harvesting: {
    farmer: string;
    date: string;
    location: string;
    method: string;
    quantity: any;
    variety: string;
  };
  qualityCheck: {
    lab: string;
    onhId: string;
    acidity: any;
    quality: string;
    area: string;
    peroxideValue: any;
    certifiedOrganic: boolean;
  };
  isFinalized: boolean;
}

export default function BatchFindQuality() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const searchBatch = async () => {
    setError(null);
    if (!contract) await connect();
    if (!account) await connect();
    
    if (!batchId.trim()) {
      setError('Please enter a Batch ID');
      return;
    }

    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id <= 0) {
        setError('Batch ID must be a valid positive integer.');
        return;
      }

      setLoading(true);
      const batch = await contract.getBatch(id);
      
      if (!batch || !batch.harvesting) {
        throw new Error('Batch does not exist');
      }

      setBatchDetails({
        id: batchId,
        status: batch.isFinalized ? 'Completed' : 'In Progress',
        farmer: batch.harvesting.farmer || 'Unknown',
        harvesting: batch.harvesting,
        qualityCheck: batch.qualityCheck,
        isFinalized: batch.isFinalized
      });
    } catch (err: any) {
      console.error('Error searching batch:', err);
      setError(`Error: ${err.reason || err.message || 'Batch does not exist'}`);
      setBatchDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatField = (label: string, value: any, isNumber = false, suffix = '') => {
    if (value !== undefined && value !== null && value.toString().trim() !== '') {
      let displayValue = value;
      if (isNumber && label === 'Quantity') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 1000;
        displayValue = Number(displayValue.toFixed(2));
      } else if (isNumber && label === 'Acidity') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 10;
        displayValue = Number(displayValue.toFixed(1));
        suffix = '%';
      } else if (isNumber && label === 'Peroxide Value') {
        displayValue = (typeof value === 'number' ? value : value.toString());
        suffix = ' meq/kg';
      } else if (isNumber) {
        displayValue = typeof value === 'number' ? value : value.toString();
      }
      return `${displayValue}${suffix}`;
    }
    return 'Not available';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">View a Batch</h1>
            <p className="text-xl opacity-90">Search for a specific olive oil batch to view its details.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">View a Batch</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Search for a Batch</h3>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                    Batch ID
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="batchId"
                      type="number"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter Batch ID"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchBatch}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>Search</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Batch Details */}
            {batchDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src="/assets/img/blog/oilveoil.jpg" 
                      alt="Batch Image" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxNDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTA5OTQwIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxMDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTBBOTgxIi8+PHRleHQgeD0iMTYwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtc2l6ZT0iMTQiPk9saXZlIE9pbDwvdGV4dD4KPC9zdmc+Cg==';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  {/* Meta Info */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-rose-600" />
                      <span className="text-sm font-medium text-gray-700">{batchDetails.farmer}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 mb-1">Batch ID</h5>
                        <span className="text-gray-600">{batchDetails.id}</span>
                      </div>
                      <div className="w-px h-12 bg-gray-200 mx-4" />
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 mb-1">Status</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          batchDetails.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batchDetails.status}
                        </span>
                      </div>
                    </div>

                    {/* Quality Check Info */}
                    {batchDetails.qualityCheck && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg">
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Lab:</span>
                            <span className="font-medium">{formatField('Lab', batchDetails.qualityCheck.lab)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Quality:</span>
                            <span className="font-medium">{formatField('Quality', batchDetails.qualityCheck.quality)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Acidity:</span>
                            <span className="font-medium">{formatField('Acidity', batchDetails.qualityCheck.acidity, true)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <a 
                        href={`/onh/batch/${batchDetails.id}`}
                        className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                      >
                        <span>More Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => {
                          const traceUrl = `${window.location.origin}/onh/batch/${batchDetails.id}`;
                          alert(`QR Code for Batch ${batchDetails.id}\nTrace URL: ${traceUrl}`);
                        }}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all text-sm"
                      >
                        <span>QR Code</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!batchDetails && !loading && account && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for a Batch</h3>
                <p className="text-gray-600">Enter a Batch ID above to view its details.</p>
              </div>
            )}

            {/* Not Connected State */}
            {!account && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-4">Connect your MetaMask wallet to search for batches.</p>
                <button 
                  onClick={connect}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium"
                >
                  Connect MetaMask
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
