import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { RefreshCw, AlertCircle, Loader2, Package, ArrowRight } from 'lucide-react';

export default function LoadProcessedBatches() {
  const { account, connect, contract } = useWallet();
  const [batches, setBatches] = useState<Array<{ id: string; status: string; pressingId: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);

    // Ensure wallet is connected
    if (!contract || !account) {
      try {
        await connect();
        if (!contract || !account) {
          setError('Please connect your wallet to view processed batches');
          setLoading(false);
          return;
        }
      } catch (e: any) {
        setError('Failed to connect to MetaMask: ' + (e?.message || 'Unknown error'));
        setLoading(false);
        return;
      }
    }

    try {
      const checksum = toChecksumAddress(account || '');
      if (!checksum) {
        throw new Error('Invalid wallet address');
      }

      const ids: any[] = await contract.getBatchesByPressingId(checksum);
      if (!Array.isArray(ids)) {
        throw new Error('Invalid batch IDs response');
      }

      const items: Array<{ id: string; status: string; pressingId: string }> = [];
      for (const id of ids) {
        const batch = await contract.getBatch(id);
        const pressingId =
          (batch.storageBeforePressing && batch.storageBeforePressing.pressingId) ||
          (batch.pressingProcess && batch.pressingProcess.pressingId) ||
          (batch.storageAfterPressing && batch.storageAfterPressing.pressingId) ||
          'Unknown';
        items.push({
          id: id.toString(),
          status: batch.isFinalized ? 'Completed' : 'In Progress',
          pressingId,
        });
      }

      setBatches(items);
      if (items.length === 0) {
        setError('You haven\'t processed any batches yet');
      }
    } catch (e: any) {
      setError(e?.reason || e?.message || 'Failed to load processed batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contract]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Processed Batches</h1>
            <p className="text-xl opacity-90">View all olive oil batches you have processed.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">My Processed Batches</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-rose-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading your processed batches...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && batches.length === 0 && !error && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Processed Batches</h3>
                <p className="text-gray-600">You haven't processed any batches yet.</p>
              </div>
            )}

            {/* Batches Grid */}
            {!loading && batches.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                  <div key={batch.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
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
                          {batch.pressingId ? `${batch.pressingId.slice(0, 6)}...${batch.pressingId.slice(-4)}` : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">Batch ID</h5>
                          <span className="text-gray-600">{batch.id}</span>
                        </div>
                        <div className="w-px h-12 bg-gray-200 mx-4" />
                        <div className="text-center flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">Status</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            batch.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {batch.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4">
                        <a 
                          href={`/farmer/batch/${batch.id}`}
                          className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                        >
                          <span>More Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}