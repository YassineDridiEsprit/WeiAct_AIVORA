// import { useState, useEffect, useRef } from 'react';
// import { Droplet, Plus, Package, Eye } from 'lucide-react';
// import { ethers } from 'ethers'; // Add this import

// // Declare jQuery globally for TypeScript
// declare global {
//   interface Window {
//     ethereum: any;
//     $: any;
//     jQuery: any;
//   }
// }

// const contractAddress = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
// const contractABI = [
//   {
//     inputs: [
//       { internalType: 'string', name: 'farmer', type: 'string' },
//       { internalType: 'string', name: 'harvestDate', type: 'string' },
//       { internalType: 'string', name: 'location', type: 'string' },
//       { internalType: 'string', name: 'method', type: 'string' },
//       { internalType: 'uint256', name: 'quantity', type: 'uint256' },
//       { internalType: 'string', name: 'variety', type: 'string' },
//     ],
//     name: 'createBatch',
//     outputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
// ];

// export default function OliveOilChain() {
//   const [activeTab, setActiveTab] = useState<'create' | 'load' | 'view'>('view');
//   const [connectedAccount, setConnectedAccount] = useState<string>('');
//   const [farmerName, setFarmerName] = useState<string>('');
//   const [harvestDate, setHarvestDate] = useState<string>('');
//   const [variety, setVariety] = useState<string>('');
//   const [quantity, setQuantity] = useState<string>('');
//   const [farmLocation, setFarmLocation] = useState<string>('');
//   const [farmerMethod, setFarmerMethod] = useState<string>('');
//   const [varietyLoading, setVarietyLoading] = useState<boolean>(false);
//   const [quantityLoading, setQuantityLoading] = useState<boolean>(false);
//   const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

//   const providerRef = useRef<any>(null);
//   const signerRef = useRef<any>(null);
//   const contractRef = useRef<any>(null);

//   const toChecksumAddress = (address: string) => {
//     return ethers.utils.getAddress(address.toLowerCase());
//   };

//   const showStatusMessage = (text: string, type: 'success' | 'error' = 'error') => {
//     setMessage({ text, type });
//     setTimeout(() => setMessage(null), 2500);
//   };

//   const checkJQuery = () => {
//     if (!window.jQuery) {
//       console.warn('jQuery is not available');
//       showStatusMessage('jQuery is not loaded. Please ensure the script is included.');
//       return false;
//     }
//     return true;
//   };

//   const init = async () => {
//     if (!window.ethereum) {
//       showStatusMessage('Please install MetaMask to use this application!');
//       return;
//     }

//     try {
//       providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await providerRef.current.send('eth_requestAccounts', []);
//       if (accounts.length === 0) {
//         console.log('No accounts connected on initial load.');
//         return;
//       }
//       signerRef.current = providerRef.current.getSigner();
//       contractRef.current = new ethers.Contract(contractAddress, contractABI, signerRef.current);
//       const account = await signerRef.current.getAddress();
//       const checksumAddress = toChecksumAddress(account);
//       setConnectedAccount(checksumAddress);
//       setFarmerName(checksumAddress);

//       window.ethereum.on('accountsChanged', async (accounts: string[]) => {
//         if (accounts.length > 0) {
//           try {
//             providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
//             signerRef.current = providerRef.current.getSigner();
//             contractRef.current = new ethers.Contract(contractAddress, contractABI, signerRef.current);
//             const newChecksumAddress = toChecksumAddress(accounts[0]);
//             setConnectedAccount(newChecksumAddress);
//             setFarmerName(newChecksumAddress);
//           } catch (error) {
//             console.error('Error reconnecting:', error);
//             showStatusMessage('Error reconnecting to Ethereum: ' );
//           }
//         } else {
//           showStatusMessage('No account connected. Please reconnect MetaMask.');
//           setConnectedAccount('');
//           setFarmerName('');
//           providerRef.current = null;
//           signerRef.current = null;
//           contractRef.current = null;
//         }
//       });
//     } catch (error: any) {
//       console.error('Error connecting:', error);
//       showStatusMessage('Error connecting to Ethereum: ' + error.message);
//     }
//   };

//   const resetForm = () => {
//     setHarvestDate('');
//     setVariety('');
//     setQuantity('');
//     setFarmLocation('');
//     setFarmerMethod('');
//     const varietyInput = document.getElementById('variety-input') as HTMLInputElement;
//     const quantityInput = document.getElementById('quantity-input') as HTMLInputElement;
//     if (varietyInput) varietyInput.value = '';
//     if (quantityInput) quantityInput.value = '';
//   };

//   const handleVarietyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) {
//       showStatusMessage('Please select an image to classify');
//       return;
//     }

//     if (!checkJQuery()) return;

//     const formData = new FormData();
//     formData.append('file', e.target.files[0]);
//     setVarietyLoading(true);

//     try {
//       const response = await window.jQuery.ajax({
//         url: 'http://127.0.0.1:8000/classify',
//         type: 'POST',
//         data: formData,
//         processData: false,
//         contentType: false,
//       });
//       setVariety(response);
//       showStatusMessage(`Variety classified as: ${response}`, 'success');
//     } catch (error: any) {
//       console.error('Error during variety classification:', error);
//       showStatusMessage('Error classifying variety: ' + error.message);
//     } finally {
//       setVarietyLoading(false);
//     }
//   };

//   const handleQuantityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) {
//       showStatusMessage('Please select a video to measure quantity');
//       return;
//     }

//     if (!checkJQuery()) return;

//     const formData = new FormData();
//     formData.append('file', e.target.files[0]);
//     setQuantityLoading(true);

//     try {
//       const response = await window.jQuery.ajax({
//         url: 'http://127.0.0.1:8000/quantify',
//         type: 'POST',
//         data: formData,
//         processData: false,
//         contentType: false,
//       });
//       setQuantity(response);
//       showStatusMessage(`Quantity measured as: ${response} kg`, 'success');
//     } catch (error: any) {
//       console.error('Error during quantity measurement:', error);
//       showStatusMessage('Error measuring quantity: ' + error.message);
//     } finally {
//       setQuantityLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!connectedAccount) {
//       showStatusMessage('Please connect MetaMask to create a batch.');
//       return;
//     }

//     if (!farmerName || !harvestDate || !farmLocation || !farmerMethod || !variety || !quantity) {
//       showStatusMessage('All fields are required. Please fill in every field.');
//       return;
//     }

//     const contract = contractRef.current;
//     if (!contract) {
//       showStatusMessage('Contract not initialized. Please refresh the page.');
//       return;
//     }

//     const quantityNum = parseFloat(quantity);
//     if (isNaN(quantityNum) || quantityNum <= 0) {
//       showStatusMessage('Quantity must be a valid positive number.');
//       return;
//     }

//     try {
//       const quantityGrams = Math.round(quantityNum * 1000);
//       showStatusMessage('Submitting transaction...', 'success');
//       const tx = await contract.createBatch(farmerName, harvestDate, farmLocation, farmerMethod, quantityGrams, variety);
//       console.log('Transaction sent:', tx.hash);
//       showStatusMessage('Transaction sent, waiting for confirmation...', 'success');
//       await tx.wait();
//       showStatusMessage('Batch created successfully!', 'success');
//       resetForm();
//     } catch (err: any) {
//       console.error('Error in batch creation:', err);
//       showStatusMessage('Error creating batch: ' + (err.reason || err.message || 'Unknown error'));
//     }
//   };

//   useEffect(() => {
//     // Poll for jQuery with retry limit
//     let retries = 0;
//     const maxRetries = 20;
//     const checkJQueryLoaded = setInterval(() => {
//       if (window.jQuery || retries >= maxRetries) {
//         clearInterval(checkJQueryLoaded);
//         if (window.jQuery) {
//           console.log('jQuery loaded successfully');
//           init();
//         } else {
//           console.error('Failed to load jQuery after retries');
//           showStatusMessage('Failed to load jQuery. Please check your network or scripts.');
//         }
//       }
//       retries++;
//     }, 100);

//     return () => clearInterval(checkJQueryLoaded);
//   }, []);

//   return (
//     <div className="space-y-6 p-4">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Olive Oil Chain</h1>
//         <p className="text-gray-600 mt-1">Track olive oil production from harvest to bottling</p>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm">
//         <div className="border-b border-gray-200">
//           <div className="flex space-x-1 p-2">
//             <button
//               onClick={() => setActiveTab('view')}
//               className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
//                 activeTab === 'view'
//                   ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <Eye className="h-5 w-5 inline mr-2" />
//               View Batches
//             </button>
//             <button
//               onClick={() => setActiveTab('create')}
//               className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
//                 activeTab === 'create'
//                   ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <Plus className="h-5 w-5 inline mr-2" />
//               Create Batch
//             </button>
//             <button
//               onClick={() => setActiveTab('load')}
//               className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
//                 activeTab === 'load'
//                   ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <Package className="h-5 w-5 inline mr-2" />
//               Load Batch
//             </button>
//           </div>
//         </div>

//         <div className="p-8">
//           {activeTab === 'view' && (
//             <div className="space-y-6 text-center py-12">
//               <Droplet className="h-16 w-16 text-rose-600 mx-auto mb-4" />
//               <p className="text-gray-700 font-medium mb-2">No Batches Yet</p>
//               <p className="text-sm text-gray-600 mb-6">Create your first olive oil batch to start tracking production</p>
//               <button
//                 onClick={() => setActiveTab('create')}
//                 className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg"
//               >
//                 Create First Batch
//               </button>
//             </div>
//           )}

//           {activeTab === 'create' && (
//             <div className="max-w-2xl mx-auto">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Batch</h2>
//               <p className="mb-4">Connected Account: <span className="font-medium">{connectedAccount || 'Not connected'}</span></p>
//               {message && (
//                 <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                   {message.text}
//                 </div>
//               )}
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Address</label>
//                   <input
//                     type="text"
//                     value={farmerName}
//                     readOnly
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
//                     placeholder="Connect MetaMask"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
//                   <input
//                     type="date"
//                     value={harvestDate}
//                     onChange={(e) => setHarvestDate(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Olive Variety</label>
//                     <div className="flex">
//                       <input
//                         type="text"
//                         value={variety}
//                         readOnly
//                         className="w-full px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-100"
//                         placeholder="Classify to fill"
//                         required
//                       />
//                       <input
//                         type="file"
//                         id="variety-input"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleVarietyChange}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => document.getElementById('variety-input')?.click()}
//                         className="bg-gray-200 px-4 py-3 rounded-r-lg hover:bg-gray-300"
//                         disabled={varietyLoading}
//                       >
//                         {varietyLoading ? (
//                           <span className="flex items-center">
//                             <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//                             </svg>
//                             Processing...
//                           </span>
//                         ) : (
//                           'Classify'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
//                     <div className="flex">
//                       <input
//                         type="text"
//                         value={quantity}
//                         readOnly
//                         className="w-full px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-100"
//                         placeholder="Measure to fill"
//                         required
//                       />
//                       <input
//                         type="file"
//                         id="quantity-input"
//                         accept="video/*"
//                         className="hidden"
//                         onChange={handleQuantityChange}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => document.getElementById('quantity-input')?.click()}
//                         className="bg-gray-200 px-4 py-3 rounded-r-lg hover:bg-gray-300"
//                         disabled={quantityLoading}
//                       >
//                         {quantityLoading ? (
//                           <span className="flex items-center">
//                             <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//                             </svg>
//                             Processing...
//                           </span>
//                         ) : (
//                           'Measure Qt'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
//                   <input
//                     type="text"
//                     value={farmLocation}
//                     onChange={(e) => setFarmLocation(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
//                     placeholder="e.g., Tunis, Tunisia"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Method</label>
//                   <textarea
//                     value={farmerMethod}
//                     onChange={(e) => setFarmerMethod(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
//                     placeholder="Describe the farming method"
//                     rows={4}
//                     required
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
//                 >
//                   Create Batch
//                 </button>
//               </form>
//             </div>
//           )}

//           {activeTab === 'load' && (
//             <div className="max-w-2xl mx-auto">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Load Existing Batch</h2>
//               <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-8 text-center">
//                 <Package className="h-12 w-12 text-rose-600 mx-auto mb-4" />
//                 <p className="text-gray-700 font-medium mb-2">Enter Batch Number</p>
//                 <input
//                   type="text"
//                   className="w-full max-w-md mx-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent mb-4"
//                   placeholder="e.g., BATCH-2025-001"
//                 />
//                 <button className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium">
//                   Load Batch
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from 'react';
import { Droplet, Plus, Package, Eye, Trees, Truck, Box, Settings, Archive, CheckCircle, User } from 'lucide-react';
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
              { internalType: 'string', name: 'transporterId', type: 'string' },
              { internalType: 'string', name: 'conditions', type: 'string' },
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
  }
];

export default function OliveOilChain() {
  const [activeTab, setActiveTab] = useState<'create' | 'load' | 'view'>('view');
  const [connectedAccount, setConnectedAccount] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>('');
  const [variety, setVariety] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [farmLocation, setFarmLocation] = useState<string>('');
  const [farmerMethod, setFarmerMethod] = useState<string>('');
  const [varietyLoading, setVarietyLoading] = useState<boolean>(false);
  const [quantityLoading, setQuantityLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [batches, setBatches] = useState<{ id: string; batch: any }[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<{ id: string; batch: any } | null>(null);
  const [batchInput, setBatchInput] = useState<string>('');

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

  const checkJQuery = () => {
    if (!window.jQuery) {
      console.warn('jQuery is not available');
      showStatusMessage('jQuery is not loaded. Please ensure the script is included.');
      return false;
    }
    return true;
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
      setFarmerName(checksumAddress);

      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          try {
            providerRef.current = new ethers.providers.Web3Provider(window.ethereum);
            signerRef.current = providerRef.current.getSigner();
            contractRef.current = new ethers.Contract(contractAddress, contractABI, signerRef.current);
            const newChecksumAddress = toChecksumAddress(accounts[0]);
            setConnectedAccount(newChecksumAddress);
            setFarmerName(newChecksumAddress);
            setBatches([]);
            setSelectedBatch(null);
          } catch (error) {
            console.error('Error reconnecting:', error);
            showStatusMessage('Error reconnecting to Ethereum: ' + message);
          }
        } else {
          showStatusMessage('No account connected. Please reconnect MetaMask.');
          setConnectedAccount('');
          setFarmerName('');
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

  const fetchBatches = async () => {
    const contract = contractRef.current;
    if (!contract || !connectedAccount) return;
    try {
      const ids = await contract.getBatchesByFarmer(connectedAccount);
      const batchPromises = ids.map((id: any) => contract.getBatch(id));
      const batchList = await Promise.all(batchPromises);
      setBatches(batchList.map((b, i) => ({ id: ids[i].toString(), batch: b })));
    } catch (err: any) {
      console.error(err);
      showStatusMessage('Failed to load batches: ' + (err.reason || err.message));
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

  const resetForm = () => {
    setHarvestDate('');
    setVariety('');
    setQuantity('');
    setFarmLocation('');
    setFarmerMethod('');
    const varietyInput = document.getElementById('variety-input') as HTMLInputElement;
    const quantityInput = document.getElementById('quantity-input') as HTMLInputElement;
    if (varietyInput) varietyInput.value = '';
    if (quantityInput) quantityInput.value = '';
  };

  const handleVarietyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      showStatusMessage('Please select an image to classify');
      return;
    }

    if (!checkJQuery()) return;

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setVarietyLoading(true);

    try {
      const response = await window.jQuery.ajax({
        url: 'http://127.0.0.1:8000/classify',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
      });
      setVariety(response);
      showStatusMessage(`Variety classified as: ${response}`, 'success');
    } catch (error: any) {
      console.error('Error during variety classification:', error);
      showStatusMessage('Error classifying variety: ' + error.message);
    } finally {
      setVarietyLoading(false);
    }
  };

  const handleQuantityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      showStatusMessage('Please select a video to measure quantity');
      return;
    }

    if (!checkJQuery()) return;

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setQuantityLoading(true);

    try {
      const response = await window.jQuery.ajax({
        url: 'http://127.0.0.1:8000/quantify',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
      });
      setQuantity(response);
      showStatusMessage(`Quantity measured as: ${response} kg`, 'success');
    } catch (error: any) {
      console.error('Error during quantity measurement:', error);
      showStatusMessage('Error measuring quantity: ' + error.message);
    } finally {
      setQuantityLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAccount) {
      showStatusMessage('Please connect MetaMask to create a batch.');
      return;
    }

    if (!farmerName || !harvestDate || !farmLocation || !farmerMethod || !variety || !quantity) {
      showStatusMessage('All fields are required. Please fill in every field.');
      return;
    }

    const contract = contractRef.current;
    if (!contract) {
      showStatusMessage('Contract not initialized. Please refresh the page.');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      showStatusMessage('Quantity must be a valid positive number.');
      return;
    }

    try {
      const quantityGrams = Math.round(quantityNum * 1000);
      showStatusMessage('Submitting transaction...', 'success');
      const tx = await contract.createBatch(farmerName, harvestDate, farmLocation, farmerMethod, quantityGrams, variety);
      console.log('Transaction sent:', tx.hash);
      showStatusMessage('Transaction sent, waiting for confirmation...', 'success');
      await tx.wait();
      showStatusMessage('Batch created successfully!', 'success');
      resetForm();
      if (activeTab === 'view') fetchBatches();
    } catch (err: any) {
      console.error('Error in batch creation:', err);
      showStatusMessage('Error creating batch: ' + (err.reason || err.message || 'Unknown error'));
    }
  };

  const handleLoadBatch = async () => {
    const id = parseInt(batchInput);
    if (isNaN(id) || id <= 0) {
      showStatusMessage('Please enter a valid batch ID.');
      return;
    }
    await loadBatchById(id);
  };

  const isValid = (value: any, isNumber = false) => {
    if (isNumber) {
      try {
        if (value === undefined || value === null) return false;
        if (typeof value === 'number') return value > 0;
        if (typeof value.eq !== 'undefined') return value.gt(0);
        return false;
      } catch {
        return false;
      }
    }
    return value !== undefined && value !== null && value.toString().trim() !== '';
  };

  const formatField = (label: string, value: any, isNumber = false, suffix = '') => {
    if (!isValid(value, isNumber)) return 'Not available';
    let displayValue = value;
    if (isNumber && label === 'Quantity') {
      displayValue = (typeof value === 'number' ? value : parseInt(value.toString())) / 1000;
      displayValue = Number(displayValue.toFixed(2));
    } else if (isNumber && label === 'Duration') {
      displayValue = (typeof value === 'number' ? value : parseInt(value.toString())) / 10;
      displayValue = Number(displayValue.toFixed(1));
      suffix = displayValue === 1 ? ' hour' : ' hours';
    } else if (isNumber && label === 'Temperature') {
      displayValue = (typeof value === 'number' ? value : parseInt(value.toString())) / 10;
      displayValue = Number(displayValue.toFixed(1));
      suffix = '°C';
    } else if (isNumber && label === 'Humidity') {
      displayValue = (typeof value === 'number' ? value : parseInt(value.toString())) / 10;
      displayValue = Number(displayValue.toFixed(1));
      suffix = '%';
    } else if (isNumber && label === 'Acidity') {
      displayValue = (typeof value === 'number' ? value : parseInt(value.toString())) / 10;
      displayValue = Number(displayValue.toFixed(1));
      suffix = '%';
    } else if (isNumber && label === 'Pressure') {
      displayValue = typeof value === 'number' ? value : parseInt(value.toString());
      suffix = ' bar';
    } else if (isNumber && label === 'Peroxide Value') {
      displayValue = typeof value === 'number' ? value : parseInt(value.toString());
      suffix = ' meq/kg';
    } else if (isNumber) {
      displayValue = typeof value === 'number' ? value : parseInt(value.toString());
    }
    return `${displayValue}${suffix}`;
  };

  const renderBatchDetails = (batchData: any) => {
    const sections = [
      {
        title: 'Harvesting',
        icon: Trees,
        fields: [
          { label: 'Farmer', value: batchData.harvesting.farmer },
          { label: 'Harvest Date', value: batchData.harvesting.date },
          { label: 'Location', value: batchData.harvesting.location },
          { label: 'Method', value: batchData.harvesting.method },
          { label: 'Quantity', value: batchData.harvesting.quantity, isNumber: true, suffix: ' kg' },
          { label: 'Variety', value: batchData.harvesting.variety }
        ]
      },
      {
        title: 'Transportation',
        icon: Truck,
        fields: [
          { label: 'Transporter ID', value: batchData.transportation.conditions },
          { label: 'Duration', value: batchData.transportation.duration, isNumber: true },
          { label: 'Conditions', value: batchData.transportation.transporterId },
          { label: 'Vehicle Type', value: batchData.transportation.vehicleType }
        ]
      },
      {
        title: 'Storage Before Pressing',
        icon: Box,
        fields: [
          { label: 'Pressing Facility ID', value: batchData.storageBeforePressing.pressingId },
          { label: 'Duration', value: batchData.storageBeforePressing.duration, isNumber: true },
          { label: 'Conditions', value: batchData.storageBeforePressing.conditions },
          { label: 'Temperature', value: batchData.storageBeforePressing.temperature, isNumber: true },
          { label: 'Humidity', value: batchData.storageBeforePressing.humidity, isNumber: true },
          { label: 'Good Olives', value: batchData.storageBeforePressing.goodOlives, isNumber: true },
          { label: 'Bad Olives', value: batchData.storageBeforePressing.badOlives, isNumber: true }
        ]
      },
      {
        title: 'Pressing Process',
        icon: Settings,
        fields: [
          { label: 'Pressing Date', value: batchData.pressingProcess.date },
          { label: 'Pressing Facility ID', value: batchData.pressingProcess.pressingId },
          { label: 'Facility', value: batchData.pressingProcess.facility },
          { label: 'Method', value: batchData.pressingProcess.method },
          { label: 'Conditions', value: batchData.pressingProcess.conditions },
          { label: 'Temperature', value: batchData.pressingProcess.temperature, isNumber: true },
          { label: 'Pressure', value: batchData.pressingProcess.pressure, isNumber: true },
          { label: 'Operator', value: batchData.pressingProcess.operatorName }
        ]
      },
      {
        title: 'Storage After Pressing',
        icon: Archive,
        fields: [
          { label: 'Tank ID', value: batchData.storageAfterPressing.tankId },
          { label: 'Pressing Facility ID', value: batchData.storageAfterPressing.pressingId },
          { label: 'Duration', value: batchData.storageAfterPressing.duration, isNumber: true },
          { label: 'Conditions', value: batchData.storageAfterPressing.conditions },
          { label: 'Temperature', value: batchData.storageAfterPressing.temperature, isNumber: true },
          { label: 'Humidity', value: batchData.storageAfterPressing.humidity, isNumber: true },
          { label: 'Inert Atmosphere', value: batchData.storageAfterPressing.inertAtmosphere ? 'Yes' : 'No' }
        ]
      },
      {
        title: 'Quality Check',
        icon: CheckCircle,
        fields: [
          { label: 'Lab', value: batchData.qualityCheck.lab },
          { label: 'ONH ID', value: batchData.qualityCheck.onhId },
          { label: 'Acidity', value: batchData.qualityCheck.acidity, isNumber: true },
          { label: 'Quality', value: batchData.qualityCheck.quality },
          { label: 'Area', value: batchData.qualityCheck.area },
          { label: 'Peroxide Value', value: batchData.qualityCheck.peroxideValue, isNumber: true },
          { label: 'Certified Organic', value: batchData.qualityCheck.certifiedOrganic ? 'Yes' : 'No' }
        ]
      }
    ];

    const validSections = sections.filter(section => 
      section.fields.some(field => isValid(field.value, field.isNumber))
    );

    if (validSections.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No supply chain details available for this batch.</p>
        </div>
      );
    }

    return validSections.map((section, index) => {
      const validFields = section.fields.filter(field => 
        isValid(field.value, field.isNumber)
      );
      const Icon = section.icon;
      const fieldsHtml = validFields.map(field => (
        <p key={field.label} className="mb-3 flex flex-wrap">
          <strong className="text-rose-700 font-semibold min-w-[160px] mr-2">{field.label}:</strong>
          <span className="flex-1">{formatField(field.label, field.value, field.isNumber,  '')}</span>
        </p>
      ));

      return (
        <div key={section.title} className="lg:col-span-4 md:col-span-6 col-span-full">
          <div className={`bg-white rounded-lg shadow-md border-t-4 border-rose-600 p-0 mb-8 h-full transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden flex flex-col ${index < validSections.length - 1 ? '' : ''}`}>
            <div className="bg-rose-50 text-rose-700 p-5 flex items-center border-b border-rose-100">
              <span className="text-xl font-bold text-purple-600 bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">{index + 1}</span>
              <Icon className="h-6 w-6 mr-3 text-rose-700" />
              <h3 className="m-0 text-lg font-semibold">{section.title}</h3>
            </div>
            <div className="p-6 flex-grow">
              {fieldsHtml}
            </div>
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    // Poll for jQuery with retry limit
    let retries = 0;
    const maxRetries = 20;
    const checkJQueryLoaded = setInterval(() => {
      if (window.jQuery || retries >= maxRetries) {
        clearInterval(checkJQueryLoaded);
        if (window.jQuery) {
          console.log('jQuery loaded successfully');
          init();
        } else {
          console.error('Failed to load jQuery after retries');
          showStatusMessage('Failed to load jQuery. Please check your network or scripts.');
        }
      }
      retries++;
    }, 100);

    return () => clearInterval(checkJQueryLoaded);
  }, []);

  useEffect(() => {
    if (activeTab === 'view' && connectedAccount) {
      fetchBatches();
    }
  }, [activeTab, connectedAccount]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olive Oil Chain</h1>
        <p className="text-gray-600 mt-1">Track olive oil production from harvest to bottling</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye className="h-5 w-5 inline mr-2" />
              View Batches
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Create Batch
            </button>
            <button
              onClick={() => setActiveTab('load')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'load'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5 inline mr-2" />
              Load Batch
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'view' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Batches</h2>
              <p className="mb-4">Connected Account: <span className="font-medium">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                  {message.text}
                </div>
              )}
              {batches.length === 0 ? (
                <div className="text-center py-12">
                  <Droplet className="h-16 w-16 text-rose-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">No Batches Yet</p>
                  <p className="text-sm text-gray-600 mb-6">Create your first olive oil batch to start tracking production</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Create First Batch
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map(({ id, batch }) => {
                    const status = batch.isFinalized ? 'Completed' : 'In Progress';
                    const farmerName = batch.harvesting.farmer || 'Unknown';
                    return (
                      <div key={id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200" onClick={() => { setSelectedBatch({ id, batch }); setActiveTab('load'); }}>
                        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/assets/img/blog/oilveoil.jpg)' }}></div>
                        <div className="p-4 bg-gray-50 border-b">
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="text-lg font-medium text-gray-800">{farmerName}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between mb-4">
                            <div className="text-center flex-1">
                              <h5 className="text-sm font-bold text-gray-600 mb-1">Batch ID</h5>
                              <span className="text-lg font-semibold text-gray-900">{id}</span>
                            </div>
                            <div className="border-l border-gray-300 mx-4"></div>
                            <div className="text-center flex-1">
                              <h5 className="text-sm font-bold text-gray-600 mb-1">Status</h5>
                              <span className={`text-lg font-semibold ${status === 'Completed' ? 'text-rose-600' : 'text-purple-600'}`}>{status}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedBatch({ id, batch }); setActiveTab('load'); }}
                            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center"
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

          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Batch</h2>
              <p className="mb-4">Connected Account: <span className="font-medium">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Address</label>
                  <input
                    type="text"
                    value={farmerName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    placeholder="Connect MetaMask"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Olive Variety</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={variety}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-100"
                        placeholder="Classify to fill"
                        required
                      />
                      <input
                        type="file"
                        id="variety-input"
                        accept="image/*"
                        className="hidden"
                        onChange={handleVarietyChange}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('variety-input')?.click()}
                        className="bg-gray-200 px-4 py-3 rounded-r-lg hover:bg-gray-300"
                        disabled={varietyLoading}
                      >
                        {varietyLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          'Classify'
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-100"
                        placeholder="Measure to fill"
                        required
                      />
                      <input
                        type="file"
                        id="quantity-input"
                        accept="video/*"
                        className="hidden"
                        onChange={handleQuantityChange}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('quantity-input')?.click()}
                        className="bg-gray-200 px-4 py-3 rounded-r-lg hover:bg-gray-300"
                        disabled={quantityLoading}
                      >
                        {quantityLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          'Measure Qt'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Tunis, Tunisia"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Method</label>
                  <textarea
                    value={farmerMethod}
                    onChange={(e) => setFarmerMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Describe the farming method"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                >
                  Create Batch
                </button>
              </form>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Load Batch Details</h2>
              <p className="mb-4">Connected Account: <span className="font-medium">{connectedAccount || 'Not connected'}</span></p>
              {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                  {message.text}
                </div>
              )}
              {!selectedBatch ? (
                <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-8 text-center max-w-md mx-auto">
                  <Package className="h-12 w-12 text-rose-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Enter Batch Number</p>
                  <input
                    type="text"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    className="w-full max-w-md mx-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent mb-4 text-center"
                    placeholder="e.g., 1"
                  />
                  <button 
                    onClick={handleLoadBatch}
                    className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                  >
                    Load Batch
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Batch ID: {selectedBatch.id}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedBatch.batch.isFinalized 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      Status: {selectedBatch.batch.isFinalized ? 'Complete' : 'In Progress'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {renderBatchDetails(selectedBatch.batch)}
                  </div>
                  <button
                    onClick={() => { setSelectedBatch(null); setBatchInput(''); }}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-all"
                  >
                    Back to Load
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