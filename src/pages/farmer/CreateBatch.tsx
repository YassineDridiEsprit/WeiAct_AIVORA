import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toChecksumAddress } from '../../lib/web3';

export default function CreateBatch() {
  const { account, connect, contract } = useWallet();
  const [harvestDate, setHarvestDate] = useState('');
  const [variety, setVariety] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmerMethod, setFarmerMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!contract) {
      await connect();
      if (!contract) return;
    }
    if (!account) {
      await connect();
    }
    const farmer = toChecksumAddress(account || '');
    if (!farmer || !harvestDate || !farmLocation || !farmerMethod || !variety || !quantityKg) {
      setMessage('All fields are required.');
      return;
    }
    const qNum = parseFloat(quantityKg);
    if (isNaN(qNum) || qNum <= 0) {
      setMessage('Quantity must be a positive number.');
      return;
    }
    try {
      setLoading(true);
      const quantityGrams = Math.round(qNum * 1000);
      const tx = await contract.createBatch(
        farmer,
        harvestDate,
        farmLocation,
        farmerMethod,
        quantityGrams,
        variety
      );
      await tx.wait();
      setMessage('Batch created successfully.');
      setHarvestDate('');
      setVariety('');
      setQuantityKg('');
      setFarmLocation('');
      setFarmerMethod('');
    } catch (err: any) {
      setMessage(err?.reason || err?.message || 'Error creating batch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Batch</h2>
      <button onClick={connect} className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded">
        {account ? `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : 'Connect MetaMask'}
      </button>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border p-2 rounded" type="text" value={account || ''} readOnly />
        <input className="w-full border p-2 rounded" type="date" value={harvestDate} onChange={e=>setHarvestDate(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Olive Variety" value={variety} onChange={e=>setVariety(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Quantity in kg" value={quantityKg} onChange={e=>setQuantityKg(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Farm Location" value={farmLocation} onChange={e=>setFarmLocation(e.target.value)} required />
        <textarea className="w-full border p-2 rounded" placeholder="Farmer Method" value={farmerMethod} onChange={e=>setFarmerMethod(e.target.value)} required />
        <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">
          {loading ? 'Submitting...' : 'Create Batch'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}


