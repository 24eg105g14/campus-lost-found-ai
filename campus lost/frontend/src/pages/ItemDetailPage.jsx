import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, Clock, Lock, MessageSquare, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerificationModal from '../components/VerificationModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [claimState, setClaimState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItemAndClaim = async () => {
    try {
      const itemRes = await api.get(`/found-items/${id}`);
      setItem(itemRes.data);

      if (isAuthenticated) {
        try {
          const claimRes = await api.get(`/claims/item/${id}`);
          setClaimState(claimRes.data);
        } catch (e) {
          // Ignore claim check error if not claimed
        }
      }
    } catch (err) {
      showToast('Could not load item details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemAndClaim();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Item Not Found</h2>
          <Link to="/search" className="mt-4 text-xs font-bold text-blue-600">Back to Search</Link>
        </div>
      </div>
    );
  }

  const isOwnerOfPost = user && item.postedBy && (item.postedBy._id === user._id || item.postedBy === user._id);
  const isDelivered = item.status === 'DELIVERED';
  const isVerified = claimState?.status === 'VERIFIED';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Items
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Left Column */}
          <div className="bg-gray-100 relative aspect-square md:aspect-auto">
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute top-4 left-4">
              {isDelivered ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> REUNITED
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> PENDING
                </span>
              )}
            </div>
          </div>

          {/* Details Right Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
                  {item.category}
                </span>
                {item.brand && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs">
                    {item.brand}
                  </span>
                )}
                {item.color && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs">
                    Color: {item.color}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                {item.itemName}
              </h1>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {item.description}
              </p>

              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Found at: <strong>{item.locationFound}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Found on: <strong>{new Date(item.dateFound).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Reported by: <strong>{item.finderName || 'Anurag Student'}</strong> ({item.finderDept || 'Engineering Student'})</span>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="pt-6 border-t border-gray-100">
              {isDelivered ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ✓ This item has already been reunited with its owner.
                  </span>
                </div>
              ) : isVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                  <span className="text-xs font-bold text-emerald-900 block">
                    ✓ Ownership Verified (Score: {claimState.score}%)
                  </span>
                  <button
                    onClick={() => navigate(`/messages`)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Finder in Private Chat
                  </button>
                </div>
              ) : isOwnerOfPost ? (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-xs font-bold text-blue-900">
                    You posted this found item. View claims in My Posts.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Chat Lock Alert */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-600 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>🔒 CHAT LOCKED. Private chat unlocks after ownership verification.</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                    Request to Claim & Verify Ownership
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Verification Modal */}
      <VerificationModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerificationSuccess={() => fetchItemAndClaim()}
      />

      <Footer />
    </div>
  );
}
