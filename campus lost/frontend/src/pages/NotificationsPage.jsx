import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Sparkles, MessageSquare, AlertCircle, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      showToast('All notifications marked as read.', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Could not update notifications.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-gray-500 mt-1">Match alerts, claim updates, and message notifications.</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-gray-300" />
              <p className="font-bold text-gray-600">You're all caught up.</p>
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  notif.read ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {notif.type === 'POSSIBLE_MATCH' && <Sparkles className="w-5 h-5 text-blue-600" />}
                  {notif.type === 'NEW_MESSAGE' && <MessageSquare className="w-5 h-5 text-indigo-600" />}
                  {notif.type.includes('VERIFICATION') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 font-medium block mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
