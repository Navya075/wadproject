import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, User, Phone, Mail, MessageCircle, Send, Heart, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!claimMessage.trim()) {
      setError('Please provide a claim message');
      return;
    }

    setSubmittingClaim(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`/api/claims/${id}`, {
        message: claimMessage
      });
      
      setItem(response.data);
      setSuccess('Your claim has been submitted successfully!');
      setClaimMessage('');
      setShowClaimForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleClaimResponse = async (claimId, status) => {
    try {
      const response = await axios.put(`/api/claims/${id}/${claimId}`, { status });
      setItem(response.data);
      setSuccess(`Claim ${status} successfully!`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update claim');
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) return;
    
    try {
      await axios.post(`/api/users/favorites/${id}`);
      fetchItem();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/api/items/${id}`);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const startChat = async () => {
    try {
      const response = await axios.post(`/api/messages/conversation/${id}`);
      navigate(`/messages/${response.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const viewChats = async () => {
    try {
      // Fetch conversations to find any related to this item
      const response = await axios.get('/api/messages/conversations');
      const itemConversations = response.data.filter(conv => conv.item._id === id);
      
      if (itemConversations.length > 0) {
        // Navigate to the first conversation for this item
        navigate(`/messages/${itemConversations[0]._id}`);
      } else {
        // Navigate to messages page with no conversation selected
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Item not found</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isOwner = user && item.owner._id === user.id;
  const hasClaimed = item.claims.some(claim => claim.user._id === user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {item.image ? (
              <img
                src={`http://localhost:5000${item.image}`}
                alt={item.title}
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 text-gray-500">📷</div>
                  </div>
                  <p className="text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.type === 'lost' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isAuthenticated && !isOwner && (
                  <button
                    onClick={toggleFavorite}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${
                      item.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`} />
                  </button>
                )}
                
                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/post-item?edit=${id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={deleteItem}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6">{item.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span>{item.owner.name}</span>
              </div>
              {item.owner.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{item.owner.phone}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span>{item.owner.email}</span>
              </div>
            </div>

            {!isOwner && isAuthenticated && item.status === 'active' && (
              <div className="flex gap-3">
                {!hasClaimed && (
                  <button
                    onClick={() => setShowClaimForm(!showClaimForm)}
                    className="flex-1 btn-primary"
                  >
                    Claim This Item
                  </button>
                )}
                <button
                  onClick={startChat}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Owner
                </button>
              </div>
            )}

            {isOwner && isAuthenticated && (
              <div className="flex gap-3">
                <button
                  onClick={viewChats}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Chats
                </button>
              </div>
            )}

            {hasClaimed && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                You have already claimed this item. Status: {item.claims.find(c => c.user._id === user.id)?.status}
              </div>
            )}
          </div>
        </div>
      </div>

      {showClaimForm && (
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim This Item</h3>
          <textarea
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            placeholder="Describe why you believe this item belongs to you..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            rows="4"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleClaim}
              disabled={submittingClaim}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingClaim ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button
              onClick={() => setShowClaimForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isOwner && item.claims.length > 0 && (
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims ({item.claims.length})</h3>
          <div className="space-y-4">
            {item.claims.map((claim) => (
              <div key={claim._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{claim.user.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{claim.user.email}</p>
                    <p className="text-gray-700 mt-2">{claim.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      claim.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
                
                {claim.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleClaimResponse(claim._id, 'accepted')}
                      className="btn-primary text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleClaimResponse(claim._id, 'rejected')}
                      className="btn-secondary text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
