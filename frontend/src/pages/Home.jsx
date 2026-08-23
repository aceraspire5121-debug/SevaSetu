import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  Building2,
  CheckCircle2,
  Search,
  MapPin,
  ChevronRight,
  Clock,
  ThumbsUp,
  Wrench,
  Sparkle,
  BadgePercent,
  ChevronDown,
  Navigation,
  Crosshair,
  Check,
  X,
  Camera,
  Video,
} from 'lucide-react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import AiDiagnosticModal from '../components/AiDiagnosticModal';
import InstantVideoCallModal from '../components/InstantVideoCallModal';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Location Selector State (Matching Screenshot 2)
  const [selectedLocation, setSelectedLocation] = useState('H37, Block H- Saket- New Delhi');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [locDetecting, setLocDetecting] = useState(false);
  const locationDropdownRef = useRef(null);

  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    if (window.location.hash === '#new-and-noteworthy') {
      setTimeout(() => {
        const el = document.getElementById('new-and-noteworthy');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore-services?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(selectedLocation)}`);
    } else {
      navigate('/explore-services');
    }
  };

  // Detect real nearby location via Browser Geolocation + Real Reverse Geocoding
  const handleUseNearbyLocation = () => {
    setLocDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Fetching reverse geocode for coords: ${latitude}, ${longitude}`);

          try {
            // 1. Try BigDataCloud Client Reverse Geocode (Fast & CORS friendly)
            const bdcRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const bdcData = await bdcRes.json();

            if (bdcData && (bdcData.locality || bdcData.city || bdcData.principalSubdivision)) {
              const localityPart = bdcData.locality || bdcData.localityInfo?.administrative?.[3]?.name || '';
              const cityPart = bdcData.city || bdcData.principalSubdivision || '';
              const postcodePart = bdcData.postcode ? ` - ${bdcData.postcode}` : '';

              const formattedLoc = [localityPart, cityPart].filter(Boolean).join(', ') + postcodePart;
              setSelectedLocation(formattedLoc || `${bdcData.city}, ${bdcData.countryName}`);
              setLocDetecting(false);
              setIsLocationOpen(false);
              return;
            }

            // 2. Fallback to OpenStreetMap Nominatim
            const osmRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const osmData = await osmRes.json();

            if (osmData && osmData.address) {
              const addr = osmData.address;
              const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || '';
              const ct = addr.city || addr.town || addr.state_district || addr.state || '';
              const pin = addr.postcode ? ` - ${addr.postcode}` : '';

              const osmLocStr = [sub, ct].filter(Boolean).join(', ') + pin;
              setSelectedLocation(osmLocStr || osmData.display_name.split(',').slice(0, 3).join(', '));
            } else {
              setSelectedLocation(`Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
            }
          } catch (err) {
            console.error('Reverse geocoding error:', err);
            // If network fetch fails, show detected GPS coords
            setSelectedLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          } finally {
            setLocDetecting(false);
            setIsLocationOpen(false);
          }
        },
        (error) => {
          console.error('Geolocation access error:', error);
          alert('Location permission denied or unavailable. You can type your city/locality manually.');
          setLocDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setLocDetecting(false);
    }
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocationInput.trim()) {
      setSelectedLocation(customLocationInput.trim());
      setCustomLocationInput('');
      setIsLocationOpen(false);
    }
  };

  const popularLocalities = [
    'H37, Block H- Saket- New Delhi',
    'Andheri West, Mumbai, Maharashtra',
    'Koramangala 4th Block, Bengaluru',
    'Salt Lake Sector 5, Kolkata',
    'Banjara Hills Road No. 12, Hyderabad',
    'Civil Lines, Jaipur, Rajasthan',
  ];

  // 8 Quick Service Icons with Multilingual Names
  const quickServices = [
    {
      id: 'cleaning',
      nameEn: 'Cleaning & Pest Control',
      nameHi: 'सफाई एवं कीट नियंत्रण',
      icon: '🧹',
      category: 'House Cleaning',
      badgeEn: 'Popular',
      badgeHi: 'लोकप्रिय',
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'electrician',
      nameEn: 'Electrician & Plumber',
      nameHi: 'इलेक्ट्रीशियन एवं प्लंबर',
      icon: '⚡',
      category: 'Electrician',
      badgeEn: 'Emergency',
      badgeHi: 'आपातकालीन',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'ac',
      nameEn: 'AC & Appliance Repair',
      nameHi: 'एसी एवं उपकरण मरम्मत',
      icon: '❄️',
      category: 'Technician',
      badgeEn: 'Trending',
      badgeHi: 'ट्रेंडिंग',
      badgeColor: 'bg-teal-600',
    },
    {
      id: 'painting',
      nameEn: 'Home Painting & Upgrade',
      nameHi: 'घर की पुताई एवं पेंटिंग',
      icon: '🎨',
      category: 'Painter',
    },
    {
      id: 'cook',
      nameEn: 'Cook & Household Help',
      nameHi: 'रसोइया एवं घरेलू सहायिका',
      icon: '🍳',
      category: 'Cook',
    },
    {
      id: 'carpenter',
      nameEn: 'Carpentry & Furniture',
      nameHi: 'बढ़ई एवं फर्नीचर कार्य',
      icon: '🪑',
      category: 'Carpenter',
    },
    {
      id: 'caregiver',
      nameEn: 'Caregiver & Senior Care',
      nameHi: 'देखभाल एवं वरिष्ठ सेवा',
      icon: '👵',
      category: 'Caregiver',
    },
    {
      id: 'driver',
      nameEn: 'Driver & Chauffeur',
      nameHi: 'ड्राइवर एवं वाहन चालक',
      icon: '🚗',
      category: 'Driver',
    },
  ];

  // Spotlight Banners (Screenshot 2)
  const spotlightItems = [
    {
      id: 1,
      badgeEn: 'New launch',
      badgeHi: 'नई पेशकश',
      titleEn: 'Deep Home Sanitization',
      titleHi: 'घर की गहरी सफाई एवं सैनिटाइजेशन',
      subtitleEn: 'Transform your living spaces in a single day with eco-safe cleaners.',
      subtitleHi: 'पर्यावरण-अनुकूल उत्पादों के साथ अपने घर को एक दिन में चमकाएं।',
      category: 'House Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      theme: 'from-amber-950/90 via-slate-900 to-black',
    },
    {
      id: 2,
      badgeEn: 'Trending',
      badgeHi: 'ट्रेंडिंग',
      titleEn: 'Monsoon Damp Wall Fix',
      titleHi: 'दीवार की सीलन एवं पुट्टी समाधान',
      subtitleEn: 'Waterproofing, putty & seamless painting by verified cooperative painters.',
      subtitleHi: 'सत्यापित सहकारी पेंटरों द्वारा वाटरप्रूफिंग और आकर्षक पेंटिंग।',
      category: 'Painter',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
      theme: 'from-teal-950/90 via-slate-900 to-black',
    },
    {
      id: 3,
      badgeEn: 'Fair-Wage Model',
      badgeHi: 'उचित मजदूरी मॉडल',
      titleEn: 'Democratic Worker Payouts',
      titleHi: 'श्रमिकों को 95%+ प्रत्यक्ष भुगतान',
      subtitleEn: 'Zero predatory middleman cuts. 100% fair wage protection.',
      subtitleHi: 'कोई बिचौलिया कटौती नहीं। 100% उचित न्यूनतम मजदूरी गारंटी।',
      category: 'Electrician',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      theme: 'from-slate-950 via-slate-900 to-teal-950',
    },
  ];

  // New & Noteworthy Category Cards (Screenshot 3)
  const noteworthyItems = [
    {
      slug: 'full-home-deep-cleaning',
      titleEn: 'Full Home Deep Cleaning',
      titleHi: 'पूरे घर की गहरी सफाई',
      category: 'House Cleaning',
      badgeEn: 'New',
      badgeHi: 'नया',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',
    },
    {
      slug: 'ac-pressure-jet-service',
      titleEn: 'AC Pressure Jet Service',
      titleHi: 'एसी जेट प्रेशर सर्विसिंग',
      category: 'Technician',
      badgeEn: 'Trending',
      badgeHi: 'ट्रेंडिंग',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    },
    {
      slug: 'wall-moulding-painting',
      titleEn: 'Wall Moulding & Painting',
      titleHi: 'वॉल मोल्डिंग एवं पेंटिंग',
      category: 'Painter',
      badgeEn: 'New',
      badgeHi: 'नया',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    },
    {
      slug: 'switchboard-wiring-fix',
      titleEn: 'Switchboard & Wiring Fix',
      titleHi: 'स्विचबोर्ड एवं वायरिंग मरम्मत',
      category: 'Electrician',
      badgeEn: 'Essential',
      badgeHi: 'आवश्यक',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    },
    {
      slug: 'wooden-furniture-polish',
      titleEn: 'Wooden Furniture Polish',
      titleHi: 'लकड़ी फर्नीचर पॉलिशिंग',
      category: 'Carpenter',
      badgeEn: 'Care',
      badgeHi: 'देखभाल',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
    },
  ];

  // Most Booked Services (Screenshot 4)
  const mostBookedServices = [
    {
      id: 'mb-1',
      titleEn: 'Foam-jet AC Service',
      titleHi: 'फोम-जेट एसी सर्विस',
      category: 'Technician',
      rating: 4.84,
      reviews: '856K',
      price: 299,
      origPrice: 499,
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mb-2',
      titleEn: 'Intense Bathroom Cleaning (2 Baths)',
      titleHi: 'बाथरूम डीप क्लीनिंग (2 बाथरूम)',
      category: 'House Cleaning',
      rating: 4.80,
      reviews: '6.8M',
      price: 499,
      origPrice: 799,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mb-3',
      titleEn: 'Switchboard & Fan Installation',
      titleHi: 'स्विचबोर्ड एवं पंखा इंस्टॉलेशन',
      category: 'Electrician',
      rating: 4.86,
      reviews: '481K',
      price: 199,
      origPrice: 350,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mb-4',
      titleEn: 'Drain Unclogging & Pipe Leak Repair',
      titleHi: 'ड्रेन अनक्लॉगिंग एवं पाइप लीकेज मरम्मत',
      category: 'Plumber',
      rating: 4.78,
      reviews: '310K',
      price: 249,
      origPrice: 450,
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mb-5',
      titleEn: 'Full Kitchen Deep Degreasing',
      titleHi: 'किचन डीप क्लीनिंग एवं ग्रीसिंग सफाई',
      category: 'Cook',
      rating: 4.79,
      reviews: '520K',
      price: 399,
      origPrice: 650,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. TOP SUB-HEADER: LOCATION SELECTOR & CLEAN SEARCH BAR (Faithful to Screenshot 2) */}
      <div className="border-b border-slate-200/80 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* LOCATION SELECTOR PILL (Original Urban Company Clean Style from Screenshot 2) */}
            <div className="relative w-full sm:w-auto" ref={locationDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 transition-all w-full sm:w-72 shadow-xs group cursor-pointer"
              >
                {/* Target / Location Icon matching screenshot 2 */}
                <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 group-hover:border-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
                <span className="truncate text-left font-semibold text-slate-700">
                  {selectedLocation}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* LOCATION DROPDOWN & NEARBY SELECTOR MODAL */}
              {isLocationOpen && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {language === 'hi' ? 'स्थान चुनें' : 'Choose Your Location'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Use Nearby / Current Location Button */}
                  <button
                    type="button"
                    onClick={handleUseNearbyLocation}
                    disabled={locDetecting}
                    className="w-full flex items-center gap-3 p-3 bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Crosshair className={`w-4 h-4 ${locDetecting ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-teal-950">
                        {locDetecting ? (language === 'hi' ? 'स्थान खोजा जा रहा है...' : 'Detecting nearby location...') : t('useCurrentLocation')}
                      </h5>
                      <p className="text-[10px] text-teal-700">
                        {language === 'hi' ? 'जीपीएस द्वारा नजदीकी क्षेत्र प्राप्त करें' : 'Get current locality via GPS / Nearby area'}
                      </p>
                    </div>
                  </button>

                  {/* 2. Custom Location Input Box */}
                  <form onSubmit={handleCustomLocationSubmit} className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {language === 'hi' ? 'या अपना पता/स्थान लिखें:' : 'Or type your address / locality:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customLocationInput}
                        onChange={(e) => setCustomLocationInput(e.target.value)}
                        placeholder={t('locationPlaceholder')}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        {language === 'hi' ? 'लागू करें' : 'Set'}
                      </button>
                    </div>
                  </form>

                  {/* 3. Popular / Nearby Localities List */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {t('nearbyLocations')}
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {popularLocalities.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            selectedLocation === loc
                              ? 'bg-teal-50 text-teal-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{loc}</span>
                          </div>
                          {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CLEAN SEARCH BAR WITH INTEGRATED AI DIAGNOSTIC CAMERA BUTTON */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl w-full">
              <div className="flex items-center px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs focus-within:ring-2 focus-within:ring-slate-300">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
                />

                {/* Minimalist Black Camera Icon for AI Visual Diagnosis */}
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="mr-2 p-1.5 text-slate-700 hover:text-black hover:bg-slate-100 rounded-lg transition-all shrink-0 cursor-pointer group"
                  title="Upload photo to diagnose problem & estimate fair cost with AI"
                  aria-label="Diagnose with AI Camera"
                >
                  <Camera className="w-4 h-4 text-slate-900 group-hover:scale-115 transition-transform" />
                </button>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {language === 'hi' ? 'खोजें' : 'Search'}
                </button>
              </div>
            </form>

            {/* Emergency Shortcut */}
            <Link
              to="/explore-services"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              {t('emergencyBtn')}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION (Urban Company 2-Column Mosaic Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Heading & 8-Grid Service Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-teal-800 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                {t('coopBadge')}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {t('heroSubtitle')}
              </p>
            </div>

            {/* 8-Grid Service Category Box (Clean Urban Company Style) */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {t('whatLookingFor')}
              </h3>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
                {quickServices.map((svc) => (
                  <Link
                    key={svc.id}
                    to={`/explore-services?category=${encodeURIComponent(svc.category)}&location=${encodeURIComponent(selectedLocation)}`}
                    className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-300 transition-all hover:scale-105"
                  >
                    {svc.badgeEn && (
                      <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 text-[8px] font-extrabold text-white rounded-full ${svc.badgeColor || 'bg-slate-800'} shadow-xs`}>
                        {language === 'hi' ? svc.badgeHi : svc.badgeEn}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                      {svc.icon}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 group-hover:text-slate-950 leading-tight line-clamp-2">
                      {language === 'hi' ? svc.nameHi : svc.nameEn}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Bottom Feature Pill */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{t('fairWageProtected')}</span>
                </div>
                <Link
                  to="/explore-services"
                  className="font-bold text-slate-900 hover:text-teal-700 flex items-center gap-0.5"
                >
                  {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Stunning 4-Image Mosaic Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4 h-full">
            {/* Top Left: Deep Cleaning */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm group h-48 sm:h-64">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                alt="House Cleaning & Sanitization"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  {language === 'hi' ? 'प्रमाणित सफाईकर्मी' : 'Certified Cleaners'}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {language === 'hi' ? 'घर की गहन सफाई एवं स्वच्छता' : 'Deep Home Cleaning & Sanitization'}
                </h4>
              </div>
            </div>

            {/* Top Right: Relaxing Caregiver / Wellness */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm group h-48 sm:h-64">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                alt="Caregiver & Wellness"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {language === 'hi' ? 'सत्यापित समिति सदस्य' : 'Verified Society Workers'}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {language === 'hi' ? 'देखभाल एवं व्यक्तिगत सेवा' : 'Caregiver & Personal Wellness'}
                </h4>
              </div>
            </div>

            {/* Bottom Left: Kitchen Appliance & Chimney */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm group h-48 sm:h-64">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
                alt="Electrician & Appliance Repair"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  {language === 'hi' ? 'विशेषज्ञ मरम्मत' : 'Expert Repair'}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {language === 'hi' ? 'रसोई चिमनी एवं वायरिंग मरम्मत' : 'Kitchen Chimney & Wiring'}
                </h4>
              </div>
            </div>

            {/* Bottom Right: AC Pressure Wash Service */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm group h-48 sm:h-64">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                alt="AC Foam Jet Servicing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {language === 'hi' ? 'एसी एवं कूलिंग' : 'AC & Cooling'}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {language === 'hi' ? 'हाई-प्रेशर एसी फोम सर्विस' : 'High-Pressure AC Foam Service'}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BANNER */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">4.85 / 5</p>
                <p className="text-[11px] text-slate-500">{t('serviceRatingText')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">12,000+</p>
                <p className="text-[11px] text-slate-500">{t('verifiedWorkersText')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">100%</p>
                <p className="text-[11px] text-slate-500">{t('fairWageFloorText')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">15 Mins</p>
                <p className="text-[11px] text-slate-500">{t('emergencyDispatchText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "IN THE SPOTLIGHT" SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('inTheSpotlight')}</h2>
          <Link
            to="/explore-services"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            {t('seeAllOffers')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {spotlightItems.map((item) => (
            <Link
              key={item.id}
              to={`/explore-services?category=${encodeURIComponent(item.category)}&location=${encodeURIComponent(selectedLocation)}`}
              className="relative group rounded-3xl overflow-hidden shadow-md bg-slate-900 text-white min-h-[220px] flex flex-col justify-between p-6 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={item.image}
                alt={item.titleEn}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.theme} opacity-85`} />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 bg-rose-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md mb-3">
                  {language === 'hi' ? item.badgeHi : item.badgeEn}
                </span>
                <h3 className="text-lg font-black leading-snug">
                  {language === 'hi' ? item.titleHi : item.titleEn}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? item.subtitleHi : item.subtitleEn}
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl group-hover:bg-amber-400 transition-colors shadow-sm">
                  {t('explore')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. "NEW AND NOTEWORTHY" CAROUSEL/GRID */}
      <section id="new-and-noteworthy" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('newAndNoteworthy')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('newAndNoteworthySubtitle')}</p>
          </div>
          <Link
            to="/explore-services"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            {t('exploreAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {noteworthyItems.map((item, idx) => (
            <Link
              key={idx}
              to={`/service-package/${item.slug}?location=${encodeURIComponent(selectedLocation)}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md shadow-xs">
                  {language === 'hi' ? item.badgeHi : item.badgeEn}
                </span>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 line-clamp-2 leading-tight">
                  {language === 'hi' ? item.titleHi : item.titleEn}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. "MOST BOOKED SERVICES" WITH RATINGS & PRICING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('mostBookedServices')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('mostBookedSubtitle')}</p>
          </div>
          <Link
            to="/explore-services"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            {t('viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {mostBookedServices.map((svc) => (
            <div
              key={svc.id}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={svc.image}
                  alt={svc.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                    {language === 'hi' ? svc.titleHi : svc.titleEn}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{svc.rating}</span>
                    <span className="text-slate-400">({svc.reviews})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-slate-900">₹{svc.price}</span>
                    <span className="text-[10px] text-slate-400 line-through">₹{svc.origPrice}</span>
                  </div>
                  <Link
                    to={`/explore-services?category=${encodeURIComponent(svc.category)}&location=${encodeURIComponent(selectedLocation)}`}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg transition-colors shadow-2xs"
                  >
                    {t('bookNow')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. THE SEVASETU COOPERATIVE ADVANTAGE (Streamlined & Modern) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
          <span className="text-[11px] font-black tracking-wider uppercase text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('coopAdvantageTitle')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('coopAdvantageHeading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">{t('feat1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('feat1Desc')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">{t('feat2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('feat2Desc')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">{t('feat3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('feat3Desc')}
            </p>
          </div>
        </div>
      </section>



      {/* AI DIAGNOSTIC MODAL */}
      <AiDiagnosticModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        selectedLocation={selectedLocation}
      />

      {/* INSTANT VIDEO CALL MODAL */}
      <InstantVideoCallModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
};

export default Home;
