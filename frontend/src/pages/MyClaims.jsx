import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User
} from 'lucide-react';
import axios from 'axios';

const MyClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    type: ''
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, filter]);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(`/api/claims/user/${user.id}`);
      setClaims(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = claims;

    if (filter.status) {
      filtered = filtered.filter(claim => claim.status === filter.status);
    }

    if (filter.type) {
      filtered = filtered.filter(claim => claim.item.type === filter.type);
    }

    setFilteredClaims(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      type: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
        <p className="text-gray-600">Track the status of your item claims</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filter Claims</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="input-field"
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
            <select
              className="input-field"
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {claims.length === 0 ? 'No claims yet' : 'No claims match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {claims.length === 0 
              ? 'Start by claiming items you believe belong to you'
              : 'Try adjusting your filters to see more claims'
            }
          </p>
          {claims.length === 0 && (
            <Link to="/" className="btn-primary">
              Browse Items
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClaims.map((claim) => (
            <div key={claim._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {claim.item.image ? (
                      <img
                        src={`http://localhost:5000${claim.item.image}`}
                        alt={claim.item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.item.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(claim.item.type)}`}>
                          {claim.item.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-1">{claim.status}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{claim.item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Owner: {claim.item.owner.name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Claimed: {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Claim Message:</p>
                        <p className="text-gray-600">{claim.message}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    to={`/item/${claim.item._id}`}
                    className="btn-primary flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Item
                  </Link>
                  
                  {claim.status === 'accepted' && (
                    <Link
                      to={`/chat/${claim.item._id}`}
                      className="btn-secondary flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Owner
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
