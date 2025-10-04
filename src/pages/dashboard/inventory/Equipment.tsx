import { useEffect, useState } from 'react';
import { Plus, Wrench, Edit, Trash2, X, Calendar, DollarSign, Settings } from 'lucide-react';
import { farmAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  hourly_cost: number;
  status?: string;
  purchase_date?: string;
  notes?: string;
}

interface EquipmentForm {
  name: string;
  equipment_type: string;
  hourly_cost: number;
}

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EquipmentForm>({
    name: '',
    equipment_type: '',
    hourly_cost: 0
  });

  useEffect(() => {
    if (user) {
      loadEquipment();
    }
  }, [user]);

  const loadEquipment = async () => {
    try {
      const response = await farmAPI.getEquipment();
      setEquipment(response.data);
    } catch (error) {
      console.error('Error loading equipment:', error);
      setError('Failed to load equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const resetForm = () => {
    setFormData({
      name: '',
      equipment_type: '',
      hourly_cost: 0
    });
  };

  const openCreateModal = () => {
    setEditingEquipment(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name,
      equipment_type: equipment.equipment_type,
      hourly_cost: equipment.hourly_cost
    });
    setShowModal(true);
  };

  const openDeleteModal = (equipment: Equipment) => {
    setDeletingEquipment(equipment);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setEditingEquipment(null);
    setDeletingEquipment(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingEquipment) {
        await farmAPI.updateEquipment(editingEquipment.id, formData);
        setSuccess('Equipment updated successfully!');
      } else {
        await farmAPI.createEquipment(formData);
        setSuccess('Equipment created successfully!');
      }

      closeModals();
      await loadEquipment();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      setError(error.response?.data?.detail || 'Failed to save equipment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEquipment) return;
    
    setActionLoading(true);
    setError(null);

    try {
      await farmAPI.deleteEquipment(deletingEquipment.id);
      setSuccess('Equipment deleted successfully!');
      closeModals();
      await loadEquipment();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      setError(error.response?.data?.detail || 'Failed to delete equipment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const equipmentTypes = [
    { value: 'TRACTOR', label: 'Tractor' },
    { value: 'HARVESTER', label: 'Harvester' },
    { value: 'PLOW', label: 'Plow' },
    { value: 'SPRAYER', label: 'Sprayer' },
    { value: 'TILLER', label: 'Tiller' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-1">Manage your farm equipment</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-3 rounded-xl">
                <Wrench className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(item)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Type:</span>
                <span>{item.equipment_type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Cost:</span>
                <span className="text-lg font-bold text-rose-600">{item.hourly_cost} DT/hr</span>
              </div>
              {item.purchase_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Purchased: {new Date(item.purchase_date).toLocaleDateString()}</span>
                </div>
              )}
              {item.notes && <p className="text-xs bg-gray-50 p-2 rounded">{item.notes}</p>}
              {item.status && (
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
                  {item.status.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {equipment.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          No equipment added yet. Click "Add Equipment" to get started.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
              </h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter equipment name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Type *
                </label>
                <select
                  value={formData.equipment_type}
                  onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select equipment type</option>
                  {equipmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Cost (DT) *
                </label>
                <input
                  type="number"
                  value={formData.hourly_cost}
                  onChange={(e) => setFormData({ ...formData, hourly_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-md hover:from-rose-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingEquipment ? 'Update Equipment' : 'Add Equipment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingEquipment.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Deleting...' : 'Delete Equipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
