import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, FileText, CheckCircle2, Clock, Trash2, Check, X, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function MyPostsPage() {
  const [activeTab, setActiveTab] = useState('found'); // 'found' | 'missing' | 'claims'
  const [foundItems, setFoundItems] = useState([]);
  const [missingRequests, setMissingRequests] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [foundRes, missingRes, claimsRes] = await Promise.all([
        api.get('/found-items/my'),
        api.get('/missing/my'),
        api.get('/claims/finder-requests')
      ]);

      setFoundItems(foundRes.data || []);
      setMissingRequests(missingRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (err) {
      console.error('Error fetching my posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteFound = async (id) => {
    if (!window.confirm('Are you sure you want to delete this found item post?')) return;
    try {
      await api.delete(`/found-items/${id}`);
      showToast('Found item deleted.', 'success');
      fetchData();
    } catch (err) {
      showToast('Could not delete item.', 'error');
    }
  };

  const handleDeleteMissing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this missing request?')) return;
    try {
      await api.delete(`/missing/${id}`);
      showToast('Missing request removed.', 'success');
      fetchData();
    } catch (err) {
      showToast('Could not delete request.', 'error');
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await api.post(`/claims/${claimId}/approve`);
      showToast('Claim approved! Chat is now unlocked for claimant.', 'success');
      fetchData();
    } catch (err) {
      showToast('Could not approve claim.', 'error');
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      await api.post(`/claims/${claimId}/reject`);
      showToast('Claim rejected.', 'info');
      fetchData();
    } catch (err) {
      showToast('Could not reject claim.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Posts & Activity</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your posted found items, missing requests, and incoming claim reviews.</p>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveTab('found')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'found'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Found Items ({foundItems.length})
          </button>

          <button
            onClick={() => setActiveTab('missing')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'missing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Missing Requests ({missingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'claims'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Claim Requests ({claims.length})
          </button>
        </div>

        {/* Tab 1: Found Items */}
        {activeTab === 'found' && (
          <div className="space-y-4">
            {foundItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200">
                You haven't posted any found items yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foundItems.map((item) => (
                  <div key={item._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img src={item.imageUrl} alt={item.itemName} className="w-14 h-14 rounded-xl object-cover border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.itemName}</h4>
                        <p className="text-xs text-gray-500">{item.category} • {item.locationFound}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/items/${item._id}`} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                        View
                      </Link>
                      <button onClick={() => handleDeleteFound(item._id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Missing Requests */}
        {activeTab === 'missing' && (
          <div className="space-y-4">
            {missingRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200">
                You haven't created any missing requests yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missingRequests.map((req) => (
                  <div key={req._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{req.itemName}</h4>
                      <p className="text-xs text-gray-500">{req.category} • Lost near {req.lastKnownLocation}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                        {req.status}
                      </span>
                    </div>

                    <button onClick={() => handleDeleteMissing(req._id)} className="p-1.5 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Claim Requests */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200">
                No claim requests pending review for your found items.
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim._id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600">Claimant: {claim.claimantId?.name}</span>
                        <span className="text-[10px] text-gray-400">({claim.claimantId?.email})</span>
                      </div>
                      <h4 className="text-base font-extrabold text-gray-900">
                        Item: {claim.foundItemId?.itemName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Verification Match Score: <strong className="text-indigo-600">{claim.verificationScore}%</strong> • Status: <strong>{claim.status}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {claim.status === 'VERIFIED' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Claim Approved
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveClaim(claim._id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Approve Claim
                          </button>
                          <button
                            onClick={() => handleRejectClaim(claim._id)}
                            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
