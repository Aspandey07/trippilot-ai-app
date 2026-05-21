// frontend/src/pages/UploadTrip.jsx
import { useState } from 'react';
import api from '../api';

export default function UploadTrip() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('document', file);
    try {
      const { data } = await api.post('/trip/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Trip Document</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded hover:opacity-90 transition"
        >
          {loading ? 'Processing…' : 'Generate Itinerary'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Itinerary</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result.itinerary, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
