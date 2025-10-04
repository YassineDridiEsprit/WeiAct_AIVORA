import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

export default function ViewQuality() {
  const { connect, contract } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const view = async () => {
    setError(null);
    if (!contract) await connect();
    try {
      setLoading(true);
      const id = parseInt(batchId);
      if (isNaN(id) || id <= 0) { setError('Invalid batch id'); setLoading(false); return; }
      const res = await contract.getBatch(id);
      setData(res?.qualityCheck);
    } catch (e: any) {
      setError(e?.reason || e?.message || 'Failed to load quality');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Quality Check</h2>
      <button onClick={connect} className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded">Connect MetaMask</button>
      <div className="flex gap-2 mb-4">
        <input className="flex-1 border p-2 rounded" placeholder="Batch ID" value={batchId} onChange={e=>setBatchId(e.target.value)} />
        <button onClick={view} className="px-4 py-2 bg-indigo-600 text-white rounded">Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && (
        <div className="border rounded p-4">
          <div>Lab: {data.lab || 'N/A'}</div>
          <div>ONH ID: {data.onhId || 'N/A'}</div>
          <div>Acidity: {data.acidity ? (Number(data.acidity.toString())/10).toFixed(1) : 'N/A'} %</div>
          <div>Quality: {data.quality || 'N/A'}</div>
          <div>Area: {data.area || 'N/A'}</div>
          <div>Peroxide Value: {data.peroxideValue?.toString?.() || 'N/A'} meq/kg</div>
          <div>Certified Organic: {data.certifiedOrganic ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}


