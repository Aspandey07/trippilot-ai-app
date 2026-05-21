import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Users, 
  MapPinned, 
  Trash2, 
  UserCheck, 
  ShieldAlert, 
  BarChart3, 
  ExternalLink,
  Shield,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [itinerariesList, setItinerariesList] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'itineraries'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin authorization required.');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsersList(usersRes.data);

      const itinerariesRes = await api.get('/admin/itineraries');
      setItinerariesList(itinerariesRes.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleToggleRole = async (targetUserId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(true);
    try {
      const res = await api.put('/admin/users/role', { userId: targetUserId, role: newRole });
      toast.success(res.data.message || `Role updated to ${newRole}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUserId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This will delete all of their itineraries permanently.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/users/${targetUserId}`);
      toast.success(res.data.message || 'User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItinerary = async (itineraryId, title) => {
    if (!window.confirm(`Are you sure you want to delete the itinerary "${title}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/itineraries/${itineraryId}`);
      toast.success(res.data.message || 'Itinerary deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete itinerary');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading secure admin data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[95%] xl:max-w-[1536px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Control Panel
          </h1>
          <p className="text-slate-500 mt-1">Manage TripPilot users, generated itineraries, and view system analytics.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2 bg-slate-100 p-1 rounded-xl self-start">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Analytics Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Users ({usersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('itineraries')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'itineraries' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Itineraries ({itinerariesList.length})
          </button>
        </div>
      </div>

      {/* Analytics Overview Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 relative">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-semibold">Total Users</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 relative">
                <MapPinned className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-semibold">Total Itineraries</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalItineraries}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 relative">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-semibold">Admin Accounts</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.adminCount}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 relative">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-semibold">User Accounts</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.userCount}</p>
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Signups */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent User Registrations
                </h3>
                <button onClick={() => setActiveTab('users')} className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                  View All
                  <span className="text-base">&rarr;</span>
                </button>
              </div>
              <div className="space-y-4">
                {stats.recentUsers.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4 text-center">No users registered yet.</p>
                ) : (
                  stats.recentUsers.map(u => (
                    <div key={u._id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100/70 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{u.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                          {u.role.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Itineraries */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPinned className="w-5 h-5 text-indigo-600" />
                  Recently Generated Itineraries
                </h3>
                <button onClick={() => setActiveTab('itineraries')} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
                  View All
                  <span className="text-base">&rarr;</span>
                </button>
              </div>
              <div className="space-y-4">
                {stats.recentItineraries.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4 text-center">No itineraries created yet.</p>
                ) : (
                  stats.recentItineraries.map(i => (
                    <div key={i._id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100/70 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{i.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{i.destination || 'Unspecified Destination'}</p>
                      </div>
                      <div className="text-right">
                        <Link to={`/shared/${i.shareId}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          View Trip <ExternalLink className="w-3 h-3" />
                        </Link>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(i.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800">User Directory</h3>
            <p className="text-slate-500 text-sm mt-1">Manage user roles and remove accounts from the platform.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-100">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-4 px-6">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-3">
                        <button 
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={actionLoading || u._id === user._id}
                          title={u.role === 'admin' ? 'Revoke Admin Access' : 'Make Admin'}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={actionLoading || u._id === user._id}
                          title="Delete User"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Itineraries Tab */}
      {activeTab === 'itineraries' && (
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800">Itinerary Registry</h3>
            <p className="text-slate-500 text-sm mt-1">Review all travel itineraries generated by users.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-100">
                  <th className="py-4 px-6">Trip Title</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Created By</th>
                  <th className="py-4 px-6">Travel Dates</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {itinerariesList.map(i => (
                  <tr key={i._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 max-w-[200px] truncate">{i.title}</td>
                    <td className="py-4 px-6">{i.destination || 'N/A'}</td>
                    <td className="py-4 px-6">
                      {i.user ? (
                        <div>
                          <p className="font-medium text-slate-900">{i.user.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{i.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Deleted User</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {i.travelDates?.checkIn ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(i.travelDates.checkIn).toLocaleDateString()} 
                            {i.travelDates.checkOut && ` - ${new Date(i.travelDates.checkOut).toLocaleDateString()}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-3">
                        <Link 
                          to={`/shared/${i.shareId}`} 
                          target="_blank"
                          title="View Shareable Page"
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteItinerary(i._id, i.title)}
                          disabled={actionLoading}
                          title="Delete Itinerary"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
