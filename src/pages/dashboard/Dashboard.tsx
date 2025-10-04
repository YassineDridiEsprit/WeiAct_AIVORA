import { useEffect, useState } from 'react';
import { MapPin, Settings, Wrench, AlertTriangle, Calendar, Users, Package, TrendingUp } from 'lucide-react';
import { farmAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface FarmStats {
  totalParcels: number;
  activeOperations: number;
  equipmentAvailable: number;
  lowStockItems: number;
}

interface Parcel {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  area_hectares: number;
  crop_type: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FarmStats>({
    totalParcels: 0,
    activeOperations: 0,
    equipmentAvailable: 0,
    lowStockItems: 0,
  });
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [parcelsResult, operationsResult, equipmentResult, inputsResult] = await Promise.all([
        farmAPI.getParcels(),
        farmAPI.getOperations(),
        farmAPI.getEquipment(),
        farmAPI.getInputs(),
      ]);

      const now = new Date();
      const activeOperations = operationsResult.data.filter((op: any) => {
        const start = new Date(op.start_date);
        const end = new Date(op.end_date);
        return start <= now && end >= now;
      });

      const lowStock = inputsResult.data.filter(
        (input: any) => input.current_stock <= input.minimum_stock_alert
      );

      setStats({
        totalParcels: parcelsResult.data.length,
        activeOperations: activeOperations.length,
        equipmentAvailable: equipmentResult.data.length,
        lowStockItems: lowStock.length,
      });

      setParcels(parcelsResult.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Parcels',
      value: stats.totalParcels,
      icon: MapPin,
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Active Operations',
      value: stats.activeOperations,
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Equipment Available',
      value: stats.equipmentAvailable,
      icon: Wrench,
      color: 'from-rose-600 to-rose-700',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: stats.lowStockItems > 0 ? 'from-orange-500 to-red-500' : 'from-green-500 to-green-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-rose-100 bg-clip-text text-transparent">
                Farm Overview
              </h1>
              <p className="text-rose-100 text-xl font-medium">Welcome back, {user?.first_name || 'Farmer'}! Here's your farm dashboard</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-rose-300 group cursor-pointer transform hover:-translate-y-1"
          >
            <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Farm Map & Parcels */}
      <div className="bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Parcel Locations</h2>
              <p className="text-rose-100 font-medium">Interactive map view of your farm parcels</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Map Visualization */}
          <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl h-[28rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20"></div>
            
            {parcels.length > 0 ? (
              <div className="relative h-full flex items-center justify-center">
                {/* Map Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* Parcels Visualization */}
                <div className="relative z-10 w-full h-full p-8">
                  <div className="flex flex-wrap gap-6 justify-center items-center h-full">
                    {parcels.map((parcel, index) => {
                      const positions = [
                        { x: 10, y: 15 }, { x: 60, y: 25 }, { x: 20, y: 60 },
                        { x: 70, y: 70 }, { x: 40, y: 40 }, { x: 80, y: 45 }
                      ];
                      const position = positions[index % positions.length];
                      
                      return (
                        <div
                          key={parcel.id}
                          className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/60 hover:bg-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative"
                          style={{
                            position: 'absolute',
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            transform: 'translate(-50%, -50%)',
                            minWidth: '200px'
                          }}
                        >
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-rose-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-purple-600 group-hover:bg-clip-text transition-all mb-1">
                                {parcel.name}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700 font-medium">
                                  📐 {parcel.area_hectares} hectares
                                </p>
                                {parcel.crop_type && (
                                  <p className="text-sm text-purple-700 font-medium capitalize">
                                    🌱 {parcel.crop_type}
                                  </p>
                                )}
                                {parcel.latitude && parcel.longitude && (
                                  <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                                    📍 {typeof parcel.latitude === 'number' ? parcel.latitude.toFixed(3) : parseFloat(parcel.latitude).toFixed(3)},
                                    {typeof parcel.longitude === 'number' ? parcel.longitude.toFixed(3) : parseFloat(parcel.longitude).toFixed(3)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Map Legend */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/60">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-sm font-medium text-gray-800">
                      <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      <span>Active Parcel</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-gray-800">
                      <div className="w-3 h-3 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full"></div>
                      <span>Parcel Location</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200 font-semibold">
                    Total: {parcels.length} parcel{parcels.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Parcels Yet</h3>
                  <p className="text-white/80 max-w-md mx-auto mb-6 text-lg">
                    Add your first parcel to see it visualized on the interactive farm map
                  </p>
                  <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 font-medium">
                    Add First Parcel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Parcel List */}
          {parcels.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="h-5 w-5 text-rose-600" />
                <span>Parcel Details</span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-4 border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                          {parcel.name}
                        </h4>
                      </div>
                      <MapPin className="h-4 w-4 text-rose-500" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium text-gray-900">{parcel.area_hectares} hectares</span>
                      </div>
                      
                      {parcel.crop_type && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Crop:</span>
                          <span className="font-medium text-purple-700 capitalize">{parcel.crop_type}</span>
                        </div>
                      )}
                      
                      {parcel.latitude && parcel.longitude && (
                        <div className="pt-2 border-t border-rose-200">
                          <div className="text-xs text-gray-500 font-mono">
                            {typeof parcel.latitude === 'number' ? parcel.latitude.toFixed(4) : parseFloat(parcel.latitude).toFixed(4)}, 
                            {typeof parcel.longitude === 'number' ? parcel.longitude.toFixed(4) : parseFloat(parcel.longitude).toFixed(4)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
