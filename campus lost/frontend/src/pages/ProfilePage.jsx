import React from 'react';
import { User, Mail, ShieldCheck, Award, BookOpen, Layers, Hash } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg relative overflow-hidden space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{user?.name}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> {user?.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Anurag University Student
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Institutional Credentials</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Batch Year</span>
                <span className="text-lg font-black text-gray-900">20{user?.batchYear || '24'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Department Code</span>
                <span className="text-lg font-black text-gray-900">{user?.departmentCode || '112'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Section</span>
                <span className="text-lg font-black text-gray-900 uppercase">{user?.section || 'C'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Roll Number</span>
                <span className="text-lg font-black text-gray-900">{user?.rollNumber || '54'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
