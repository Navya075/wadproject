import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Search, 
  CheckCircle, 
  MessageCircle, 
  TrendingUp,
  Users,
  Eye,
  PlusCircle
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    claimsReceived: 0,
    acceptedClaims: 0,
    recoveryRate: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, itemsResponse, claimsResponse] = await Promise.all([
        axios.get('/api/users/dashboard'),
        axios.get(`/api/items/user/${user.id}`),
        axios.get(`/api/claims/user/${user.id}`)
      ]);

      setStats(statsResponse.data);
      setRecentItems(itemsResponse.data.slice(0, 5));
      setRecentClaims(claimsResponse.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Items Posted',
      value: stats.totalItems,
      icon: Package,
      color: 'bg-blue-500',
      description: 'All your lost and found items'
    },
    {
      title: 'Lost Items',
      value: stats.lostItems,
      icon: Search,
      color: 'bg-red-500',
      description: 'Items you have lost'
    },
    {
      title: 'Found Items',
      value: stats.foundItems,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Items you have found'
    },
    {
      title: 'Claims Received',
      value: stats.claimsReceived,
      icon: MessageCircle,
      color: 'bg-purple-500',
      description: 'Claims on your items'
    },
    {
      title: 'Accepted Claims',
      value: stats.acceptedClaims,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      description: 'Successfully resolved claims'
    },
    {
      title: 'Recovery Rate',
      value: `${stats.recoveryRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Items successfully recovered'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's an overview of your Lost & Found activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Items</h3>
            <Link
              to="/my-items"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {recentItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No items posted yet</p>
              <Link
                to="/post-item"
                className="btn-primary inline-flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Post Your First Item
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {item.type === 'lost' ? (
                        <Search className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' :
                      item.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                    <Link
                      to={`/item/${item._id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
            <Link
              to="/my-claims"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {recentClaims.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No claims yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div key={claim._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{claim.item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{claim.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      claim.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/post-item"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <PlusCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Post New Item</h4>
              <p className="text-sm text-gray-600">Report lost or found items</p>
            </div>
          </div>
        </Link>

        <Link
          to="/favorites"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Eye className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">View Favorites</h4>
              <p className="text-sm text-gray-600">Check your saved items</p>
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Browse Items</h4>
              <p className="text-sm text-gray-600">Find lost items or help others</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
