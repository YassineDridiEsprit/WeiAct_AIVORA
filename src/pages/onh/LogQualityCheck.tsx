import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';
import { ethers, BigNumber } from 'ethers';
import { 
  FlaskConical, 
  Percent, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Brain,
  X
} from 'lucide-react';

const CONTRACT_ADDRESS = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
const EXPECTED_CHAIN_ID = '1337'; // Adjust for your network (e.g., '11155111' for Sepolia)

export default function LogQualityCheck() {
  const { account, connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [onhId, setOnhId] = useState('');
  const [lab, setLab] = useState('');
  const [acidity, setAcidity] = useState('');
  const [peroxideValue, setPeroxideValue] = useState('');
  const [quality, setQuality] = useState('');
  const [area, setArea] = useState('');
  const [certifiedOrganic, setCertifiedOrganic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [currentPredictionField, setCurrentPredictionField] = useState<'quality' | 'area'>('quality');
  const [lookupBatchId, setLookupBatchId] = useState('');
  const [batchInfo, setBatchInfo] = useState<string | null>(null);

  // Prediction form states
  const [predictionData, setPredictionData] = useState({
    faees: '',
    k232: '',
    k270: '',
    acidityInput: '',
    peroxideIndex: '',
    palmitic: '',
    palmitoleic: '',
    stearic: '',
    oleic: '',
    linoleic: '',
    linolenic: '',
    arachidic: '',
    eicosenoic: ''
  });

  const showMessage = (msg: string, type: 'success' | 'error' = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  // Initialize wallet
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

        if (!account) {
          await connect();
        }

        if (!account) {
          showMessage('No Ethereum account connected. Please connect MetaMask.');
          return;
        }

        setOnhId(toChecksumAddress(account));

        // Verify contract initialization
        if (!contract) {
          showMessage('Contract not initialized. Please check WalletContext setup.');
          return;
        }

        if (typeof contract.logQualityCheck !== 'function') {
          console.error('logQualityCheck is not a function on contract:', contract);
          console.log('Available contract functions:', Object.keys(contract.functions || {}));
          showMessage('Contract error: logQualityCheck function is missing. Please verify the contract ABI in WalletContext.');
          return;
        }

        // Check ONH_ROLE status
        // if (hasOnhRole === false) {
        //   showMessage('Your account lacks ONH_ROLE. Please contact the contract admin to grant this role.');
        // }
      } catch (error: any) {
        console.error('Error connecting:', error);
        showMessage(`Error connecting to Ethereum: ${error.message}`);
      }
    };

    initWallet();
  }, [connect, account, contract]);

  // Handle accountsChanged
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await connect();
        setOnhId(toChecksumAddress(accounts[0]));
      } else {
        showMessage('No account connected. Please reconnect MetaMask.');
        setOnhId('');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [connect]);

  const openPredictionModal = (field: 'quality' | 'area') => {
    setCurrentPredictionField(field);
    setShowPredictionModal(true);
  };

  const closePredictionModal = () => {
    setShowPredictionModal(false);
    setPredictionData({
      faees: '',
      k232: '',
      k270: '',
      acidityInput: '',
      peroxideIndex: '',
      palmitic: '',
      palmitoleic: '',
      stearic: '',
      oleic: '',
      linoleic: '',
      linolenic: '',
      arachidic: '',
      eicosenoic: ''
    });
  };

  const submitPrediction = async () => {
    let features: any;
    let url: string;

    if (currentPredictionField === 'area') {
      features = {
        palmitic: parseFloat(predictionData.palmitic),
        palmitoleic: parseFloat(predictionData.palmitoleic),
        stearic: parseFloat(predictionData.stearic),
        oleic: parseFloat(predictionData.oleic),
        linoleic: parseFloat(predictionData.linoleic),
        linolenic: parseFloat(predictionData.linolenic),
        arachidic: parseFloat(predictionData.arachidic),
        eicosenoic: parseFloat(predictionData.eicosenoic)
      };
      url = 'http://127.0.0.1:8000/predict';
    } else {
      features = {
        FAEES: parseFloat(predictionData.faees),
        K232: parseFloat(predictionData.k232),
        K270: parseFloat(predictionData.k270),
        Acidity: parseFloat(predictionData.acidityInput),
        Peroxide_Index: parseFloat(predictionData.peroxideIndex)
      };
      url = 'http://127.0.0.1:8000/predict2';
    }

    // for (const [key, value] of Object.entries(features)) {
    //   if (isNaN(value)) {
    //     showMessage(`Please enter a valid number for ${key}`);
    //     return;
    //   }
    // }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let prediction;

      if (currentPredictionField === 'area') {
        prediction = result.predicted_area;
        if (!prediction) {
          showMessage('Invalid area prediction response');
          return;
        }
        setArea(prediction);
      } else {
        prediction = result.predicted_quality;
        if (!prediction) {
          showMessage('Invalid quality prediction response');
          return;
        }
        setQuality(prediction);
      }

      showMessage(`${currentPredictionField.charAt(0).toUpperCase() + currentPredictionField.slice(1)} predicted as: ${prediction}`, 'success');
      closePredictionModal();
    } catch (error: any) {
      console.error('Prediction error:', error);
      showMessage(`Error predicting ${currentPredictionField}: ${error.message}`);
    }
  };

  const lookupBatch = async () => {
    if (!lookupBatchId || isNaN(parseInt(lookupBatchId)) || parseInt(lookupBatchId) <= 0) {
      showMessage('Please enter a valid Batch ID.');
      return;
    }

    if (!contract) {
      showMessage('Please connect MetaMask to verify a batch.');
      return;
    }

    try {
      const batchIdNum = parseInt(lookupBatchId);
      const batch = await contract.getBatch(BigNumber.from(batchIdNum));
      if (batch && batch.harvesting && batch.harvesting.quantity.gt(0)) {
        setBatchInfo(`Batch ${batchIdNum} exists. Farmer: ${batch.harvesting.farmer}, Quantity: ${(batch.harvesting.quantity.toNumber() / 1000)} kg`);
        showMessage(`Batch ${batchIdNum} found!`, 'success');
      } else {
        setBatchInfo(null);
        showMessage('Batch does not exist.');
      }
    } catch (err: any) {
      console.error('Error looking up batch:', err);
      showMessage(`Error verifying batch: ${err.reason || err.message || 'Unknown error'}`);
      setBatchInfo(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setBatchInfo(null);

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

    // Verify contract has logQualityCheck
    if (typeof contract.logQualityCheck !== 'function') {
      console.error('Contract error: logQualityCheck is not a function', { contract });
      console.log('Available contract functions:', Object.keys(contract.functions || {}));
      showMessage('Contract error: logQualityCheck function is missing. Please verify the contract ABI in WalletContext.');
      return;
    }

    // Check ONH_ROLE
    // if (hasOnhRole === false) {
    //   showMessage('Your account lacks ONH_ROLE. Please contact the contract admin to grant this role.');
    //   return;
    // }

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

    if (!batchId || !onhId || !lab || !acidity || !peroxideValue || !quality || !area) {
      showMessage('All fields are required. Please fill in every field.');
      return;
    }

    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id <= 0) {
        showMessage('Batch ID must be a valid positive integer.');
        return;
      }

      const acidityNum = parseFloat(acidity);
      const peroxideNum = parseFloat(peroxideValue);
      if (isNaN(acidityNum) || acidityNum < 0) {
        showMessage('Acidity must be a valid non-negative number.');
        return;
      }
      if (isNaN(peroxideNum) || peroxideNum < 0) {
        showMessage('Peroxide Value must be a valid non-negative number.');
        return;
      }

      setLoading(true);
      showMessage('Checking batch status...');

      // Verify batch existence
      const batchIdBN = BigNumber.from(id);
      const batch = await contract.getBatch(batchIdBN);
      if (!batch || !batch.harvesting || batch.harvesting.quantity.lte(0)) {
        throw new Error('Batch does not exist');
      }

      showMessage('Processing transaction...');

      const acidityScaled = Math.round(acidityNum * 10);
      const peroxideValueScaled = Math.round(peroxideNum * 10);

      // Ensure scaled values are valid numbers
      if (isNaN(acidityScaled) || isNaN(peroxideValueScaled)) {
        throw new Error('Invalid acidity or peroxide value');
      }

      console.log('Calling logQualityCheck with:', {
        batchIdBN: batchIdBN.toString(),
        onhId,
        lab,
        acidityScaled,
        quality,
        area,
        peroxideValueScaled,
        certifiedOrganic,
        gasLimit: 500000
      });

      const tx = await contract.logQualityCheck(
        batchIdBN,
        onhId,
        lab,
        acidityScaled,
        quality,
        area,
        peroxideValueScaled,
        certifiedOrganic,
        { gasLimit: 500000 }
      );

      showMessage('Transaction sent, waiting for confirmation...');
      await tx.wait();

      showMessage('Quality check logged successfully!', 'success');

      // Reset form
      setBatchId('');
      setLab('');
      setAcidity('');
      setPeroxideValue('');
      setQuality('');
      setArea('');
      setCertifiedOrganic(false);
      setOnhId(account ? toChecksumAddress(account) : '');
      setBatchInfo(null);
    } catch (err: any) {
      console.error('Full error:', err);
      let errorMessage = err?.reason || err?.data?.message || err?.message || 'Unknown error';
      if (errorMessage.includes('caller does not have ONH_ROLE')) {
        showMessage('Transaction failed: Connected account lacks ONH_ROLE. Please grant the role or use a different account.');
      } else if (errorMessage.includes('Internal JSON-RPC error')) {
        showMessage('Transaction failed: Invalid batch ID or contract error. Please verify the Batch ID or network settings.');
      } else {
        showMessage(`Error logging quality check: ${errorMessage}. Please verify the Batch ID or create a new batch.`);
      }
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
            <h1 className="text-4xl font-bold mb-4">Log Quality Check</h1>
            <p className="text-xl opacity-90">Ensuring Quality and Transparency in Olive Oil Production</p>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Log Quality Check</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Form Section */}
          <div className="w-full">
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between items-center">
                <p className="text-base text-gray-600">
                  Connected Account: <span className="font-mono text-gray-900">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not connected'}</span>
                </p>
                <button
                  onClick={connect}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all text-base"
                >
                  {account ? 'Connected' : 'Connect MetaMask'}
                </button>
              </div>
              {/* {account && hasOnhRole === false && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-red-700">
                    Your account lacks ONH_ROLE. Please contact the contract admin to grant this role.
                  </p>
                </div>
              )} */}
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">Log Quality Check</h3>
              <div className="mb-6">
                <label htmlFor="lookupBatchId" className="block text-base font-medium text-gray-700 mb-2">Verify Batch ID</label>
                <div className="flex gap-3">
                  <input
                    id="lookupBatchId"
                    type="number"
                    value={lookupBatchId}
                    onChange={(e) => setLookupBatchId(e.target.value)}
                    className="flex-1 px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                    placeholder="Enter Batch ID to verify"
                  />
                  <button
                    type="button"
                    onClick={lookupBatch}
                    className="px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-base"
                  >
                    Verify Batch
                  </button>
                </div>
                {batchInfo && (
                  <div className="mt-3 text-base text-green-700">
                    {batchInfo}
                  </div>
                )}
              </div>
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="batchId" className="block text-base font-medium text-gray-700 mb-2">Batch ID</label>
                    <input
                      id="batchId"
                      type="number"
                      required
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                      placeholder="Enter Batch ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="onhId" className="block text-base font-medium text-gray-700 mb-2">ONH ID (Wallet Address)</label>
                    <input
                      id="onhId"
                      type="text"
                      required
                      value={onhId}
                      readOnly
                      className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-gray-50 text-base"
                      placeholder="ONH ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="lab" className="block text-base font-medium text-gray-700 mb-2">Lab Name</label>
                    <div className="relative">
                      <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        id="lab"
                        type="text"
                        required
                        value={lab}
                        onChange={(e) => setLab(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                        placeholder="Enter Lab Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="acidity" className="block text-base font-medium text-gray-700 mb-2">Acidity (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        id="acidity"
                        type="number"
                        step="0.1"
                        required
                        value={acidity}
                        onChange={(e) => setAcidity(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                        placeholder="Enter Acidity"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="peroxideValue" className="block text-base font-medium text-gray-700 mb-2">Peroxide Value (meq/kg)</label>
                    <div className="relative">
                      <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                      <input
                        id="peroxideValue"
                        type="number"
                        step="0.1"
                        required
                        value={peroxideValue}
                        onChange={(e) => setPeroxideValue(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                        placeholder="Enter Peroxide Value"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="quality" className="block text-base font-medium text-gray-700 mb-2">Quality</label>
                    <div className="flex">
                      <input
                        id="quality"
                        type="text"
                        required
                        value={quality}
                        readOnly
                        className="flex-1 px-5 py-4 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                        placeholder="Quality"
                      />
                      <button
                        type="button"
                        onClick={() => openPredictionModal('quality')}
                        className="px-6 py-4 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-all flex items-center space-x-2 text-base"
                      >
                        <Brain className="h-5 w-5" />
                        <span>Predict</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="area" className="block text-base font-medium text-gray-700 mb-2">Area</label>
                    <div className="flex">
                      <input
                        id="area"
                        type="text"
                        required
                        value={area}
                        readOnly
                        className="flex-1 px-5 py-4 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-base"
                        placeholder="Area"
                      />
                      <button
                        type="button"
                        onClick={() => openPredictionModal('area')}
                        className="px-6 py-4 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-all flex items-center space-x-2 text-base"
                      >
                        <Brain className="h-5 w-5" />
                        <span>Predict</span>
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="certifiedOrganic"
                        type="checkbox"
                        checked={certifiedOrganic}
                        onChange={(e) => setCertifiedOrganic(e.target.checked)}
                        className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      />
                      <label htmlFor="certifiedOrganic" className="ml-3 block text-base text-gray-700">
                        Certified Organic
                      </label>
                    </div>
                  </div>
                </div>
                {message && (
                  <div className={`p-5 rounded-lg flex items-start space-x-3 ${
                    messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    {messageType === 'success' ? (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-base ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {message}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="inline-block mr-2 h-6 w-6 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Predict {currentPredictionField.charAt(0).toUpperCase() + currentPredictionField.slice(1)}
              </h3>
              <button
                onClick={closePredictionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <div className="space-y-6">
              {currentPredictionField === 'area' ? (
                <>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Palmitic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.palmitic}
                      onChange={(e) => setPredictionData({ ...predictionData, palmitic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 12.5"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Palmitoleic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.palmitoleic}
                      onChange={(e) => setPredictionData({ ...predictionData, palmitoleic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 1.2"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Stearic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.stearic}
                      onChange={(e) => setPredictionData({ ...predictionData, stearic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Oleic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.oleic}
                      onChange={(e) => setPredictionData({ ...predictionData, oleic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 70.0"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Linoleic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.linoleic}
                      onChange={(e) => setPredictionData({ ...predictionData, linoleic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 10.0"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Linolenic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.linolenic}
                      onChange={(e) => setPredictionData({ ...predictionData, linolenic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 0.8"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Arachidic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.arachidic}
                      onChange={(e) => setPredictionData({ ...predictionData, arachidic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 0.4"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Eicosenoic (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.eicosenoic}
                      onChange={(e) => setPredictionData({ ...predictionData, eicosenoic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 0.3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">FAEES:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.faees}
                      onChange={(e) => setPredictionData({ ...predictionData, faees: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">K232:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.k232}
                      onChange={(e) => setPredictionData({ ...predictionData, k232: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 1.9"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">K270:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.k270}
                      onChange={(e) => setPredictionData({ ...predictionData, k270: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 0.17"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Acidity (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.acidityInput}
                      onChange={(e) => setPredictionData({ ...predictionData, acidityInput: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 1.3"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Peroxide Index (meq/kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={predictionData.peroxideIndex}
                      onChange={(e) => setPredictionData({ ...predictionData, peroxideIndex: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-base"
                      placeholder="e.g., 6.7"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={submitPrediction}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium text-lg"
              >
                Submit Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}