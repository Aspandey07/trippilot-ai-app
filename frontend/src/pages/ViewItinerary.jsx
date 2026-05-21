import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Share2, MapPin, Calendar, Plane, Building2, Download, Check, Copy, Trash2, CloudSun, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewItinerary = ({ shared = false }) => {
  const { id, shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      await api.delete(`/itineraries/${itinerary._id}`);
      toast.success('Itinerary deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete itinerary');
    }
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const endpoint = shared ? `/itineraries/shared/${shareId}` : `/itineraries/${id}`;
        const { data } = await api.get(endpoint);
        setItinerary(data);
      } catch (error) {
        toast.error('Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id, shareId, shared]);

  const handleShareWhatsApp = () => {
    const link = `${window.location.origin}/shared/${itinerary.shareId}`;
    const text = `Check out my travel itinerary for ${itinerary.destination || itinerary.title}! 🌍\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = () => {
    const link = `${window.location.origin}/shared/${itinerary.shareId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Itinerary Not Found</h2>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto print:py-0">
      {/* Action Buttons - Hidden in Print */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
        <button onClick={() => window.history.back()} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Back
        </button>
        <div className="flex gap-3">
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          {!shared && (
            <>
              <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Link
              </button>
              <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors">
                <Share2 className="w-4 h-4" /> WhatsApp
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass rounded-3xl overflow-hidden mb-8 border border-white/50 shadow-xl shadow-blue-900/5 print:border-none print:shadow-none print:bg-white">
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 flex items-end relative print:h-auto print:bg-slate-100 print:text-black">
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
          <div className="relative z-10 w-full text-white print:text-slate-900">
            {shared && <p className="text-sm font-semibold opacity-80 mb-2">Curated by {itinerary.user?.name}</p>}
            <h1 className="text-4xl md:text-5xl font-black drop-shadow-md mb-2">{itinerary.destination || itinerary.title}</h1>
            <h2 className="text-xl md:text-2xl font-semibold opacity-90 drop-shadow-sm">{itinerary.title}</h2>
          </div>
        </div>

        {/* Extracted Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Travel Dates</p>
              <p className="font-semibold text-slate-800 mt-1">
                {itinerary.travelDates?.checkIn ? new Date(itinerary.travelDates.checkIn).toLocaleDateString() : 'N/A'} 
                {' - '} 
                {itinerary.travelDates?.checkOut ? new Date(itinerary.travelDates.checkOut).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Plane className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Flight Details</p>
              <p className="font-semibold text-slate-800 mt-1">{itinerary.flightDetails?.flightNumber || 'Not specified'}</p>
            </div>
          </div>
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Accommodation</p>
              <p className="font-semibold text-slate-800 mt-1">{itinerary.hotelDetails?.hotelName || 'Not specified'}</p>
              <p className="text-sm text-slate-500 truncate" title={itinerary.hotelDetails?.address}>{itinerary.hotelDetails?.address}</p>
            </div>
          </div>
      </div>
    </div>

    {/* Live Data Widgets */}
    {(itinerary.liveWeather || (itinerary.suggestedHotels && itinerary.suggestedHotels.length > 0)) && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:hidden">
        {/* Weather Widget */}
        {itinerary.liveWeather && (
          <div className="glass p-6 rounded-3xl border border-white/50 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Live Weather</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-slate-800">{itinerary.liveWeather.temp}°C</span>
              <span className="text-lg font-medium text-slate-500 mb-1">{itinerary.liveWeather.condition}</span>
            </div>
            <p className="text-slate-600 font-medium">{itinerary.liveWeather.suitability}</p>
          </div>
        )}

        {/* Hotels Widget */}
        {itinerary.suggestedHotels && itinerary.suggestedHotels.length > 0 && (
          <div className="glass p-6 rounded-3xl border border-white/50 shadow-md bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Suggested Hotels</h3>
            </div>
            <div className="space-y-3">
              {itinerary.suggestedHotels.map((hotel, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                  <Building2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{hotel.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{hotel.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Itinerary Timeline */}
      <h3 className="text-3xl font-extrabold text-slate-900 mb-8 px-2 flex items-center gap-3">
        <MapPin className="w-8 h-8 text-blue-500" /> Day-by-Day Plan
      </h3>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-200 before:via-indigo-200 before:to-transparent">
        {itinerary.itinerarySummary && itinerary.itinerarySummary.map((day, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline Circle */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-3 md:ml-0 z-10 text-white font-bold text-sm">
              D{day.day}
            </div>

            {/* Card Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 glass rounded-2xl border border-white/50 shadow-md hover:shadow-xl hover:shadow-blue-900/5 transition-shadow">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <h4 className="text-xl font-bold text-slate-800">Day {day.day}: {day.title}</h4>
                </div>
                <ul className="space-y-3 mt-4">
                  {day.activities && day.activities.map((activity, i) => (
                    <li key={i} className="flex gap-3 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                      <span className="leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewItinerary;
