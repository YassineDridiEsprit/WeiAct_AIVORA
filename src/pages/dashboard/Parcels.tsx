import { useEffect, useState } from 'react';
import { Plus, MapPin, Edit, Trash2, X, Map, BarChart3, Layers, Ruler, TreePine } from 'lucide-react';
import { farmAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ParcelForm from '../../components/ParcelForm';
import FarmMap from '../../components/FarmMap';

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  boundary?: {
    coordinates: number[][][];
  };
  area_hectares?: number;
  perimeter_km?: number;
}

export default function Parcels() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [deletingParcel, setDeletingParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (user) {
      loadParcels();
    }
  }, [user]);

  const loadParcels = async () => {
    try {
      const response = await farmAPI.getParcels();
      setParcels(response.data);
    } catch (error) {
      console.error('Error loading parcels:', error);
      setError('Failed to load parcels. Please try again.');
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

  const openCreateForm = () => {
    console.log('Opening create form');
    setEditingParcel(null);
    setShowForm(true);
  };

  const openEditForm = (parcel: Parcel) => {
    console.log('Opening edit form for parcel:', parcel.name);
    setEditingParcel(parcel);
    setShowForm(true);
  };

  const openDeleteModal = (parcel: Parcel) => {
    console.log('Opening delete modal for parcel:', parcel.name);
    setDeletingParcel(parcel);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowForm(false);
    setShowDeleteModal(false);
    setEditingParcel(null);
    setDeletingParcel(null);
  };

  const handleParcelCreated = (parcel: Parcel) => {
    setSuccess(`Parcel "${parcel.name}" ${editingParcel ? 'updated' : 'created'} successfully!`);
    closeModals(); // Close the form modal after successful creation/update
    loadParcels();
  };

  const handleDelete = async () => {
    if (!deletingParcel) return;
    
    setActionLoading(true);
    setError(null);

    try {
      await farmAPI.deleteParcel(deletingParcel.id);
      setSuccess(`Parcel "${deletingParcel.name}" deleted successfully!`);
      closeModals();
      await loadParcels();
    } catch (error: any) {
      console.error('Error deleting parcel:', error);
      setError(error.response?.data?.error || 'Failed to delete parcel. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getCultureDisplay = (culture: string) => {
    const cultureMap: Record<string, string> = {
      'NONE': 'No Crop',
      'ORANGE': 'Orange',
      'POTATO': 'Potato', 
      'TOMATO': 'Tomato',
      'LEMON': 'Lemon',
      'OLIVE': 'Olive',
      'PEACH': 'Peach',
      'WHEAT': 'Wheat',
      'BARLEY': 'Barley'
    };
    return cultureMap[culture] || culture;
  };

  const getSoilDisplay = (soilType: string) => {
    const soilMap: Record<string, string> = {
      'clay': 'Clay',
      'silt': 'Silt',
      'sand': 'Sand',
      'loam': 'Loam'
    };
    return soilMap[soilType] || soilType;
  };

  // Calculate stats
  const totalArea = parcels.reduce((sum, parcel) => sum + (parcel.area_hectares || 0), 0);
  const totalPerimeter = parcels.reduce((sum, parcel) => sum + (parcel.perimeter_km || 0), 0);
  const culturesCount = new Set(parcels.map(p => p.culture)).size;
  const soilTypesCount = new Set(parcels.map(p => p.soil_type)).size;

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Parcels</h1>
          <p className="text-gray-600 mt-1">Manage your agricultural land boundaries and cultivation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMapView(!showMapView)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              showMapView 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>{showMapView ? 'Hide Map' : 'Show Map'}</span>
          </button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md transition-all flex items-center space-x-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-all flex items-center space-x-1 ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
          
          <button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Parcel</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {parcels.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Ruler className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Total Area</p>
                <p className="text-2xl font-bold text-green-900">{totalArea.toFixed(1)} ha</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Parcels</p>
                <p className="text-2xl font-bold text-blue-900">{parcels.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TreePine className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Crop Types</p>
                <p className="text-2xl font-bold text-amber-900">{culturesCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Soil Types</p>
                <p className="text-2xl font-bold text-purple-900">{soilTypesCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {showMapView && parcels.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Map className="h-5 w-5 text-gray-600" />
              <span>Farm Map Overview</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">Interactive view of all your parcels</p>
          </div>
          <div className="h-96">
            <FarmMap parcels={parcels} />
          </div>
        </div>
      )}

      {/* Parcels Display */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel) => (
            <div key={parcel.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group border hover:border-rose-200">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-3 rounded-xl group-hover:scale-105 transition-transform">
                  <MapPin className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(parcel)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit parcel"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(parcel)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete parcel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">{parcel.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-2">
                    <TreePine className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Culture</span>
                  </div>
                  <span className="text-sm font-semibold text-green-900">{getCultureDisplay(parcel.culture)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {parcel.area_hectares && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <Ruler className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Area</span>
                      </div>
                      <span className="text-lg font-bold text-blue-900">{parcel.area_hectares.toFixed(2)} ha</span>
                    </div>
                  )}
                  
                  {parcel.perimeter_km && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Perimeter</span>
                      </div>
                      <span className="text-lg font-bold text-purple-900">{parcel.perimeter_km.toFixed(2)} km</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Soil Type</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-900">{getSoilDisplay(parcel.soil_type)}</span>
                </div>
                
                {parcel.latitude && parcel.longitude && (
                  <div className="p-2 bg-gray-50 rounded-lg border">
                    <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Coordinates</span>
                    </div>
                    <span className="text-xs font-mono text-gray-700">{parcel.latitude.toFixed(6)}, {parcel.longitude.toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-rose-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parcel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Culture</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Area</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Soil Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{parcel.name}</div>
                          {parcel.perimeter_km && (
                            <div className="text-sm text-gray-500">{parcel.perimeter_km.toFixed(2)} km perimeter</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">{getCultureDisplay(parcel.culture)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {parcel.area_hectares && (
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-blue-600" />
                          <span className="text-lg font-bold text-blue-900">{parcel.area_hectares.toFixed(2)} ha</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-gray-900">{getSoilDisplay(parcel.soil_type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {parcel.latitude && parcel.longitude ? (
                        <div className="font-mono text-xs">
                          {parcel.latitude.toFixed(4)}, {parcel.longitude.toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditForm(parcel)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit parcel"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(parcel)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete parcel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {parcels.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200">
          <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-4 rounded-2xl inline-block mb-6">
            <MapPin className="h-12 w-12 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No parcels yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by adding your first agricultural parcel. Define boundaries, 
            set crop types, and manage your farm land efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Parcel</span>
            </button>
            <button
              onClick={() => setShowMapView(true)}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2"
            >
              <Map className="h-5 w-5" />
              <span>View Map</span>
            </button>
          </div>
        </div>
      )}

      {/* Parcel Form Modal */}
      <ParcelForm
        open={showForm}
        onClose={closeModals}
        onParcelCreated={handleParcelCreated}
        existingParcel={editingParcel}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingParcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Parcel</h2>
              </div>
              <button 
                onClick={closeModals} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete the parcel <span className="font-semibold text-gray-900">"{deletingParcel.name}"</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone and will permanently remove:
                </p>
                <ul className="text-sm text-red-600 mt-2 ml-4 list-disc space-y-1">
                  <li>All boundary and location data</li>
                  <li>Associated cultivation records</li>
                  <li>Historical operation data</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Parcel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
