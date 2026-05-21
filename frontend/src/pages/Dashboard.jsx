import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { PlusCircle, MapPin, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      await api.delete(`/itineraries/${id}`);
      toast.success('Itinerary deleted successfully');
      setItineraries(prev => prev.filter(trip => trip._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete itinerary');
    }
  };

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const { data } = await api.get('/itineraries');
        setItineraries(data);
      } catch (error) {
        toast.error('Failed to load your itineraries');
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-md"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Travel Plans</h1>
          <p className="text-slate-600 mt-1">Manage and view all your upcoming and past trips.</p>
        </div>
        <Link 
          to="/create-trip" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Itinerary
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center border border-white/50 shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <MapPin className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No trips planned yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Upload your first travel documents and let our AI magically create a perfect itinerary for your journey.
          </p>
          <Link 
            to="/create-trip" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((trip) => (
            <Link 
              to={`/itinerary/${trip._id}`} 
              key={trip._id}
              className="glass p-6 rounded-2xl border border-white/40 shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 group"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-6 relative overflow-hidden flex items-end p-4">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(trip._id, e)}
                  className="absolute top-3 right-3 z-20 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-all hover:scale-110 shadow-md"
                  title="Delete Itinerary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <h3 className="relative text-2xl font-bold text-white z-10 drop-shadow-md">
                  {trip.destination || trip.title}
                </h3>
              </div>
              
              <h4 className="text-lg font-bold text-slate-800 mb-4">{trip.title}</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-600 gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <Calendar className="w-4 h-4" />
                  </div>
                  {trip.travelDates?.checkIn ? new Date(trip.travelDates.checkIn).toLocaleDateString() : 'Dates Unknown'} 
                  {trip.travelDates?.checkOut && ` - ${new Date(trip.travelDates.checkOut).toLocaleDateString()}`}
                </div>
                
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {trip.documents?.length || 0} Documents
                  </span>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
