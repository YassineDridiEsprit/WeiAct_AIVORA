import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Settings, Wrench, AlertTriangle, Package, TrendingUp, Plus } from 'lucide-react';
import { farmAPI } from '../lib/api';
import FarmMap from './FarmMap';

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  area_hectares: number;
  latitude?: number;
  longitude?: number;
  boundary?: {
    coordinates: number[][][];
  };
}

interface Operation {
  id: number;
  operation_type: string;
  start_date: string;
  end_date: string;
}

interface Input {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock_alert: number;
}

interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
}

interface Stats {
  totalParcels: number;
  activeOperations: number;
  lowStockItems: number;
  equipmentCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalParcels: 0,
    activeOperations: 0,
    lowStockItems: 0,
    equipmentCount: 0
  });
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parcelsRes, operationsRes, inputsRes, equipmentRes] = await Promise.all([
          farmAPI.getParcels(),
          farmAPI.getOperations(),
          farmAPI.getInputs(),
          farmAPI.getEquipment()
        ]);

        const now = new Date();
        const activeOperations = operationsRes.data.filter((op: Operation) => {
          const start = new Date(op.start_date);
          const end = new Date(op.end_date);
          return start <= now && end >= now;
        }).length;

        const lowStockItems = inputsRes.data.filter((input: Input) =>
          input.current_stock < input.minimum_stock_alert
        ).length;

        setStats({
          totalParcels: parcelsRes.data.length,
          activeOperations,
          lowStockItems,
          equipmentCount: equipmentRes.data.length
        });

        setParcels(parcelsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Dashboard error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Parcels', 
      value: stats.totalParcels, 
      icon: MapPin,
      color: 'from-rose-500 to-pink-500' 
    },
    { 
      title: 'Active Operations', 
      value: stats.activeOperations, 
      icon: Settings,
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      title: 'Equipment Available', 
      value: stats.equipmentCount, 
      icon: Wrench,
      color: 'from-rose-600 to-rose-700' 
    },
    { 
      title: 'Low Stock Items', 
      value: stats.lowStockItems, 
      icon: AlertTriangle,
      color: stats.lowStockItems > 0 ? 'from-orange-500 to-red-500' : 'from-green-500 to-green-600' 
    },
  ];

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
              <p className="text-rose-100 text-xl font-medium">Welcome back! Here's your farm dashboard</p>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-rose-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-rose-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/dashboard/parcels"
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <MapPin className="h-5 w-5" />
            <span>Add New Parcel</span>
          </Link>
          <Link
            to="/dashboard/operations"
            className="bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Plan Operation</span>
          </Link>
          <Link
            to="/dashboard/inventory/inputs"
            className="bg-gradient-to-r from-rose-600 to-purple-500 hover:from-rose-700 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Manage Inventory</span>
          </Link>
        </div>
      </div>

      {/* Parcel Map & Visualization */}
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
          {/* Real Interactive Map */}
          <div className="h-[28rem] rounded-xl overflow-hidden shadow-2xl border-2 border-rose-200">
            {parcels.length > 0 ? (
              <FarmMap parcels={parcels} />
            ) : (
              <div className="h-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Parcels Yet</h3>
                  <p className="text-white/80 max-w-md mx-auto mb-6 text-lg">
                    Add your first parcel to see it on the interactive map
                  </p>
                  <Link 
                    to="/dashboard/parcels"
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 font-medium inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add First Parcel</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Parcel Details List */}
          {parcels.length > 0 && (
            <div>
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
                      
                      {parcel.culture && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Culture:</span>
                          <span className="font-medium text-purple-700 capitalize">{parcel.culture}</span>
                        </div>
                      )}
                      
                      {parcel.soil_type && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Soil:</span>
                          <span className="font-medium text-gray-700 capitalize">{parcel.soil_type}</span>
                        </div>
                      )}
                      
                      {parcel.latitude && parcel.longitude && (
                        <div className="pt-2 border-t border-rose-200">
                          <div className="text-xs text-gray-500 font-mono">
                            {typeof parcel.latitude === 'number' ? parcel.latitude.toFixed(4) : parseFloat(parcel.latitude).toFixed(4)}, {typeof parcel.longitude === 'number' ? parcel.longitude.toFixed(4) : parseFloat(parcel.longitude).toFixed(4)}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl border border-rose-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-rose-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-6 text-center">
          <div className="text-gray-600">
            <p className="text-lg font-medium">No recent activity to display.</p>
            <p className="text-sm mt-2">Start by adding parcels and planning operations to see activity here.</p>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Link 
              to="/dashboard/parcels"
              className="text-rose-600 hover:text-rose-700 font-medium text-sm underline"
            >
              Add Parcels
            </Link>
            <Link 
              to="/dashboard/operations"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
            >
              Plan Operations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
