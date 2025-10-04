import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';

export default function LoadBatches() {
  const { account, connect, contract } = useWallet();
  const [batches, setBatches] = useState<Array<{ id: string; status: string; farmer: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    if (!contract) {
      await connect();
      if (!contract) return;
    }
    if (!account) await connect();
    try {
      setLoading(true);
      const addr = toChecksumAddress(account || '');
      const ids: any[] = await contract.getBatchesByFarmer(addr);
      const items: Array<{ id: string; status: string; farmer: string }> = [];
      for (const id of ids) {
        const batch = await contract.getBatch(id);
        items.push({ id: id.toString(), status: batch.isFinalized ? 'Completed' : 'In Progress', farmer: batch.harvesting?.farmer || '' });
      }
      setBatches(items);
    } catch (e: any) {
      setError(e?.reason || e?.message || 'Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Batches</h2>
      <button onClick={connect} className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded">
        {account ? `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : 'Connect MetaMask'}
      </button>
      <button onClick={load} className="mb-4 ml-2 px-3 py-2 bg-slate-600 text-white rounded">Reload</button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map(b => (
          <div key={b.id} className="border rounded p-4">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-slate-500">Batch ID</div>
                <div className="font-semibold">{b.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Status</div>
                <div>{b.status}</div>
              </div>
            </div>
            <div className="mt-2 text-sm">Farmer: {b.farmer}</div>
            <a className="text-indigo-600 mt-3 inline-block" href={`/farmer/batch/${b.id}`}>More Details →</a>
          </div>
        ))}
      </div>
    </div>
  );
}


