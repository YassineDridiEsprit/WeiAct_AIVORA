import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

export default function BatchDetails() {
  const { batchId } = useParams();
  const { connect, contract } = useWallet();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!batchId) return;
    setError(null);
    if (!contract) {
      await connect();
      if (!contract) return;
    }
    try {
      setLoading(true);
      const res = await contract.getBatch(batchId);
      setData(res);
    } catch (e: any) {
      setError(e?.reason || e?.message || 'Failed to load batch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable react-hooks/exhaustive-deps */ }, [batchId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Batch Details #{batchId}</h2>
      <button onClick={connect} className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded">Connect MetaMask</button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Harvesting</div>
            <div>Farmer: {data.harvesting?.farmer || 'N/A'}</div>
            <div>Date: {data.harvesting?.date || 'N/A'}</div>
            <div>Location: {data.harvesting?.location || 'N/A'}</div>
            <div>Method: {data.harvesting?.method || 'N/A'}</div>
            <div>Quantity: {data.harvesting?.quantity ? (Number(data.harvesting.quantity.toString())/1000).toFixed(2) : 'N/A'} kg</div>
            <div>Variety: {data.harvesting?.variety || 'N/A'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Transportation</div>
            <div>Transporter ID: {data.transportation?.transporterId || 'N/A'}</div>
            <div>Duration: {data.transportation?.duration ? (Number(data.transportation.duration.toString())/10).toFixed(1) : 'N/A'} hours</div>
            <div>Conditions: {data.transportation?.conditions || 'N/A'}</div>
            <div>Vehicle Type: {data.transportation?.vehicleType || 'N/A'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Storage Before Pressing</div>
            <div>Pressing ID: {data.storageBeforePressing?.pressingId || 'N/A'}</div>
            <div>Duration: {data.storageBeforePressing?.duration ? (Number(data.storageBeforePressing.duration.toString())/10).toFixed(1) : 'N/A'} hours</div>
            <div>Conditions: {data.storageBeforePressing?.conditions || 'N/A'}</div>
            <div>Temperature: {data.storageBeforePressing?.temperature ? (Number(data.storageBeforePressing.temperature.toString())/10).toFixed(1) : 'N/A'} °C</div>
            <div>Humidity: {data.storageBeforePressing?.humidity ? (Number(data.storageBeforePressing.humidity.toString())/10).toFixed(1) : 'N/A'} %</div>
            <div>Good Olives: {data.storageBeforePressing?.goodOlives?.toString?.() || 'N/A'}</div>
            <div>Bad Olives: {data.storageBeforePressing?.badOlives?.toString?.() || 'N/A'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Pressing Process</div>
            <div>Date: {data.pressingProcess?.date || 'N/A'}</div>
            <div>Pressing ID: {data.pressingProcess?.pressingId || 'N/A'}</div>
            <div>Facility: {data.pressingProcess?.facility || 'N/A'}</div>
            <div>Method: {data.pressingProcess?.method || 'N/A'}</div>
            <div>Conditions: {data.pressingProcess?.conditions || 'N/A'}</div>
            <div>Temperature: {data.pressingProcess?.temperature ? (Number(data.pressingProcess.temperature.toString())/10).toFixed(1) : 'N/A'} °C</div>
            <div>Pressure: {data.pressingProcess?.pressure?.toString?.() || 'N/A'} bar</div>
            <div>Operator: {data.pressingProcess?.operatorName || 'N/A'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Storage After Pressing</div>
            <div>Tank ID: {data.storageAfterPressing?.tankId || 'N/A'}</div>
            <div>Pressing ID: {data.storageAfterPressing?.pressingId || 'N/A'}</div>
            <div>Duration: {data.storageAfterPressing?.duration ? (Number(data.storageAfterPressing.duration.toString())/10).toFixed(1) : 'N/A'} hours</div>
            <div>Conditions: {data.storageAfterPressing?.conditions || 'N/A'}</div>
            <div>Temperature: {data.storageAfterPressing?.temperature ? (Number(data.storageAfterPressing.temperature.toString())/10).toFixed(1) : 'N/A'} °C</div>
            <div>Humidity: {data.storageAfterPressing?.humidity ? (Number(data.storageAfterPressing.humidity.toString())/10).toFixed(1) : 'N/A'} %</div>
            <div>Inert Atmosphere: {data.storageAfterPressing?.inertAtmosphere ? 'Yes' : 'No'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Quality Check</div>
            <div>Lab: {data.qualityCheck?.lab || 'N/A'}</div>
            <div>ONH ID: {data.qualityCheck?.onhId || 'N/A'}</div>
            <div>Acidity: {data.qualityCheck?.acidity ? (Number(data.qualityCheck.acidity.toString())/10).toFixed(1) : 'N/A'} %</div>
            <div>Quality: {data.qualityCheck?.quality || 'N/A'}</div>
            <div>Area: {data.qualityCheck?.area || 'N/A'}</div>
            <div>Peroxide Value: {data.qualityCheck?.peroxideValue?.toString?.() || 'N/A'} meq/kg</div>
            <div>Certified Organic: {data.qualityCheck?.certifiedOrganic ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
}


