import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/client';
import StarRating from '../components/StarRating';
import {
  Store,
  Star,
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  Calendar,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const OwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/owner/dashboard', {
        params: { search, sortBy, order },
      });
      const fetchedStores = res.data.data.stores;
      setStores(fetchedStores);
      if (fetchedStores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(fetchedStores[0].id);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, sortBy, order]);

  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
    return order === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Store Owner Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor your store's average ratings and inspect all customer feedback submissions
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading your store details...</div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-xs max-w-lg mx-auto">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Stores Assigned Yet</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your account has not yet been linked to an active store by the system administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Store selector if owner has multiple stores */}
            {stores.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  Select Store:
                </span>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStoreId(s.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
                      activeStore.id === s.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {/* Store Overview Card */}
            {activeStore && (
              <div className="bg-gradient-to-r from-white via-white to-amber-50/30 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-2">
                    <Store className="w-3.5 h-3.5" />
                    Managed Store
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {activeStore.name}
                  </h2>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{activeStore.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{activeStore.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-center pr-4 border-r border-slate-100">
                    <span className="block text-4xl font-black text-amber-500">
                      {activeStore.averageRating > 0 ? activeStore.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Average Rating</span>
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <StarRating rating={activeStore.averageRating} size="lg" />
                    <span className="text-xs font-semibold text-slate-600">
                      Based on {activeStore.totalRatings} customer rating{activeStore.totalRatings === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings Table Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search rating users by Name or Email..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <span className="text-xs text-slate-500">
                  Users who submitted ratings for this store ({activeStore?.ratings?.length || 0})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th
                        className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                        onClick={() => handleSort('userName')}
                      >
                        <div className="flex items-center gap-1.5">
                          Customer Name {getSortIcon('userName')}
                        </div>
                      </th>
                      <th className="px-6 py-3.5">Customer Email</th>
                      <th
                        className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                        onClick={() => handleSort('rating')}
                      >
                        <div className="flex items-center gap-1.5">
                          Submitted Rating {getSortIcon('rating')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1.5">
                          Submitted Date {getSortIcon('createdAt')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!activeStore || activeStore.ratings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                          No customer ratings submitted for this store yet.
                        </td>
                      </tr>
                    ) : (
                      activeStore.ratings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {r.userName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {r.userEmail}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StarRating rating={r.rating} size="sm" />
                              <span className="font-bold text-slate-800">
                                {r.rating} / 5
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
