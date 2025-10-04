import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { ethers } from 'ethers';
import { 
  MapPin, 
  Clock, 
  Thermometer, 
  Droplets, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Upload
} from 'lucide-react';

// Define the contract address
const CONTRACT_ADDRESS = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
// Expected chain ID (e.g., 1337 for local Hardhat testnet, adjust as needed)
const EXPECTED_CHAIN_ID = '1337';

export default function LogStorageBeforePressing() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [duration, setDuration] = useState('');
  const [conditions, setConditions] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [goodOlives, setGoodOlives] = useState('');
  const [badOlives, setBadOlives] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [detectionLoading, setDetectionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectionUrl = 'http://127.0.0.1:8000/detect';

  const showMessage = (msg: string, type: 'success' | 'error' = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  useEffect(() => {
    const initWallet = async () => {
      if (!window.ethereum) {
        showMessage('Please install MetaMask to use this application!');
        return;
      }

      try {
        // Check network
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== EXPECTED_CHAIN_ID) {
          showMessage(`Please switch to the correct network (Chain ID: ${EXPECTED_CHAIN_ID})`);
          return;
        }

        await connect();
        if (!account) {
          showMessage('No Ethereum account connected. Please connect MetaMask.');
        }
      } catch (error: any) {
        console.error('Error connecting:', error);
        showMessage(`Error connecting to Ethereum: ${error.message}`);
      }
    };

    initWallet();

    // Add accountsChanged listener only once
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await connect();
      } else {
        showMessage('No account connected. Please reconnect MetaMask.');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Cleanup listener
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [connect]); // Empty dependency array to run only once on mount

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showMessage('Please select an image or video to detect');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setDetectionLoading(true);

    try {
      const response = await fetch(detectionUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.detections) {
        setGoodOlives(result.detections.good.toString());
        setBadOlives(result.detections.bad.toString());
        showMessage(`Detected: ${result.detections.good} good olives, ${result.detections.bad} bad olives`, 'success');
      } else {
        showMessage('Detection failed: Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error during detection:', error);
      showMessage(`Error detecting olives: ${error.message}`);
    } finally {
      setDetectionLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!contract || !account) {
      try {
        await connect();
        if (!contract || !account) {
          showMessage('Please connect your wallet to proceed');
          return;
        }
      } catch (error: any) {
        showMessage('Error connecting to MetaMask: ' + error.message);
        return;
      }
    }

    // Verify network
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== EXPECTED_CHAIN_ID) {
        showMessage(`Please switch to the correct network (Chain ID: ${EXPECTED_CHAIN_ID})`);
        return;
      }
    } catch (error: any) {
      console.error('Error checking network:', error);
      showMessage('Error verifying network: ' + error.message);
      return;
    }

    if (!batchId || !duration || !conditions || !temperature || !humidity || !goodOlives || !badOlives) {
      showMessage('Please fill in all fields or upload an image/video for detection');
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
      if (!batch || !batch.harvesting) {
        throw new Error('Batch does not exist');
      }

      showMessage('Processing transaction...');

      const pressingId = account; // Use account directly as pressingId
      const tx = await contract.logStorageBeforePressing(
        id,
        pressingId,
        durationScaled,
        conditions,
        tempScaled,
        humidityScaled,
        parseInt(goodOlives),
        parseInt(badOlives),
        { gasLimit: 500000 }
      );

      showMessage('Transaction sent, waiting for confirmation...');
      await tx.wait();

      showMessage('Storage before pressing logged successfully!', 'success');

      // Reset form
      setBatchId('');
      setDuration('');
      setConditions('');
      setTemperature('');
      setHumidity('');
      setGoodOlives('');
      setBadOlives('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <h1 className="text-4xl font-bold mb-4">Log Storage Before Pressing</h1>
            <p className="text-xl opacity-90">Record storage details before pressing for an olive oil batch.</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Log Storage Before Pressing</li>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Log Storage Before Pressing</h3>
              
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

                  {/* Good Olives */}
                  <div>
                    <label htmlFor="goodOlives" className="block text-sm font-medium text-gray-700 mb-2">
                      Good Olives (auto-detected)
                    </label>
                    <div className="relative">
                      <input
                        id="goodOlives"
                        type="number"
                        value={goodOlives}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Good Olives"
                      />
                    </div>
                  </div>

                  {/* Bad Olives */}
                  <div>
                    <label htmlFor="badOlives" className="block text-sm font-medium text-gray-700 mb-2">
                      Bad Olives (auto-detected)
                    </label>
                    <div className="relative">
                      <input
                        id="badOlives"
                        type="number"
                        value={badOlives}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Bad Olives"
                      />
                    </div>
                  </div>

                  {/* File Upload for Detection */}
                  <div>
                    <label htmlFor="detectionInput" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image/Video for Detection
                    </label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="detectionInput"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Detection Loading */}
                {detectionLoading && (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-600 mx-auto mb-2" />
                    <p className="text-gray-600">Processing detection, please wait...</p>
                  </div>
                )}

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