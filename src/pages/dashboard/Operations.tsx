import { useEffect, useState } from 'react';
import { Plus, Settings, Edit, Trash2, X, Calendar, Users, Wrench, Package } from 'lucide-react';
import { farmAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ParcelSelector from '../../components/ParcelSelector';
import PersonnelSelector from '../../components/PersonnelSelector';
import EquipmentSelector from '../../components/EquipmentSelector';
import InputSelector from '../../components/InputSelector';

interface Operation {
  id: number;
  operation_type: string;
  start_date: string;
  end_date: string;
  notes?: string;
  status?: string;
  scheduled_date?: string;
  completed_date?: string | null;
  // Backend returns related objects, not just IDs
  parcels?: Array<{
    id: number;
    name: string;
    culture: string;
    soil_type: string;
    location: string;
    area_hectares: number;
  }>;
  personnel?: Array<{
    id: number;
    name: string;
    role: string;
    hourly_rate: number;
    PersonnelWork: { daily_hours: number };
  }>;
  equipment?: Array<{
    id: number;
    name: string;
    equipment_type: string;
    hourly_cost: number;
    EquipmentUsage: { total_hours: number };
  }>;
  inputs?: Array<{
    id: number;
    name: string;
    input_type: string;
    unit: string;
    unit_price: number;
    current_stock: number;
    OperationInputUsage: { quantity: number };
  }>;
  // Keep these for form compatibility
  parcel_ids?: number[];
  personnel_ids?: Array<{ id: number; daily_hours: number }>;
  equipment_ids?: Array<{ id: number; total_hours: number }>;
  input_ids?: Array<{ id: number; quantity: number }>;
}

interface Parcel {
  id: number;
  name: string;
}

interface Personnel {
  id: number;
  name: string;
  role: string;
  hourly_rate: number;
}

interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  hourly_cost: number;
}

interface Input {
  id: number;
  name: string;
  input_type: string;
  unit: string;
  unit_price: number;
  current_stock: number;
}

interface OperationForm {
  operation_type: string;
  parcel_ids: number[];
  personnel_ids: Array<{ id: number; daily_hours: number }>;
  equipment_ids: Array<{ id: number; total_hours: number }>;
  input_ids: Array<{ id: number; quantity: number }>;
  start_date: string;
  end_date: string;
  notes: string;
}

export default function Operations() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [deletingOperation, setDeletingOperation] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OperationForm>({
    operation_type: '',
    parcel_ids: [],
    personnel_ids: [],
    equipment_ids: [],
    input_ids: [],
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [operationsRes, parcelsRes, personnelRes, equipmentRes, inputsRes] = await Promise.all([
        farmAPI.getOperations(),
        farmAPI.getParcels(),
        farmAPI.getPersonnel(),
        farmAPI.getEquipment(),
        farmAPI.getInputs()
      ]);
      
      setOperations(operationsRes.data);
      setParcels(parcelsRes.data);
      setPersonnel(personnelRes.data);
      setEquipment(equipmentRes.data);
      setInputs(inputsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
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
      operation_type: '',
      parcel_ids: [],
      personnel_ids: [],
      equipment_ids: [],
      input_ids: [],
      start_date: '',
      end_date: '',
      notes: ''
    });
  };

  const openCreateModal = () => {
    setEditingOperation(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (operation: Operation) => {
    setEditingOperation(operation);
    
    // Convert backend format (with full objects) to form format (with IDs)
    const parcel_ids = operation.parcels ? operation.parcels.map(p => p.id) : [];
    const personnel_ids = operation.personnel ? operation.personnel.map(p => ({
      id: p.id,
      daily_hours: p.PersonnelWork.daily_hours
    })) : [];
    const equipment_ids = operation.equipment ? operation.equipment.map(e => ({
      id: e.id,
      total_hours: e.EquipmentUsage.total_hours
    })) : [];
    const input_ids = operation.inputs ? operation.inputs.map(i => ({
      id: i.id,
      quantity: i.OperationInputUsage.quantity
    })) : [];
    
    setFormData({
      operation_type: operation.operation_type,
      parcel_ids,
      personnel_ids,
      equipment_ids,
      input_ids,
      start_date: operation.start_date.split('T')[0],
      end_date: operation.end_date.split('T')[0],
      notes: operation.notes || ''
    });
    setShowModal(true);
  };

  const openDeleteModal = (operation: Operation) => {
    setDeletingOperation(operation);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setEditingOperation(null);
    setDeletingOperation(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      if (editingOperation) {
        await farmAPI.updateOperation(editingOperation.id, submitData);
        setSuccess('Operation updated successfully!');
      } else {
        await farmAPI.createOperation(submitData);
        setSuccess('Operation created successfully!');
      }

      closeModals();
      await loadData();
    } catch (error: any) {
      console.error('Error saving operation:', error);
      let errorMessage = 'Failed to save operation. Please try again.';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Handle validation errors
        errorMessage = error.response.data.errors.map((err: any) => err.msg).join(', ');
      } else if (error.response?.data?.error) {
        // Handle general error
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        // Handle detail error
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOperation) return;
    
    setActionLoading(true);
    setError(null);

    try {
      await farmAPI.deleteOperation(deletingOperation.id);
      setSuccess('Operation deleted successfully!');
      closeModals();
      await loadData();
    } catch (error: any) {
      console.error('Error deleting operation:', error);
      let errorMessage = 'Failed to delete operation. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const addPersonnel = () => {
    setFormData({
      ...formData,
      personnel_ids: [...formData.personnel_ids, { id: 0, daily_hours: 8 }]
    });
  };

  const removePersonnel = (index: number) => {
    setFormData({
      ...formData,
      personnel_ids: formData.personnel_ids.filter((_, i) => i !== index)
    });
  };

  const updatePersonnel = (index: number, field: 'id' | 'daily_hours', value: number) => {
    const updated = [...formData.personnel_ids];
    updated[index][field] = value;
    setFormData({ ...formData, personnel_ids: updated });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment_ids: [...formData.equipment_ids, { id: 0, total_hours: 8 }]
    });
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment_ids: formData.equipment_ids.filter((_, i) => i !== index)
    });
  };

  const updateEquipment = (index: number, field: 'id' | 'total_hours', value: number) => {
    const updated = [...formData.equipment_ids];
    updated[index][field] = value;
    setFormData({ ...formData, equipment_ids: updated });
  };

  const addInput = () => {
    setFormData({
      ...formData,
      input_ids: [...formData.input_ids, { id: 0, quantity: 1 }]
    });
  };

  const removeInput = (index: number) => {
    setFormData({
      ...formData,
      input_ids: formData.input_ids.filter((_, i) => i !== index)
    });
  };

  const updateInput = (index: number, field: 'id' | 'quantity', value: number) => {
    const updated = [...formData.input_ids];
    updated[index][field] = value;
    setFormData({ ...formData, input_ids: updated });
  };

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  const operationTypes = [
    'Planting', 'Sowing', 'Transplanting',
    'Fertilizing', 'Organic Fertilizing', 'Composting',
    'Irrigation', 'Watering', 'Drip Irrigation',
    'Pest Control', 'Disease Treatment', 'Weed Control',
    'Pruning', 'Trimming', 'Thinning',
    'Harvesting', 'Picking', 'Collection',
    'Soil Preparation', 'Plowing', 'Tilling', 'Cultivation',
    'Equipment Maintenance', 'Tool Cleaning', 'Machinery Repair',
    'Monitoring', 'Inspection', 'Quality Control'
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
          <p className="text-gray-600 mt-1">Manage your farm operations</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Operation</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-rose-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date Range</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Resources</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {operations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-2 rounded-lg">
                        <Settings className="h-5 w-5 text-rose-600" />
                      </div>
                      <span className="font-medium text-gray-900">{operation.operation_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      <div>Start: {new Date(operation.start_date).toLocaleDateString()}</div>
                      <div>End: {new Date(operation.end_date).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      {operation.parcels && operation.parcels.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">{operation.parcels.length} parcel(s):</span>
                          <span>{operation.parcels.map(p => p.name).join(', ')}</span>
                        </div>
                      )}
                      {operation.personnel && operation.personnel.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-green-500" />
                          <span className="font-medium">{operation.personnel.length} personnel:</span>
                          <span>{operation.personnel.map(p => `${p.name} (${p.PersonnelWork.daily_hours}h)`).join(', ')}</span>
                        </div>
                      )}
                      {operation.equipment && operation.equipment.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Wrench className="h-3 w-3 text-orange-500" />
                          <span className="font-medium">{operation.equipment.length} equipment:</span>
                          <span>{operation.equipment.map(e => `${e.name} (${e.EquipmentUsage.total_hours}h)`).join(', ')}</span>
                        </div>
                      )}
                      {operation.inputs && operation.inputs.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 text-purple-500" />
                          <span className="font-medium">{operation.inputs.length} inputs:</span>
                          <span>{operation.inputs.map(i => `${i.name} (${i.OperationInputUsage.quantity} ${i.unit})`).join(', ')}</span>
                        </div>
                      )}
                      {(!operation.parcels || operation.parcels.length === 0) && 
                       (!operation.personnel || operation.personnel.length === 0) && 
                       (!operation.equipment || operation.equipment.length === 0) && 
                       (!operation.inputs || operation.inputs.length === 0) && (
                        <span className="text-gray-400 italic">No resources assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{operation.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(operation)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(operation)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {operations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No operations yet. Add your first operation to get started.
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOperation ? 'Edit Operation' : 'Create Operation'}
              </h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Operation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation Type *
                </label>
                <select
                  value={formData.operation_type}
                  onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select operation type</option>
                  {operationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Parcels */}
              <ParcelSelector
                parcels={parcels}
                selectedParcels={formData.parcel_ids}
                onSelectionChange={(selectedIds) => setFormData({ ...formData, parcel_ids: selectedIds })}
                placeholder="Select parcels for this operation..."
                multiple={true}
              />

              {/* Personnel */}
              <PersonnelSelector
                personnel={personnel}
                selectedPersonnel={formData.personnel_ids}
                onSelectionChange={(selected) => setFormData({ ...formData, personnel_ids: selected })}
                onHoursChange={updatePersonnel}
                onRemove={removePersonnel}
              />

              {/* Equipment */}
              <EquipmentSelector
                equipment={equipment}
                selectedEquipment={formData.equipment_ids}
                onSelectionChange={(selected) => setFormData({ ...formData, equipment_ids: selected })}
                onHoursChange={updateEquipment}
                onRemove={removeEquipment}
              />

              {/* Inputs */}
              <InputSelector
                inputs={inputs}
                selectedInputs={formData.input_ids}
                onSelectionChange={(selected) => setFormData({ ...formData, input_ids: selected })}
                onQuantityChange={updateInput}
                onRemove={removeInput}
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Optional notes about this operation..."
                />
              </div>

              {/* Form Actions */}
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
                  {actionLoading ? 'Saving...' : (editingOperation ? 'Update Operation' : 'Create Operation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the operation "{deletingOperation.operation_type}"? 
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
                {actionLoading ? 'Deleting...' : 'Delete Operation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
