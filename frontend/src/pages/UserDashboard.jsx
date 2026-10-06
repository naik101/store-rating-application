import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/client';
import StarRating from '../components/StarRating';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store,
  MapPin,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [submittingStoreId, setSubmittingStoreId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores', {
        params: { search, sortBy, order },
      });
      setStores(res.data.data.stores);
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, order]);

  const handleRatingSubmit = async (storeId, newRating) => {
    setSubmittingStoreId(storeId);
    try {
      const res = await api.post('/ratings', {
        storeId,
        rating: newRating,
      });

      const { rating, overallRating, totalRatings } = res.data.data;

      // Update state locally for instant snappy feedback
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === storeId) {
            return {
              ...s,
              userRating: rating,
              overallRating,
              totalRatings,
            };
          }
          return s;
        })
      );

      setToastType('success');
      setToastMessage(
        res.data.message || `Successfully recorded your ${newRating}-star rating!`
      );
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Failed to submit rating.');
      setTimeout(() => setToastMessage(''), 3500);
    } finally {
      setSubmittingStoreId(null);
    }
  };

  const toggleSortOrder = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all animate-in slide-in-from-bottom duration-200 ${
              toastType === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-red-600 text-white shadow-red-200'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 mb-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Community Store Ratings
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Browse Stores & Share Your Feedback
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Explore stores, check overall customer ratings, and submit or modify your personal 1–5 star ratings anytime.
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="name">Store Name</option>
              <option value="rating">Overall Rating</option>
              <option value="address">Address</option>
            </select>

            <button
              onClick={toggleSortOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition"
              title={`Sorting: ${order === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {order === 'asc' ? (
                <>
                  <ArrowUp className="w-4 h-4 text-indigo-600" />
                  <span>Ascending</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-indigo-600" />
                  <span>Descending</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            No stores found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Store Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        ★ {store.overallRating > 0 ? store.overallRating.toFixed(1) : '0.0'}
                      </div>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {store.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{store.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{store.email}</span>
                    </p>
                  </div>
                </div>

                {/* Rating Action Section */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {store.userRating ? 'Your Submitted Rating:' : 'Rate this Store:'}
                    </span>
                    {store.userRating && (
                      <span className="text-[11px] text-indigo-600 font-medium">
                        (Click star to modify)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <StarRating
                      rating={store.userRating || 0}
                      interactive={true}
                      size="lg"
                      onRatingChange={(newVal) => handleRatingSubmit(store.id, newVal)}
                    />

                    {submittingStoreId === store.id ? (
                      <span className="text-xs text-indigo-600 font-medium animate-pulse">
                        Saving...
                      </span>
                    ) : store.userRating ? (
                      <span className="text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-md border border-slate-200">
                        {store.userRating} / 5
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not rated</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
