import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Map, Cpu, Share2, Compass, ShieldCheck, Clock, Mail, MapPin as MapPinIcon, Phone, Plane, Bus, Train, Building, Car, MapPinned } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      return toast.error('Please fill in all fields.');
    }
    setIsSending(true);
    setTimeout(() => {
      toast.success('Thank you! Your message has been sent successfully.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="flex-1 w-full max-w-[95%] xl:max-w-[1536px] mx-auto px-2 sm:px-4 lg:px-6 py-8 z-10">
      {/* Hero Section */}
      <section className="pt-8 pb-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Text Content Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your Travel Documents <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Turned into Itineraries
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Upload your flight tickets, hotel bookings, and train details. Our AI will automatically extract the information and generate a complete, personalized day-by-day travel itinerary for you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link to="/register" className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2">
                Start Planning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full shadow-sm ring-1 ring-slate-200 transition-all hover:scale-105 flex items-center justify-center">
                Login to Account
              </Link>
            </div>
          </div>

          {/* Image Mockup Column */}
          <div className="lg:col-span-5 w-full relative group">
            {/* Glowing background blob */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.5rem] blur-2xl opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
            
            <div className="relative border border-slate-200/80 rounded-[2.2rem] p-2 bg-slate-900/5 shadow-2xl backdrop-blur-md overflow-hidden transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500">
              <div className="bg-white rounded-[1.8rem] overflow-hidden border border-slate-200 shadow-lg">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></span>
                  </div>
                  <div className="flex-1 max-w-[180px] mx-auto bg-slate-100 rounded-md py-0.5 px-2 text-center">
                    <span className="text-[9px] text-slate-500 tracking-wide select-none">trippilot.com/dashboard</span>
                  </div>
                </div>
                {/* Image with constrained height and perfect styling */}
                <img 
                  src="/travel_hero.png" 
                  alt="TripPilot App Dashboard Mockup" 
                  className="w-full h-auto max-h-[380px] md:max-h-[440px] object-cover object-top hover:object-bottom transition-all duration-10000 ease-in-out cursor-ns-resize"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3 italic">Hover mockup to scroll through dashboard</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 border-t border-slate-200/50">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">About TripPilot</h2>
              <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
              <p className="text-lg text-slate-600 leading-relaxed">
                TripPilot was born out of a simple frustration: managing travel documents is messy, and planning itineraries takes too much time. We built a platform that uses cutting-edge Artificial Intelligence to bridge that gap. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                By combining Google's Gemini Vision AI with an elegant user interface, we empower travelers to simply upload their messy booking PDFs and instantly receive a beautifully structured, shareable travel plan.
              </p>
            </div>

            {/* Core features inline list */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Our Mission</h4>
                  <p className="text-sm text-slate-500">To make travel setup completely frictionless and highly enjoyable through AI automation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Secure Processing</h4>
                  <p className="text-sm text-slate-500">Your documents are processed securely in memory and never sold to third parties.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Time Saving</h4>
                  <p className="text-sm text-slate-500">What used to take hours of manual data entry now takes exactly 15 seconds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Image Container */}
          <div className="relative group max-w-[490px] mx-auto w-full mt-8 md:mt-0 flex items-center justify-center">
            {/* Glowing background blob */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-20 transform rotate-2 group-hover:rotate-1 transition-all duration-500"></div>
            
            <div className="relative border border-slate-200/80 rounded-[2.2rem] p-3.5 bg-white/80 shadow-2xl backdrop-blur-md overflow-visible transform hover:-translate-y-2 transition-all duration-500">
              <div className="bg-slate-50/50 rounded-[1.6rem] overflow-hidden border border-slate-100">
                <img 
                  src="/travel_about.png" 
                  alt="TripPilot AI Travel Assistant Illustration" 
                  className="w-full h-auto object-contain rounded-[1.6rem]"
                />
              </div>

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white/95 border border-slate-100 shadow-xl rounded-2xl p-3 flex items-center gap-2.5 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-500 select-none max-w-[200px]">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
                  ✨
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-slate-800 leading-tight">AI Parser</h5>
                  <p className="text-[9px] text-slate-500">Instant PDF reading</p>
                </div>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white/95 border border-slate-100 shadow-xl rounded-2xl p-3 flex items-center gap-2.5 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-500 select-none max-w-[200px]">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-sm">
                  🗺️
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-slate-800 leading-tight">100% Automatic</h5>
                  <p className="text-[9px] text-slate-500">No manual copying</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 bg-gradient-to-b from-slate-50 via-white to-slate-100 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Travel Services Crafted for You</h2>
        <div className="w-24 h-1.5 bg-indigo-600 rounded-full mx-auto mb-12"></div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16">
          From flights to local tours, our AI‑enhanced platform streamlines every step of your journey.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <Plane className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Flights</h4>
            <p className="text-sm text-slate-500">Book and organise all airline itineraries.</p>
          </div>
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <Bus className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Buses</h4>
            <p className="text-sm text-slate-500">Seamless regional travel options.</p>
          </div>
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <Train className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Trains</h4>
            <p className="text-sm text-slate-500">Fast, comfortable rail journeys.</p>
          </div>
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <Building className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Hotels</h4>
            <p className="text-sm text-slate-500">Hand‑picked stays with instant confirmations.</p>
          </div>
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <Car className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Cars</h4>
            <p className="text-sm text-slate-500">Rentals and transfers at your fingertips.</p>
          </div>
          <div className="glass p-8 bg-white/30 rounded-2xl border border-white/30 shadow-xl hover:scale-105 transform transition-all duration-300">
            <MapPinned className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-xl mb-2">Tours</h4>
            <p className="text-sm text-slate-500">Curated local experiences and guides.</p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Travel Blog</h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">Stories, tips, and guides from explorers around the world.</p>
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-8">
            <img 
              src="/blog_section.png" 
              alt="Travel Blog Preview" 
              className="w-full h-auto max-h-[350px] object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <span className="text-white font-medium bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm">Read Latest Post</span>
            </div>
          </div>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Discover travel guides written by globetrotters. From budgeting your first backpacking trip to finding the best hidden cafes in Paris, we share authentic stories to spark your wanderlust.
          </p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 group">
            Explore Our Blog
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="py-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-10">How it Works</h3>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {/* Feature 1 */}
          <div className="glass p-8 bg-white/40 rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Map className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Document OCR Parsing</h3>
            <p className="text-slate-600">Drag & drop your PDFs or images. Our native multimodal AI pulls out destinations, flight numbers, and dates seamlessly.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-8 bg-white/40 rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Cpu className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Itinerary Generation</h3>
            <p className="text-slate-600">Powered by the latest LLMs to give you culturally rich, logically organized, personalized travel plans.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-8 bg-white/40 rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <Share2 className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Universal Sharing</h3>
            <p className="text-slate-600">Share your beautiful itinerary via WhatsApp, copy a magical public link, or export natively as a PDF.</p>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-12 mb-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl border border-blue-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid md:grid-cols-2 gap-12 relative z-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Get In Touch</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Have questions about enterprise plans or facing issues while creating your itineraries? Drop us a line.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>meakp321@gmail.com</span>
                </div>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>7091161200</span>
                </div>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <span>ahmedabad</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition-all"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition-all"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <textarea 
                    rows="3" 
                    placeholder="How can we help?" 
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm resize-none transition-all"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full py-4 bg-white text-indigo-950 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
