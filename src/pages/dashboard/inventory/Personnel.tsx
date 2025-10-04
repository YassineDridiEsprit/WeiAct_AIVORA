import { useEffect, useState } from 'react';
import { Plus, Users, Edit, Trash2, X, Phone, Calendar, Briefcase } from 'lucide-react';
import { farmAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Person {
  id: number;
  name: string;
  role: string;
  hourly_rate: number;
  contact?: string;
  hire_date?: string;
  is_active?: boolean;
}

interface PersonForm {
  name: string;
  role: string;
  hourly_rate: number;
}

export default function Personnel() {
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PersonForm>({
    name: '',
    role: '',
    hourly_rate: 0
  });

  useEffect(() => {
    if (user) {
      loadPersonnel();
    }
  }, [user]);

  const loadPersonnel = async () => {
    try {
      const response = await farmAPI.getPersonnel();
      setPersonnel(response.data);
    } catch (error) {
      console.error('Error loading personnel:', error);
      setError('Failed to load personnel. Please try again.');
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
      role: '',
      hourly_rate: 0
    });
  };

  const openCreateModal = () => {
    setEditingPerson(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      role: person.role,
      hourly_rate: person.hourly_rate
    });
    setShowModal(true);
  };

  const openDeleteModal = (person: Person) => {
    setDeletingPerson(person);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setEditingPerson(null);
    setDeletingPerson(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingPerson) {
        await farmAPI.updatePersonnel(editingPerson.id, formData);
        setSuccess('Personnel updated successfully!');
      } else {
        await farmAPI.createPersonnel(formData);
        setSuccess('Personnel created successfully!');
      }

      closeModals();
      await loadPersonnel();
    } catch (error: any) {
      console.error('Error saving personnel:', error);
      setError(error.response?.data?.detail || 'Failed to save personnel. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPerson) return;
    
    setActionLoading(true);
    setError(null);

    try {
      await farmAPI.deletePersonnel(deletingPerson.id);
      setSuccess('Personnel deleted successfully!');
      closeModals();
      await loadPersonnel();
    } catch (error: any) {
      console.error('Error deleting personnel:', error);
      setError(error.response?.data?.detail || 'Failed to delete personnel. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const roleOptions = [
    { value: 'MANAGER', label: 'Manager' },
    { value: 'TECHNICIAN', label: 'Technician' },
    { value: 'WORKER', label: 'Worker' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'OTHER', label: 'Other' }
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
          <h1 className="text-3xl font-bold text-gray-900">Personnel</h1>
          <p className="text-gray-600 mt-1">Manage your farm workers</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Personnel</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personnel.map((person) => (
          <div key={person.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(person)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(person)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{person.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Role:</span>
                <span>{person.role}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Rate:</span>
                <span className="text-lg font-bold text-rose-600">{person.hourly_rate} DT/hr</span>
              </div>
              {person.contact && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{person.contact}</span>
                </div>
              )}
              {person.hire_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Hired: {new Date(person.hire_date).toLocaleDateString()}</span>
                </div>
              )}
              {person.is_active !== undefined && (
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  person.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {person.is_active ? 'Active' : 'Inactive'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {personnel.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          No personnel added yet. Click "Add Personnel" to get started.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPerson ? 'Edit Personnel' : 'Add Personnel'}
              </h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter person's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select role</option>
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (DT) *
                </label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
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
                  {actionLoading ? 'Saving...' : (editingPerson ? 'Update Personnel' : 'Add Personnel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingPerson.name}"? 
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
                {actionLoading ? 'Deleting...' : 'Delete Personnel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
