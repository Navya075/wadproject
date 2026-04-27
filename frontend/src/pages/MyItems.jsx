import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Search, 
  CheckCircle, 
  Eye, 
  Edit, 
  Trash2, 
  MessageCircle,
  Filter
} from 'lucide-react';
import axios from 'axios';

const MyItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, filter]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/items/user/${user.id}`);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (filter.type) {
      filtered = filtered.filter(item => item.type === filter.type);
    }

    if (filter.status) {
      filtered = filtered.filter(item => item.status === filter.status);
    }

    if (filter.category) {
      filtered = filtered.filter(item => item.category === filter.category);
    }

    setFilteredItems(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      type: '',
      status: '',
      category: ''
    });
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/api/items/${itemId}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Items</h1>
          <p className="text-gray-600">Manage your lost and found items</p>
        </div>
        <Link to="/post-item" className="btn-primary">
          Post New Item
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="input-field"
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="input-field"
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Documents">Documents</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Books">Books</option>
              <option value="Keys">Keys</option>
              <option value="Wallet">Wallet</option>
              <option value="Phone">Phone</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {items.length === 0 ? 'No items posted yet' : 'No items match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {items.length === 0 
              ? 'Start by posting your first lost or found item'
              : 'Try adjusting your filters to see more items'
            }
          </p>
          {items.length === 0 && (
            <Link to="/post-item" className="btn-primary">
              Post Your First Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="card hover:shadow-md transition-shadow">
              <div className="relative">
                {item.image ? (
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{item.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{item.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Claims:</span>
                    <span className="ml-2">{item.claims?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link
                      to={`/item/${item._id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/post-item?edit=${item._id}`}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {item.claims?.length > 0 && (
                    <Link
                      to={`/item/${item._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      View Claims
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

export default MyItems;
