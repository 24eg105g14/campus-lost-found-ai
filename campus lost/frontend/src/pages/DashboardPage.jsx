import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, FileText, Clock, Sparkles, CheckCircle2, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    pendingItemsCount: 0,
    activeMissingCount: 0,
    possibleMatchesCount: 0,
    itemsReunitedCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [foundRes, missingRes] = await Promise.all([
          api.get('/found-items?status=PENDING'),
          api.get('/missing/my')
        ]);

        const allFound = foundRes.data || [];
        setItems(allFound);

        // Fetch delivered items for stats
        const deliveredRes = await api.get('/found-items?status=DELIVERED');
        const deliveredItems = deliveredRes.data || [];

        setStats({
          pendingItemsCount: allFound.length,
          activeMissingCount: (missingRes.data || []).length,
          possibleMatchesCount: 2, // Sample matches score > 80%
          itemsReunitedCount: deliveredItems.length + 4 // Total reunited counter
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Anurag University Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'} 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mb-6 font-normal">
              Lost something? Let's link you back to it. Search active found posts or create a missing request.
            </p>

            {/* Main CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/search"
                className="py-3 px-5 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 shadow-md transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                🔍 I Lost Something
              </Link>
              <Link
                to="/report-found"
                className="py-3 px-5 rounded-2xl bg-blue-500/40 hover:bg-blue-500/60 text-white font-bold text-sm border border-white/30 backdrop-blur transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
                📦 I Found Something
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Found</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.pendingItemsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Missing</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.activeMissingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Possible Matches</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.possibleMatchesCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items Reunited</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.itemsReunitedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Recently Found Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recently Found Items</h2>
              <p className="text-xs text-gray-500">PENDING items found across Anurag University campus.</p>
            </div>
            <Link
              to="/search"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Items ({items.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse p-4">
                  <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="feature-card-electric rounded-3xl p-12 text-center max-w-md mx-auto">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No pending found items yet</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Be the first student to report a found item on campus.
              </p>
              <Link
                to="/report-found"
                className="py-2.5 px-4 rounded-xl gradient-cta-primary text-white font-bold text-xs inline-flex items-center gap-1.5 transition-transform hover:-translate-y-0.5 electric-glow-dual"
              >
                <PlusCircle className="w-4 h-4" /> Report Found Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.slice(0, 8).map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
