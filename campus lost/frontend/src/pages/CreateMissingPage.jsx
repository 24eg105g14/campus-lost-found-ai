import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Smartphone', 'Laptop', 'Smartwatch', 'Watch', 'Earphones',
  'ID Card', 'Wallet', 'Keys', 'Bag', 'Books', 'Documents', 'Accessories', 'Clothing', 'Other'
];

export default function CreateMissingPage() {
  const location = useLocation();
  const aiState = location.state?.aiSearchState || {};
  const [itemName, setItemName] = useState(aiState.itemName || aiState.category || '');
  const [category, setCategory] = useState(CATEGORIES.includes(aiState.category) ? aiState.category : 'Smartphone');
  const [brand, setBrand] = useState(aiState.brand || '');
  const [color, setColor] = useState(aiState.color || '');
  const [description, setDescription] = useState(aiState.description || location.state?.aiDescription || '');
  const [lastKnownLocation, setLastKnownLocation] = useState(aiState.location || '');
  const [approximateLostDate, setApproximateLostDate] = useState(/^\d{4}-\d{2}-\d{2}$/.test(aiState.date || '') ? aiState.date : new Date().toISOString().split('T')[0]);
  const [additionalPrivateDetails, setAdditionalPrivateDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/missing', {
        itemName,
        category,
        brand,
        color,
        description,
        lastKnownLocation,
        approximateLostDate,
        additionalPrivateDetails
      });

      const matchesCount = (res.data.matches || []).length;
      if (matchesCount > 0) {
        showToast(`Missing request created! Found ${matchesCount} possible match(es)!`, 'success');
      } else {
        showToast('Missing request created successfully! LostLink will keep searching.', 'success');
      }

      navigate('/my-posts');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating missing request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Lost Owner Workflow</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Create Missing Item Request</h1>
          <p className="text-sm text-gray-500 mt-1">
            LostLink will register your missing item request and continuously scan all current and future found posts.
          </p>
          {Object.keys(aiState).length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Sparkles className="w-4 h-4 text-rose-500" /> Pre-filled from your AI search — review and publish.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Black Noise Smartwatch"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Noise"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Color *
              </label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Last Known Location *
              </label>
              <input
                type="text"
                required
                value={lastKnownLocation}
                onChange={(e) => setLastKnownLocation(e.target.value)}
                placeholder="e.g. Central Library"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Approximate Lost Date *
              </label>
              <input
                type="date"
                required
                value={approximateLostDate}
                onChange={(e) => setApproximateLostDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where and how you lost the item."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Additional Private Details (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalPrivateDetails}
              onChange={(e) => setAdditionalPrivateDetails(e.target.value)}
              placeholder="Secret details like wallpaper name or back engravings (kept private)."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Publish Missing Item Request
              </>
            )}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
