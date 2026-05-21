import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from './pages/Test';
import { Toaster } from 'react-hot-toast';

// Layout & Context
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthContext, { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateItinerary from './pages/CreateItinerary';
import ViewItinerary from './pages/ViewItinerary';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
          {/* Background decoration */}
          <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
          
          <Navbar />
          <main className="flex-1 w-full max-w-[95%] xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/create-trip" element={<ProtectedRoute><CreateItinerary /></ProtectedRoute>} />
              <Route path="/itinerary/:id" element={<ProtectedRoute><ViewItinerary /></ProtectedRoute>} />
              <Route path="/shared/:shareId" element={<ViewItinerary shared />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
