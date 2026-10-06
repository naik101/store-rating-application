import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/client';
import StarRating from '../components/StarRating';
import AddStoreModal from '../components/AddStoreModal';
import AddUserModal from '../components/AddUserModal';
import UserDetailsModal from '../components/UserDetailsModal';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  RefreshCw,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users' | 'owners'
  const [loading, setLoading] = useState(true);

  // Stores State
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Store Owners Rating Info State
  const [ownerRatings, setOwnerRatings] = useState([]);

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/stores', {
        params: {
          search: storeSearch,
          sortBy: storeSortBy,
          order: storeSortOrder,
        },
      });
      setStores(res.data.data.stores);
    } catch (err) {
      console.error('Failed to load stores', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const params = {
        search: userSearch,
        sortBy: userSortBy,
        order: userSortOrder,
      };
      if (userRoleFilter !== 'ALL') {
        params.role = userRoleFilter;
      }
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  // Fetch Owner Ratings
  const fetchOwnerRatings = async () => {
    try {
      const res = await api.get('/admin/owner-ratings');
      setOwnerRatings(res.data.data.owners);
    } catch (err) {
      console.error('Failed to load owner ratings', err);
    }
  };

  const reloadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchStores(), fetchUsers(), fetchOwnerRatings()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const getSortIcon = (currentSort, field, order) => {
    if (currentSort !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
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
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage system users, stores, and oversee store ratings across the platform
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddStoreOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition"
            >
              <Plus className="w-4 h-4" />
              Add Store
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={reloadData}
              className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalUsers}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Stores
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalStores}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Ratings
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalRatings}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6 flex gap-6">
          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'stores'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            Stores ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('owners')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'owners'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Store Owner Ratings
          </button>
        </div>

        {/* TAB 1: STORES */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Search stores by Name, Email, Address..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <span className="text-xs text-slate-500">
                Click table headers to toggle Ascending / Descending sorting
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleStoreSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        Store Name {getSortIcon(storeSortBy, 'name', storeSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleStoreSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        Email {getSortIcon(storeSortBy, 'email', storeSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleStoreSort('address')}
                    >
                      <div className="flex items-center gap-1.5">
                        Address {getSortIcon(storeSortBy, 'address', storeSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleStoreSort('rating')}
                    >
                      <div className="flex items-center gap-1.5">
                        Overall Rating {getSortIcon(storeSortBy, 'rating', storeSortOrder)}
                      </div>
                    </th>
                    <th className="px-6 py-3.5">Store Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No stores found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {s.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {s.email}
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={s.address}>
                          {s.address}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StarRating rating={s.rating} size="sm" />
                            <span className="font-semibold text-slate-800">
                              {s.rating > 0 ? s.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({s.totalRatings} {s.totalRatings === 1 ? 'rating' : 'ratings'})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {s.owner ? (
                            <div className="text-xs">
                              <span className="font-medium text-slate-800 block">{s.owner.name}</span>
                              <span className="text-slate-400">{s.owner.email}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Search & Filters */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by Name, Email, Address..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>
              </div>

              <span className="text-xs text-slate-500">
                Click table headers to toggle Ascending / Descending sorting
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleUserSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        Name {getSortIcon(userSortBy, 'name', userSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleUserSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        Email {getSortIcon(userSortBy, 'email', userSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleUserSort('address')}
                    >
                      <div className="flex items-center gap-1.5">
                        Address {getSortIcon(userSortBy, 'address', userSortOrder)}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => handleUserSort('role')}
                    >
                      <div className="flex items-center gap-1.5">
                        Role {getSortIcon(userSortBy, 'role', userSortOrder)}
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={u.address}>
                          {u.address}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'STORE_OWNER'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                            {u.role === 'STORE_OWNER' && <Store className="w-3 h-3" />}
                            {u.role === 'USER' && <Users className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedUserId(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STORE OWNER RATINGS */}
        {activeTab === 'owners' && (
          <div className="space-y-6">
            {ownerRatings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                No store owners registered in the system yet.
              </div>
            ) : (
              ownerRatings.map((owner) => (
                <div
                  key={owner.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Owner Header */}
                  <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{owner.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                          Store Owner
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {owner.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {owner.address}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {owner.stores.length} {owner.stores.length === 1 ? 'Store' : 'Stores'} Managed
                    </div>
                  </div>

                  {/* Stores & Their Ratings */}
                  <div className="p-5 space-y-6">
                    {owner.stores.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No stores assigned to this owner.</p>
                    ) : (
                      owner.stores.map((store) => (
                        <div key={store.id} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{store.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{store.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={store.averageRating} size="sm" />
                              <span className="text-sm font-bold text-slate-800">
                                {store.averageRating > 0 ? store.averageRating.toFixed(1) : '0.0'}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({store.totalRatings} ratings)
                              </span>
                            </div>
                          </div>

                          {/* List of ratings submitted */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                              Customer Ratings Breakdown:
                            </p>
                            {store.ratings.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No ratings submitted for this store yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {store.ratings.map((r) => (
                                  <div
                                    key={r.id}
                                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <span className="font-semibold text-slate-800 block">
                                        {r.user.name}
                                      </span>
                                      <span className="text-slate-500 text-[11px]">
                                        {r.user.email}
                                      </span>
                                      <span className="text-slate-400 block text-[10px] mt-0.5">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <StarRating rating={r.rating} size="sm" />
                                      <span className="font-bold text-slate-700">{r.rating} / 5</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={reloadData}
      />

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={reloadData}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
};

export default AdminDashboard;
