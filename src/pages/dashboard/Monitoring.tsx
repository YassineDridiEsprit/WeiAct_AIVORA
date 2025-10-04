import { useState } from 'react';
import { Eye, Droplets, Flame, Leaf, AlertTriangle, Upload, X, Bug } from 'lucide-react';

interface SoilData {
  pH_Level: number;
  Organic_Matter: number;
  Nitrogen_Content: number;
  Phosphorus_Content: number;
  Potassium_Content: number;
}

interface PredictionResult {
  predicted_soil_health?: string;
  prediction?: string;
  result?: string;
}

interface InsectDetectionResult {
  image_url: string;
  insectes: { nom: string; statut: string }[];
}

export default function Monitoring() {
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showFloodModal, setShowFloodModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showFireModal, setShowFireModal] = useState(false);
  const [showInsectModal, setShowInsectModal] = useState(false);

  const [soilData, setSoilData] = useState<SoilData>({
    pH_Level: 0,
    Organic_Matter: 0,
    Nitrogen_Content: 0,
    Phosphorus_Content: 0,
    Potassium_Content: 0,
  });

  const [floodFile, setFloodFile] = useState<File | null>(null);
  const [floodPreview, setFloodPreview] = useState<string>('');
  const [waterFile, setWaterFile] = useState<File | null>(null);
  const [waterPreview, setWaterPreview] = useState<string>('');
  const [waterResult, setWaterResult] = useState<string>('');
  const [fireFile, setFireFile] = useState<File | null>(null);
  const [insectFile, setInsectFile] = useState<File | null>(null);
  const [insectPreview, setInsectPreview] = useState<string>('');
  const [insectResult, setInsectResult] = useState<InsectDetectionResult | null>(null);

  const [soilResult, setSoilResult] = useState<string>('No prediction yet.');
  const [floodResult, setFloodResult] = useState<string>('No prediction yet.');
  const [fireResult, setFireResult] = useState<string>('No prediction yet.');

  const [loading, setLoading] = useState(false);

  const handleSoilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict_soil_health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soilData),
      });
      if (!response.ok) throw new Error('Server error');
      const result: PredictionResult = await response.json();
      setSoilResult('Soil Health: ' + (result.predicted_soil_health || 'Unexpected response'));
    } catch (error: any) {
      setSoilResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleFloodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floodFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', floodFile);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict_flooding', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const result: PredictionResult = await response.json();
      setFloodResult('Prediction: ' + (result.prediction || 'Unexpected response'));
    } catch (error: any) {
      setFloodResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', waterFile);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict_water_accumulation', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setWaterResult(url);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleFireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fireFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', fireFile);
    try {
      const response = await fetch('http://127.0.0.1:8000/detect_wildfire', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const result: PredictionResult = await response.json();
      setFireResult('Detection Result: ' + (result.result || 'Unexpected response'));
    } catch (error: any) {
      setFireResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleInsectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insectFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', insectFile);
    try {
      const response = await fetch('http://127.0.0.1:8000/detect_insects', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const data: InsectDetectionResult = await response.json();
      setInsectResult(data);
    } catch (error: any) {
      setInsectResult(null);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleFileChange = (setter: (file: File | null) => void, previewSetter: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onload = (e) => previewSetter(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Environmental Monitoring in Olive Agriculture</h1>
        <p className="text-gray-600 mt-1">Real-time predictions for soil health, flooding, water accumulation, wildfire risks, and insect detection</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 h-full">
        {/* Soil Health Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="bg-gradient-to-br from-rose-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Soil Health</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">Input soil data to predict overall health</p>
          <button
            onClick={() => setShowSoilModal(true)}
            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex-shrink-0 mt-auto"
          >
            Analyze <Upload className="h-4 w-4 inline ml-2" />
          </button>
        </div>

        {/* Flooding Prediction Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="bg-gradient-to-br from-rose-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Flooding Prediction</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">Upload images to detect flooding risks</p>
          <button
            onClick={() => setShowFloodModal(true)}
            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex-shrink-0 mt-auto"
          >
            Predict <Upload className="h-4 w-4 inline ml-2" />
          </button>
        </div>

        {/* Water Accumulation Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="bg-gradient-to-br from-rose-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Water Accumulation</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">Identify areas with water build-up</p>
          <button
            onClick={() => setShowWaterModal(true)}
            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex-shrink-0 mt-auto"
          >
            Detect <Upload className="h-4 w-4 inline ml-2" />
          </button>
        </div>

        {/* Wildfire Prediction Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="bg-gradient-to-br from-rose-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Wildfire Prediction</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">Detect early signs of fire in images</p>
          <button
            onClick={() => setShowFireModal(true)}
            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex-shrink-0 mt-auto"
          >
            Detect <Upload className="h-4 w-4 inline ml-2" />
          </button>
        </div>

        {/* Insect Detection Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="bg-gradient-to-br from-rose-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">Insect Detection</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">Upload olive tree image to detect insects</p>
          <button
            onClick={() => setShowInsectModal(true)}
            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium flex-shrink-0 mt-auto"
          >
            Detect <Upload className="h-4 w-4 inline ml-2" />
          </button>
        </div>
      </div>

      {/* Soil Health Modal */}
      {showSoilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Soil Health Analysis</h2>
              <button onClick={() => setShowSoilModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSoilSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.pH_Level}
                  onChange={(e) => setSoilData({ ...soilData, pH_Level: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.Organic_Matter}
                  onChange={(e) => setSoilData({ ...soilData, Organic_Matter: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (kg/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.Nitrogen_Content}
                  onChange={(e) => setSoilData({ ...soilData, Nitrogen_Content: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (kg/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.Phosphorus_Content}
                  onChange={(e) => setSoilData({ ...soilData, Phosphorus_Content: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (kg/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.Potassium_Content}
                  onChange={(e) => setSoilData({ ...soilData, Potassium_Content: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Predicting...' : 'Predict'}
              </button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{soilResult}</p>
            </div>
          </div>
        </div>
      )}

      {/* Flooding Modal */}
      {showFloodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Flooding Prediction</h2>
              <button onClick={() => setShowFloodModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleFloodSubmit} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setFloodFile, setFloodPreview, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              {floodPreview && <img src={floodPreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />}
              <button
                type="submit"
                disabled={loading || !floodFile}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Predicting...' : 'Predict'}
              </button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{floodResult}</p>
            </div>
          </div>
        </div>
      )}

      {/* Water Accumulation Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Water Accumulation Detection</h2>
              <button onClick={() => setShowWaterModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleWaterSubmit} className="space-y-4 mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setWaterFile, setWaterPreview, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              {waterPreview && <img src={waterPreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />}
              <button
                type="submit"
                disabled={loading || !waterFile}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Detecting...' : 'Detect'}
              </button>
            </form>
            <div className="grid md:grid-cols-2 gap-4">
              {waterPreview && (
                <div>
                  <p className="font-medium mb-2">Original Image</p>
                  <img src={waterPreview} alt="Original" className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
              {waterResult && (
                <div>
                  <p className="font-medium mb-2">Prediction Result</p>
                  <img src={waterResult} alt="Result" className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wildfire Modal */}
      {showFireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Wildfire Detection</h2>
              <button onClick={() => setShowFireModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleFireSubmit} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setFireFile, () => {}, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <button
                type="submit"
                disabled={loading || !fireFile}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Detecting...' : 'Detect'}
              </button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{fireResult}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insect Detection Modal */}
      {showInsectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Olive Insect Detection</h2>
              <button onClick={() => setShowInsectModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleInsectSubmit} className="space-y-4 mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setInsectFile, setInsectPreview, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              {insectPreview && <img src={insectPreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />}
              <button
                type="submit"
                disabled={loading || !insectFile}
                className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Detecting...' : 'Detect Insects'}
              </button>
            </form>
            {insectResult && (
              <div className="space-y-4">
                <img 
                  src={`http://127.0.0.1:8000${insectResult.image_url}?t=${Date.now()}`} 
                  alt="Annotated Image" 
                  className="w-full h-96 object-contain rounded-md border" 
                />
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {insectResult.insectes.length} insect(s) detected: <em>{[...new Set(insectResult.insectes.map(i => i.nom))].join(", ")}</em>
                  </h4>
                  {insectResult.insectes.some(i => i.statut.toLowerCase() === "harmful") ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                      ⚠️ Harmful insects detected!
                    </div>
                  ) : (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
                      ✅ All insects are beneficial.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}