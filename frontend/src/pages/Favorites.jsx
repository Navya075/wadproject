import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Search, 
  Eye, 
  MapPin, 
  Calendar,
  User,
  Filter
} from 'lucide-react';
import axios from 'axios';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    category: '',
    location: ''
  });

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [favorites, filter]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/users/favorites');
      setFavorites(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    let filtered = favorites;

    if (filter.type) {
      filtered = filtered.filter(item => item.type === filter.type);
    }

    if (filter.category) {
      filtered = filtered.filter(item => item.category === filter.category);
    }

    if (filter.location) {
      filtered = filtered.filter(item =>
        item.location.toLowerCase().includes(filter.location.toLowerCase())
      );
    }

    setFilteredFavorites(filtered);
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
      category: '',
      location: ''
    });
  };

  const toggleFavorite = async (itemId) => {
    try {
      await axios.post(`/api/users/favorites/${itemId}`);
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Items you've saved for later</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="Filter by location..."
              className="input-field"
              value={filter.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {favorites.length === 0 ? 'No favorites yet' : 'No items match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {favorites.length === 0 
              ? 'Start browsing and save items that interest you'
              : 'Try adjusting your filters to see more items'
            }
          </p>
          {favorites.length === 0 && (
            <Link to="/" className="btn-primary">
              Browse Items
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item) => (
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
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleFavorite(item._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>
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
                    <MapPin className="w-4 h-4 mr-2" />
                    {item.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {item.owner.name}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <Link
                    to={`/item/${item._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
