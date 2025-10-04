import { useEffect, useState } from 'react';
import { Plus, Boxes, AlertTriangle, Edit, Trash2, X, Package, TrendingDown, DollarSign } from 'lucide-react';
import { farmAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Input {
  id: number;
  name: string;
  input_type: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_alert: number;
}

interface InputForm {
  name: string;
  input_type: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_alert: number;
}

export default function Inputs() {
  const { user } = useAuth();
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingInput, setEditingInput] = useState<Input | null>(null);
  const [deletingInput, setDeletingInput] = useState<Input | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<InputForm>({
    name: '',
    input_type: '',
    unit: '',
    unit_price: 0,
    current_stock: 0,
    minimum_stock_alert: 0
  });

  useEffect(() => {
    if (user) {
      loadInputs();
    }
  }, [user]);

  const loadInputs = async () => {
    try {
      const response = await farmAPI.getInputs();
      setInputs(response.data);
    } catch (error) {
      console.error('Error loading inputs:', error);
      setError('Failed to load inputs. Please try again.');
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
      input_type: '',
      unit: '',
      unit_price: 0,
      current_stock: 0,
      minimum_stock_alert: 0
    });
  };

  const openCreateModal = () => {
    setEditingInput(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (input: Input) => {
    setEditingInput(input);
    setFormData({
      name: input.name,
      input_type: input.input_type,
      unit: input.unit,
      unit_price: input.unit_price,
      current_stock: input.current_stock,
      minimum_stock_alert: input.minimum_stock_alert
    });
    setShowModal(true);
  };

  const openDeleteModal = (input: Input) => {
    setDeletingInput(input);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setEditingInput(null);
    setDeletingInput(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingInput) {
        await farmAPI.updateInput(editingInput.id, formData);
        setSuccess('Input updated successfully!');
      } else {
        await farmAPI.createInput(formData);
        setSuccess('Input created successfully!');
      }

      closeModals();
      await loadInputs();
    } catch (error: any) {
      console.error('Error saving input:', error);
      setError(error.response?.data?.detail || 'Failed to save input. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInput) return;
    
    setActionLoading(true);
    setError(null);

    try {
      await farmAPI.deleteInput(deletingInput.id);
      setSuccess('Input deleted successfully!');
      closeModals();
      await loadInputs();
    } catch (error: any) {
      console.error('Error deleting input:', error);
      setError(error.response?.data?.detail || 'Failed to delete input. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const inputTypes = [
    { value: 'SEED', label: 'Seeds' },
    { value: 'FERTILIZER', label: 'Fertilizer' },
    { value: 'PESTICIDE', label: 'Pesticide' },
    { value: 'FUEL', label: 'Fuel' }
  ];

  const commonUnits = [
    { value: 'Kg', label: 'Kilograms (Kg)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'Unit', label: 'Units' },
    { value: 'Pack', label: 'Packs' },
    { value: 'Ton', label: 'Tons' }
  ];

  const isLowStock = (input: Input) => {
    // Ensure we're working with valid numbers
    const currentStock = parseFloat(String(input.current_stock)) || 0;
    const minimumAlert = parseFloat(String(input.minimum_stock_alert)) || 0;
    
    // Only show alert if current stock is less than or equal to minimum alert
    // AND minimum alert is greater than 0 (avoid false alerts when alert is 0)
    const result = minimumAlert > 0 && currentStock <= minimumAlert;
    
    // Debug logging - remove this after testing
    if (input.name === 'Test') {
      console.log('Low Stock Debug:', {
        name: input.name,
        currentStock: currentStock,
        currentStockType: typeof input.current_stock,
        currentStockRaw: input.current_stock,
        minimumAlert: minimumAlert,
        minimumAlertType: typeof input.minimum_stock_alert,
        minimumAlertRaw: input.minimum_stock_alert,
        comparison: `${minimumAlert} > 0 && ${currentStock} <= ${minimumAlert}`,
        result: result
      });
    }
    
    return result;
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
          <h1 className="text-3xl font-bold text-gray-900">Inputs</h1>
          <p className="text-gray-600 mt-1">Manage seeds, fertilizers, and supplies</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Input</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputs.map((input) => (
          <div key={input.id} className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group ${isLowStock(input) ? 'border-2 border-orange-200' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-3 rounded-xl">
                <Boxes className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex items-center space-x-2">
                {isLowStock(input) && (
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                )}
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(input)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(input)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{input.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Type:</span>
                <span>{input.input_type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{input.current_stock} {input.unit}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Price:</span>
                <span className="font-bold text-rose-600">{input.unit_price} DT/{input.unit}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-gray-400" />
                <span className="text-xs">Low stock alert: {input.minimum_stock_alert} {input.unit}</span>
              </div>
              {isLowStock(input) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-orange-700 text-xs font-medium">
                  ⚠️ Low Stock Alert - Reorder Soon!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {inputs.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          No inputs added yet. Click "Add Input" to get started.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingInput ? 'Edit Input' : 'Add Input'}
              </h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter input name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Type *
                </label>
                <select
                  value={formData.input_type}
                  onChange={(e) => setFormData({ ...formData, input_type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select input type</option>
                  {inputTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="">Select unit</option>
                    {commonUnits.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (DT) *
                  </label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Alert *
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_stock_alert}
                    onChange={(e) => setFormData({ ...formData, minimum_stock_alert: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
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
                  {actionLoading ? 'Saving...' : (editingInput ? 'Update Input' : 'Add Input')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingInput.name}"? 
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
                {actionLoading ? 'Deleting...' : 'Delete Input'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
