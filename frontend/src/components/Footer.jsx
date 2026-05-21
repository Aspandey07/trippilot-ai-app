import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 text-slate-300 relative mt-auto border-t border-slate-800">
      <div className="max-w-[95%] xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 border-r border-slate-800/50 pr-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TripPilot</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Making your travel planning seamless and stress-free by leveraging the power of multimodal Artificial Intelligence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Community
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Forums
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Blog
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="/#services" className="hover:text-blue-400 transition-colors">Services</a></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/#contact" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Subscribe</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest travel tips and tool updates.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-lg transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} TripPilot. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1">Made with <span className="text-red-500 mx-1">&#10084;</span> for modern travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
