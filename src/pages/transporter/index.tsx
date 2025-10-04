import { useState, useEffect, useRef } from 'react';
import { Truck, Plus, Package, Eye, User } from 'lucide-react';
import { ethers } from 'ethers';

// Declare jQuery globally for TypeScript
declare global {
  interface Window {
    ethereum: any;
    $: any;
    jQuery: any;
  }
}

const contractAddress = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
const contractABI = [
  {
    inputs: [
      { internalType: 'string', name: 'farmer', type: 'string' },
      { internalType: 'string', name: 'harvestDate', type: 'string' },
      { internalType: 'string', name: 'location', type: 'string' },
      { internalType: 'string', name: 'method', type: 'string' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      { internalType: 'string', name: 'variety', type: 'string' },
    ],
    name: 'createBatch',
    outputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'string', name: 'conditions', type: 'string' },
      { internalType: 'string', name: 'transporterId', type: 'string' },
      { internalType: 'string', name: 'vehicleType', type: 'string' }
    ],
    name: 'logTransportation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'batchId', type: 'uint256' }
    ],
    name: 'getBatch',
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: 'string', name: 'farmer', type: 'string' },
              { internalType: 'string', name: 'date', type: 'string' },
              { internalType: 'string', name: 'location', type: 'string' },
              { internalType: 'string', name: 'method', type: 'string' },
              { internalType: 'uint256', name: 'quantity', type: 'uint256' },
              { internalType: 'string', name: 'variety', type: 'string' }
            ],
            internalType: 'struct Harvesting',
            name: 'harvesting',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'uint256', name: 'duration', type: 'uint256' },
              { internalType: 'string', name: 'conditions', type: 'string' },
              { internalType: 'string', name: 'transporterId', type: 'string' },
              { internalType: 'string', name: 'vehicleType', type: 'string' }
            ],
            internalType: 'struct Transportation',
            name: 'transportation',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'uint256', name: 'duration', type: 'uint256' },
              { internalType: 'string', name: 'pressingId', type: 'string' },
              { internalType: 'string', name: 'conditions', type: 'string' },
              { internalType: 'uint256', name: 'temperature', type: 'uint256' },
              { internalType: 'uint256', name: 'humidity', type: 'uint256' },
              { internalType: 'uint256', name: 'goodOlives', type: 'uint256' },
              { internalType: 'uint256', name: 'badOlives', type: 'uint256' }
            ],
            internalType: 'struct StorageBeforePressing',
            name: 'storageBeforePressing',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'string', name: 'date', type: 'string' },
              { internalType: 'string', name: 'pressingId', type: 'string' },
              { internalType: 'string', name: 'facility', type: 'string' },
              { internalType: 'string', name: 'method', type: 'string' },
              { internalType: 'string', name: 'conditions', type: 'string' },
              { internalType: 'uint256', name: 'temperature', type: 'uint256' },
              { internalType: 'uint256', name: 'pressure', type: 'uint256' },
              { internalType: 'string', name: 'operatorName', type: 'string' }
            ],
            internalType: 'struct PressingProcess',
            name: 'pressingProcess',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'string', name: 'tankId', type: 'string' },
              { internalType: 'string', name: 'pressingId', type: 'string' },
              { internalType: 'uint256', name: 'duration', type: 'uint256' },
              { internalType: 'string', name: 'conditions', type: 'string' },
              { internalType: 'uint256', name: 'temperature', type: 'uint256' },
              { internalType: 'uint256', name: 'humidity', type: 'uint256' },
              { internalType: 'bool', name: 'inertAtmosphere', type: 'bool' }
            ],
            internalType: 'struct StorageAfterPressing',
            name: 'storageAfterPressing',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'string', name: 'lab', type: 'string' },
              { internalType: 'string', name: 'onhId', type: 'string' },
              { internalType: 'uint256', name: 'acidity', type: 'uint256' },
              { internalType: 'string', name: 'quality', type: 'string' },
              { internalType: 'string', name: 'area', type: 'string' },
              { internalType: 'uint256', name: 'peroxideValue', type: 'uint256' },
              { internalType: 'bool', name: 'certifiedOrganic', type: 'bool' }
            ],
            internalType: 'struct QualityCheck',
            name: 'qualityCheck',
            type: 'tuple'
          },
          { internalType: 'bool', name: 'isFinalized', type: 'bool' }
        ],
        internalType: 'struct Batch',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getBatchCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'farmer', type: 'address' }
    ],
    name: 'getBatchesByFarmer',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'transporterId', type: 'string' }
    ],
    name: 'getBatchesByTransporter',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

export default function TransportChain() {
  const [activeTab, setActiveTab] = useState<'log' | 'my-batches' | 'find'>('my-batches');
  const [connectedAccount, setConnectedAccount] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [batches, setBatches] = useState<{ id: string; batch: any }[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<{ id: string; batch: any } | null>(null);

  const providerRef = useRef<any>(null);
  const signerRef = useRef<any>(null);
  const contractRef = useRef<any>(null);

  const toChecksumAddress = (address: string) => {
    return ethers.utils.getAddress(address.toLowerCase());
  };

  const showStatusMessage = (text: string, type: 'success' | 'error' = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2500);
  };

  const init = async () => {
    if (!window.ethereum) {
      showStatusMessage('Please install MetaMask to use this application!');
      return;
    }

    try {
      providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await providerRef.current.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        console.log('No accounts connected on initial load.');
        return;
      }
      signerRef.current = providerRef.current.getSigner();
      contractRef.current = new ethers.Contract(contractAddress, contractABI, signerRef.current);
      const account = await signerRef.current.getAddress();
      const checksumAddress = toChecksumAddress(account);
      setConnectedAccount(checksumAddress);

      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          try {
            providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
            signerRef.current = providerRef.current.getSigner();
            contractRef.current = new ethers.Contract(contractAddress, contractABI, signerRef.current);
            const newChecksumAddress = toChecksumAddress(accounts[0]);
            setConnectedAccount(newChecksumAddress);
            setBatches([]);
            setSelectedBatch(null);
          } catch (error) {
            console.error('Error reconnecting:', error);
            showStatusMessage('Error reconnecting to Ethereum: ' + (error as Error).message);
          }
        } else {
          showStatusMessage('No account connected. Please reconnect MetaMask.');
          setConnectedAccount('');
          providerRef.current = null;
          signerRef.current = null;
          contractRef.current = null;
          setBatches([]);
          setSelectedBatch(null);
        }
      });
    } catch (error: any) {
      console.error('Error connecting:', error);
      showStatusMessage('Error connecting to Ethereum: ' + error.message);
    }
  };

  const fetchTransportedBatches = async () => {
    const contract = contractRef.current;
    if (!contract || !connectedAccount) return;
    try {
      const checksumAddress = toChecksumAddress(connectedAccount);
      const ids = await contract.getBatchesByTransporter(checksumAddress);
      const batchPromises = ids.map((id: any) => contract.getBatch(id));
      const batchList = await Promise.all(batchPromises);
      setBatches(batchList.map((b, i) => ({ id: ids[i].toString(), batch: b })));
    } catch (err: any) {
      console.error(err);
      showStatusMessage('Failed to load transported batches: ' + (err.reason || err.message));
    }
  };

  const loadBatchById = async (id: number) => {
    const contract = contractRef.current;
    if (!contract) return;
    try {
      const batch = await contract.getBatch(id);
      if (!batch || !batch.harvesting) {
        throw new Error('Batch does not exist');
      }
      setSelectedBatch({ id: id.toString(), batch });
    } catch (err: any) {
      console.error(err);
      showStatusMessage('Error: ' + (err.reason || err.message || 'Batch does not exist'));
    }
  };

  const handleLogTransportation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAccount) {
      showStatusMessage('Please connect MetaMask to log transportation.');
      return;
    }

    if (!batchId || !duration || !conditions || !vehicleType) {
      showStatusMessage('All fields are required. Please fill in every field.');
      return;
    }

    const contract = contractRef.current;
    if (!contract) {
      showStatusMessage('Contract not initialized. Please refresh the page.');
      return;
    }

    const idNum = parseInt(batchId);
    if (isNaN(idNum) || idNum <= 0) {
      showStatusMessage('Batch ID must be a valid positive number.');
      return;
    }

    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      showStatusMessage('Duration must be a valid positive number.');
      return;
    }

    const durationTenths = Math.round(durationNum * 10);

    try {
      showStatusMessage('Checking batch status...', 'success');

      const existingBatch = await contract.getBatch(idNum);
      if (!existingBatch || !existingBatch.harvesting) {
        throw new Error('Batch does not exist');
      }

      if (existingBatch.transportation.transporterId && existingBatch.transportation.transporterId.length > 0) {
        throw new Error(`Batch ${idNum} was already transported by ${existingBatch.transportation.transporterId}`);
      }

      const checksumAddress = toChecksumAddress(connectedAccount);
      showStatusMessage('Submitting transaction...', 'success');
      const tx = await contract.logTransportation(idNum, durationTenths, conditions, checksumAddress, vehicleType);
      console.log('Transaction sent:', tx.hash);
      showStatusMessage('Transaction sent, waiting for confirmation...', 'success');
      await tx.wait();
      showStatusMessage('Transportation logged successfully!', 'success');
      setBatchId('');
      setDuration('');
      setConditions('');
      setVehicleType('');
      if (activeTab === 'my-batches') fetchTransportedBatches();
    } catch (err: any) {
      console.error('Error in transportation logging:', err);
      showStatusMessage('Error logging transportation: ' + (err.reason || err.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleFindBatch = async () => {
    const id = parseInt(batchId);
    if (isNaN(id) || id <= 0) {
      showStatusMessage('Please enter a valid batch ID.');
      return;
    }
    await loadBatchById(id);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-batches' && connectedAccount) {
      fetchTransportedBatches();
    }
  }, [activeTab, connectedAccount]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transport Chain</h1>
        <p className="text-gray-600 mt-1">Manage olive oil batch transportation in the supply chain</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('log')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'log'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Log Transportation
            </button>
            <button
              onClick={() => setActiveTab('my-batches')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'my-batches'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Package className="h-5 w-5 inline mr-2" />
              My Batches
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'find'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Eye className="h-5 w-5 inline mr-2" />
              Find Batch
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'log' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Log New Transportation</h2>
              <p className="mb-4 text-gray-600">Connected Account: <span className="font-medium text-gray-900">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                }`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handleLogTransportation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
                  <input
                    type="number"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    placeholder="Enter batch ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    placeholder="e.g., 2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    placeholder="e.g., Temperature controlled, no incidents"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    placeholder="e.g., Refrigerated truck"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                >
                  Log Transportation
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-batches' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Transported Batches</h2>
              <p className="mb-4 text-gray-600">Connected Account: <span className="font-medium text-gray-900">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                }`}>
                  {message.text}
                </div>
              )}
              {batches.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl">
                  <Truck className="h-16 w-16 text-rose-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2 text-lg">No Transported Batches</p>
                  <p className="text-sm text-gray-600 mb-6">Start logging your first transportation to track batches</p>
                  <button
                    onClick={() => setActiveTab('log')}
                    className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                  >
                    Log First Transportation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map(({ id, batch }) => {
                    const status = batch.isFinalized ? 'Completed' : 'In Progress';
                    const transporterId = batch.transportation.transporterId || 'Unknown';
                    return (
                      <div key={id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-200 group">
                        <div className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: 'url(/assets/img/blog/oilveoil.jpg)' }}></div>
                        <div className="p-5 bg-gray-50 border-b">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 mr-2 text-rose-600" />
                            <span className="text-lg font-medium text-gray-800 truncate">{transporterId.slice(0, 6)}...{transporterId.slice(-4)}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between mb-4">
                            <div className="text-center flex-1">
                              <h5 className="text-sm font-bold text-gray-600 mb-1">Batch ID</h5>
                              <span className="text-lg font-semibold text-gray-900 block">{id}</span>
                            </div>
                            <div className="border-l border-gray-300 mx-4 my-2"></div>
                            <div className="text-center flex-1">
                              <h5 className="text-sm font-bold text-gray-600 mb-1">Status</h5>
                              <span className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                                status === 'Completed' 
                                  ? 'bg-rose-100 text-rose-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedBatch({ id, batch }); setActiveTab('find'); }}
                            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                          >
                            More Details
                            <Eye className="h-4 w-4 ml-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'find' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Batch Details</h2>
              <p className="mb-4 text-gray-600">Connected Account: <span className="font-medium text-gray-900">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                }`}>
                  {message.text}
                </div>
              )}
              {!selectedBatch ? (
                <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl p-8 text-center max-w-md mx-auto border border-rose-200">
                  <Package className="h-12 w-12 text-rose-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2 text-lg">Enter Batch ID</p>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full max-w-md mx-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all mb-4 text-center shadow-sm"
                    placeholder="e.g., 1"
                  />
                  <button 
                    onClick={handleFindBatch}
                    className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                  >
                    View Batch
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-md">
                    <div className="bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Batch ID: {selectedBatch.id}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedBatch.batch.isFinalized 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      Status: {selectedBatch.batch.isFinalized ? 'Complete' : 'In Progress'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-rose-600" />
                        Harvesting Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong className="text-gray-600">Farmer:</strong> <span className="text-gray-900">{selectedBatch.batch.harvesting.farmer || 'N/A'}</span></p>
                        <p><strong className="text-gray-600">Date:</strong> <span className="text-gray-900">{selectedBatch.batch.harvesting.date || 'N/A'}</span></p>
                        <p><strong className="text-gray-600">Location:</strong> <span className="text-gray-900">{selectedBatch.batch.harvesting.location || 'N/A'}</span></p>
                        <p><strong className="text-gray-600">Quantity:</strong> <span className="text-gray-900 font-medium">{(selectedBatch.batch.harvesting.quantity ? selectedBatch.batch.harvesting.quantity / 1000 : 0).toFixed(2)} kg</span></p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-purple-600" />
                        Transportation Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong className="text-gray-600">Duration:</strong> <span className="text-gray-900">{(selectedBatch.batch.transportation.duration ? selectedBatch.batch.transportation.duration / 10 : 0).toFixed(1)} hours</span></p>
                        <p><strong className="text-gray-600">Conditions:</strong> <span className="text-gray-900">{selectedBatch.batch.transportation.conditions || 'N/A'}</span></p>
                        <p><strong className="text-gray-600">Transporter:</strong> <span className="text-gray-900 font-medium">{selectedBatch.batch.transportation.transporterId || 'N/A'}</span></p>
                        <p><strong className="text-gray-600">Vehicle:</strong> <span className="text-gray-900">{selectedBatch.batch.transportation.vehicleType || 'N/A'}</span></p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedBatch(null); setBatchId(''); }}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-all shadow-md font-medium flex items-center justify-center mx-auto"
                  >
                    Back to Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}