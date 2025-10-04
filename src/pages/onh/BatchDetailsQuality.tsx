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
  Loader2
} from 'lucide-react';

interface BatchData {
  harvesting: {
    farmer: string;
    date: string;
    location: string;
    method: string;
    quantity: any;
    variety: string;
  };
  transportation: {
    duration: any;
    transporterId: string;
    conditions: string;
    vehicleType: string;
  };
  storageBeforePressing: {
    duration: any;
    pressingId: string;
    conditions: string;
    temperature: any;
    humidity: any;
    goodOlives: any;
    badOlives: any;
  };
  pressingProcess: {
    date: string;
    pressingId: string;
    facility: string;
    method: string;
    conditions: string;
    temperature: any;
    pressure: any;
    operatorName: string;
  };
  storageAfterPressing: {
    tankId: string;
    pressingId: string;
    duration: any;
    conditions: string;
    temperature: any;
    humidity: any;
    inertAtmosphere: boolean;
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

export default function BatchDetailsQuality() {
  const { batchId } = useParams<{ batchId: string }>();
  const { account, connect, contract } = useWallet();
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBatchDetails = async () => {
    if (!batchId || isNaN(parseInt(batchId))) {
      setError('Invalid batch ID provided.');
      return;
    }

    setError(null);
    if (!contract) await connect();
    if (!account) await connect();
    
    try {
      setLoading(true);
      const batch = await contract.getBatch(parseInt(batchId));
      if (!batch || !batch.harvesting) {
        throw new Error('Batch does not exist');
      }
      setBatchData(batch);
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.reason || err.message || 'Batch does not exist'}`);
    } finally {
      setLoading(false);
    }
  };


  const isValid = (value: any, isNumber = false) => {
    if (isNumber) {
      try {
        if (value === undefined || value === null) return false;
        if (typeof value === 'number') return value > 0;
        if (typeof value.gt === 'function') return value.gt(0);
        return false;
      } catch {
        return false;
      }
    }
    return value !== undefined && value !== null && value.toString().trim() !== '';
  };

  const formatField = (label: string, value: any, isNumber = false, suffix = '') => {
    if (isValid(value, isNumber)) {
      let displayValue = value;
      if (isNumber && label === 'Quantity') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 1000;
        displayValue = Number(displayValue.toFixed(2));
      } else if (isNumber && label === 'Duration') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 10;
        displayValue = Number(displayValue.toFixed(1));
        suffix = displayValue === 1 ? ' hour' : ' hours';
      } else if (isNumber && label === 'Temperature') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 10;
        displayValue = Number(displayValue.toFixed(1));
        suffix = '°C';
      } else if (isNumber && label === 'Humidity') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 10;
        displayValue = Number(displayValue.toFixed(1));
        suffix = '%';
      } else if (isNumber && label === 'Acidity') {
        displayValue = (typeof value === 'number' ? value : value.toString()) / 10;
        displayValue = Number(displayValue.toFixed(1));
        suffix = '%';
      } else if (isNumber && label === 'Pressure') {
        displayValue = (typeof value === 'number' ? value : value.toString());
        suffix = ' bar';
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

  useEffect(() => {
    if (account && batchId) {
      loadBatchDetails();
    }
  }, [account, batchId]);

  const sections = batchData ? [
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
        { label: 'Transporter ID', value: batchData.transportation.transporterId },
        { label: 'Duration', value: batchData.transportation.duration, isNumber: true },
        { label: 'Conditions', value: batchData.transportation.conditions },
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
      icon: Cog,
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
  ] : [];

  const validSections = sections.filter(section => 
    section.fields.some(field => isValid(field.value, field.isNumber))
  );

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
            {batchData && (
              <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full font-semibold">
                      Batch ID: {batchId}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      batchData.isFinalized 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Status: {batchData.isFinalized ? 'Complete' : 'In Progress'}
                    </div>
                  </div>
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
            {!loading && validSections.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Supply Chain Journey</h2>
                  <p className="text-gray-600">Trace every step of your olive oil's production process with our transparent supply chain tracking.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {validSections.map((section, index) => {
                    const IconComponent = section.icon;
                    const validFields = section.fields.filter(field => 
                      isValid(field.value, field.isNumber)
                    );
                    
                    return (
                      <div key={section.title} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <IconComponent className="h-6 w-6 text-rose-600" />
                            <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                          </div>
                        </div>
                        <div className="p-6">
                          {validFields.map((field, fieldIndex) => {
                            const value = formatField(field.label, field.value, field.isNumber, 'field.suffix');
                            return (
                              <div key={fieldIndex} className="mb-3 last:mb-0">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-700 mb-1">{field.label}</span>
                                  <span className="text-gray-900">{value}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && validSections.length === 0 && batchData && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Supply Chain Data</h3>
                <p className="text-gray-600">No supply chain details available for this batch.</p>
              </div>
            )}

            {/* Not Connected State */}
            {!account && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-4">Connect your MetaMask wallet to view batch details.</p>
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
