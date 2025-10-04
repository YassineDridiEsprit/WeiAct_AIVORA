import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { farmAPI } from '../lib/api';
import ParcelList from '../components/ParcelList';
import ParcelForm from '../components/ParcelForm';

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  area_hectares: number;
  location?: string;
  created_at: string;
}

const Parcels: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await farmAPI.getParcels();
        setParcels(response.data);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load parcels');
        if (error.response?.status === 401) {
          window.location.href = '/signin';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  const handleCreateParcel = (newParcel: Parcel) => {
    setParcels(prev => [...prev, newParcel]);
    setShowForm(false);
  };

  const handleUpdateParcel = (updatedParcel: Parcel) => {
    setParcels(prev => prev.map(p => p.id === updatedParcel.id ? updatedParcel : p));
    setSelectedParcel(null);
    setShowForm(false);
  };

  const handleDeleteParcel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this parcel?')) {
      return;
    }

    try {
      await farmAPI.deleteParcel(id);
      setParcels(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      alert('Delete failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error: {error}</h3>
        <button 
          onClick={() => window.location.reload()}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Parcels ({parcels.length})</h1>
          <p className="text-gray-600 mt-1">Manage your farm parcels and track their cultivation</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>New Parcel</span>
        </button>
      </div>

      <ParcelList
        parcels={parcels}
        onUpdate={setSelectedParcel}
        onDelete={handleDeleteParcel}
      />

      <ParcelForm
        open={showForm || !!selectedParcel}
        onClose={() => {
          setShowForm(false);
          setSelectedParcel(null);
        }}
        onParcelCreated={(newParcel) => {
          if (selectedParcel) {
            handleUpdateParcel(newParcel);
          } else {
            handleCreateParcel(newParcel);
          }
        }}
        existingParcel={selectedParcel}
      />
    </div>
  );
};

export default Parcels;
