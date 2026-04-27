import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Camera } from 'lucide-react';
import axios from 'axios';

const PostItem = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    location: '',
    date: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const categories = [
    'Electronics',
    'Jewelry',
    'Documents',
    'Clothing',
    'Accessories',
    'Books',
    'Keys',
    'Wallet',
    'Phone',
    'Other'
  ];

  useEffect(() => {
    if (editId) {
      fetchItem();
      setIsEditing(true);
    }
  }, [editId]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${editId}`);
      const item = response.data;
      
      if (item.owner._id !== user.id) {
        navigate('/my-items');
        return;
      }

      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        location: item.location,
        date: new Date(item.date).toISOString().split('T')[0],
        image: null
      });

      if (item.image) {
        setPreviewImage(`http://localhost:5000${item.image}`);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      navigate('/my-items');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('date', formData.date);
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (isEditing) {
        await axios.put(`/api/items/${editId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/items', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/my-items');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Item' : 'Post New Item'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update your item details' : 'Help others find their lost items or report what you found'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                placeholder="e.g., Lost iPhone 13, Found wallet"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="4"
                className="input-field resize-none"
                placeholder="Provide detailed description including color, brand, distinguishing features..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  required
                  className="input-field"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Date</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                className="input-field"
                placeholder="e.g., Central Park, NYC - Near the fountain"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                name="date"
                required
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image (Optional)</h3>
          
          <div className="space-y-4">
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload an image of the item</p>
                <label className="btn-secondary cursor-pointer">
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Posting...'}
              </div>
            ) : (
              isEditing ? 'Update Item' : 'Post Item'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-items')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostItem;
