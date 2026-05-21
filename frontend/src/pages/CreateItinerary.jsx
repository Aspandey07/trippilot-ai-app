import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, FileText, FileImage, Loader2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const CreateItinerary = () => {
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    // Append new files without exceeding 5 files
    setFiles(prev => {
      const newFiles = [...prev, ...acceptedFiles];
      if (newFiles.length > 5) {
        toast.error('You can only upload up to 5 documents at once.');
        return prev;
      }
      return newFiles;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('image')) return <FileImage className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      return toast.error('Please upload at least one travel document.');
    }

    setLoading(true);
    
    // Toast setup for longer request
    const loadingToast = toast.loading('AI is reading documents and drafting your itinerary... This may take up to 30 seconds.');

    try {
      const formData = new FormData();
      formData.append('title', title || 'My Amazing Vacation');
      files.forEach(file => {
        formData.append('documents', file);
      });

      const { data } = await api.post('/itineraries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Successfully created!', { id: loadingToast });
      navigate(`/itinerary/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating itinerary', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create New Magic Trip</h1>
        <p className="text-slate-600">Upload your travel bookings and watch the magic happen.</p>
      </div>

      <div className="glass p-8 rounded-3xl shadow-xl border border-white/50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Trip Title (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              placeholder="E.g., Honeymoon in Bali, Goa Trip with Friends"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Travel Documents</label>
            <div 
              {...getRootProps()} 
              className={`p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white/50 hover:bg-slate-50'}`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <p className="text-slate-700 font-semibold text-lg mb-1">
                {isDragActive ? 'Drop your files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Supported formats: PDF, JPG, PNG (Max 5 files)
              </p>
              <button type="button" className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                Browse Files
              </button>
            </div>
          </div>

          {files.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Files ({files.length}/5)</h4>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 truncate">
                      {getFileIcon(file.type)}
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <>
                   <Loader2 className="w-6 h-6 animate-spin" />
                   AI is working its magic...
                </>
              ) : (
                'Generate Itinerary'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItinerary;
