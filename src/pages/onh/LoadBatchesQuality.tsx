import React, { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { ethers } from 'ethers';
import { AlertCircle, Loader2, Package, ArrowRight, QrCode, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import CryptoJS from 'crypto-js';

interface Batch {
  id: string;
  status: string;
  farmer: string;
}

export default function LoadBatchesQuality() {
  const { account, connect, contract } = useWallet();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrBatchId, setQrBatchId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setBatches([]);

    if (!window.ethereum) {
      setError('Please install MetaMask to use this application!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== '1337') {
        setError('Please switch to the correct network (Chain ID: 1337)');
        return;
      }

      if (!account || !contract) {
        await connect();
        if (!account || !contract) {
          setError('Please connect your wallet to view batches.');
          return;
        }
      }

      if (!contract.getBatchesByOnhId) {
        console.error('getBatchesByOnhId is not a function on contract:', contract);
        console.log('Available contract functions:', Object.keys(contract.functions || {}));
        setError('Contract error: getBatchesByOnhId function is missing. Please verify the contract ABI.');
        return;
      }

      setLoading(true);
      const checksumAddress = toChecksumAddress(account);
      const batchIds = await contract.getBatchesByOnhId(checksumAddress);

      if (batchIds.length === 0) {
        setError('No batches found for your ONH ID (wallet address).');
        setBatches([]);
        return;
      }

      const batchData: Batch[] = [];
      for (const batchId of batchIds) {
        try {
          const batch = await contract.getBatch(batchId);
          if (!batch || !batch.harvesting || batch.harvesting.quantity.lte(0)) {
            console.warn(`Batch ${batchId} has no valid harvesting data`);
            continue;
          }
          batchData.push({
            id: batchId.toString(),
            status: batch.isFinalized ? 'Completed' : 'In Progress',
            farmer: batch.harvesting.farmer || 'Unknown',
          });
        } catch (err: any) {
          console.warn(`Error fetching batch ${batchId}:`, err);
        }
      }

      if (batchData.length === 0) {
        setError('No valid batches found for your ONH ID.');
      } else {
        setBatches(batchData);
      }
    } catch (e: any) {
      console.error('Error loading batches:', e);
      setError(e?.reason || e?.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (batchId: string) => {
    setQrBatchId(batchId);
    setQrModalOpen(true);
  };

  const downloadQRCode = () => {
    if (!qrBatchId) return;
    const canvas = document.getElementById(`qr-code-${qrBatchId}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `batch-${qrBatchId}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const getQRCodeData = (batchId: string) => {
    const key = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef');
    const iv = CryptoJS.enc.Hex.parse('abcdef9876543210abcdef9876543210');
    const traceUrl = `${window.location.origin}/onh/batch/${batchId}`;
    const dataToEncrypt = `batchId=${batchId}&url=${traceUrl}`;
    return CryptoJS.AES.encrypt(dataToEncrypt, key, { iv: iv }).toString();
  };

  useEffect(() => {
    if (account && contract) {
      load();
    }
  }, [account, contract]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          await connect();
        } else {
          setError('No account connected. Please reconnect MetaMask.');
          setBatches([]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [connect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Quality Check Batches</h1>
            <p className="text-xl opacity-90">View and manage your olive oil quality check batches.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Quality Check Batches</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-100 border border-rose-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto mb-4" />
              <p className="text-rose-900">Loading your batches...</p>
            </div>
          )}

          {/* Batches Grid */}
          {!loading && batches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/assets/img/blog/oilveoil.jpg"
                      alt="Batch Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCA1NDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTA5OTQwIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxMDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTBBOTgxIi8+PHRleHQgeD0iMTYwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtc2l6ZT0iMTQiPk9saXZlIE9pbDwvdGV4dD4KPC9zdmc+Cg==';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="p-4 bg-rose-50">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-rose-600" />
                      <span className="text-sm font-medium text-rose-900">{batch.farmer}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-rose-900 mb-1">Batch ID</h5>
                        <span className="text-rose-700">{batch.id}</span>
                      </div>
                      <div className="w-px h-12 bg-rose-200 mx-4" />
                      <div className="text-center flex-1">
                        <h5 className="text-lg font-semibold text-rose-900 mb-1">Status</h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            batch.status === 'Completed'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <a
                        href={`/onh/batch/${batch.id}`}
                        className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                      >
                        <span>More Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => generateQRCode(batch.id)}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>QR Code</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && batches.length === 0 && account && !error && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 mb-2">No Batches Found</h3>
              <p className="text-rose-700">No quality check batches found for your ONH ID.</p>
            </div>
          )}

          {/* Not Connected State */}
          {!account && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 mb-2">Connect Your Wallet</h3>
              <p className="text-rose-700 mb-4">Connect your MetaMask wallet to view your quality check batches.</p>
              <button
                onClick={connect}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
              >
                Connect MetaMask
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && qrBatchId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-rose-900">Batch QR Code</h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <div className="text-center">
              <QRCodeCanvas
                id={`qr-code-${qrBatchId}`}
                value={getQRCodeData(qrBatchId)}
                size={200}
                level="L"
                includeMargin={true}
              />
              <p className="mt-4 text-rose-700">Scan this QR code to view batch details</p>
              <button
                onClick={downloadQRCode}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}