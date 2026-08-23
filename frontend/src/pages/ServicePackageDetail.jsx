import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import {
  Sparkles,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Radio,
  Send,
  Users,
  Building2,
  ChevronRight,
  ArrowLeft,
  Phone,
  Zap,
} from 'lucide-react';

const PACKAGES_DATABASE = {
  'full-home-deep-cleaning': {
    slug: 'full-home-deep-cleaning',
    titleEn: 'Full Home Deep Cleaning & Sanitization',
    titleHi: 'पूरे घर की गहन सफाई एवं स्वच्छता',
    category: 'House Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    rating: 4.89,
    reviewsCount: '48.5K',
    badge: 'Cooperative Certified',
    descriptionEn:
      'Hospital-grade deep cleaning covering kitchen degreasing, bathroom descaling, balcony wash, dry sofa vacuuming, and mechanical floor buffing by verified cooperative cleaners.',
    descriptionHi:
      'सत्यापित सहकारी सफाईकर्मियों द्वारा रसोई की चिकनाई हटाने, बाथरूम डीप क्लीनिंग, बालकनी वॉश, सोफा वैक्यूमिंग और फ्लोर बफिंग की सर्वोत्तम सेवा।',
    includes: [
      'Kitchen chimney, stove, tiles & cabinet degreasing',
      'Intense bathroom descaling, tile scrubbing & stain removal',
      'Dry vacuuming of sofas, mattresses, cushions & curtains',
      'Balcony washing & floor machine buffing',
      'Fan, tube-light, switchboard & window track dusting',
      'Eco-friendly non-hazardous cleaning chemicals included',
    ],
    tiers: [
      {
        id: 'tier-1bhk',
        nameEn: '1 BHK Deep Cleaning',
        nameHi: '1 बीएचके डीप क्लीनिंग',
        price: 999,
        duration: '2.5 - 3 Hours',
        recommended: false,
        desc: '1 Bedroom + 1 Hall + 1 Kitchen + 1 Bathroom',
      },
      {
        id: 'tier-2bhk',
        nameEn: '2 BHK Complete Home Cleaning',
        nameHi: '2 बीएचके संपूर्ण घर की सफाई',
        price: 1499,
        duration: '4 - 4.5 Hours',
        recommended: true,
        desc: '2 Bedrooms + 1 Hall + 1 Kitchen + 2 Bathrooms + Balcony',
      },
      {
        id: 'tier-3bhk',
        nameEn: '3 BHK Large Apartment Sanitization',
        nameHi: '3 बीएचके बड़ा अपार्टमेंट सैनिटाइजेशन',
        price: 2199,
        duration: '5 - 6 Hours',
        recommended: false,
        desc: '3 Bedrooms + 1 Large Living Room + 1 Kitchen + 3 Bathrooms + 2 Balconies',
      },
      {
        id: 'tier-villa',
        nameEn: '4 BHK / Independent Villa Deep Cleaning',
        nameHi: '4 बीएचके / विला डीप क्लीनिंग',
        price: 2999,
        duration: '7 - 8 Hours (Team of 2 Cleaners)',
        recommended: false,
        desc: '4 Bedrooms + Duplex Living + Modular Kitchen + 4 Bathrooms + Terrace/Balcony',
      },
    ],
  },

  'ac-pressure-jet-service': {
    slug: 'ac-pressure-jet-service',
    titleEn: 'AC Pressure Foam-Jet Servicing',
    titleHi: 'एसी प्रेशर फोम-जेट सर्विसिंग',
    category: 'Technician',
    heroImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    rating: 4.88,
    reviewsCount: '86.2K',
    badge: 'Trending',
    descriptionEn:
      '2X deeper cooling with specialized high-pressure foam-jet technology. Cleans indoor cooling coil, blower fan, drain tray, and outdoor compressor unit.',
    descriptionHi:
      'हाई-प्रेशर फोम जेट तकनीक के साथ 2 गुना बेहतर कूलिंग। इंडोर कूलिंग कॉइल, ब्लोअर फैन, ड्रेन ट्रे और आउटडोर कंप्रेसर की गहरी धुलाई।',
    includes: [
      'High-pressure water jet cleaning for outdoor condenser unit',
      'Foam-jet chemical spray on indoor evaporator cooling coils',
      'Blower wheel dismantling & intensive slime/dirt flushing',
      'Drain pipe flush & anti-bacterial tray disinfection',
      'Gas pressure level check & current amp draw testing',
    ],
    tiers: [
      {
        id: 'tier-split-1',
        nameEn: '1x Split AC Foam Jet Deep Service',
        nameHi: '1x स्प्लिट एसी फोम जेट डीप सर्विस',
        price: 499,
        duration: '45 Mins',
        recommended: true,
        desc: 'Complete indoor + outdoor pressure washing for 1 Split AC',
      },
      {
        id: 'tier-window-1',
        nameEn: '1x Window AC Overhaul & Wash',
        nameHi: '1x विंडो एसी ओवरहाल एवं वॉश',
        price: 399,
        duration: '40 Mins',
        recommended: false,
        desc: 'Deep chemical wash & drain unclogging for 1 Window AC',
      },
      {
        id: 'tier-split-2',
        nameEn: '2x Split AC Super Saver Combo',
        nameHi: '2x स्प्लिट एसी सुपर सेवर कॉम्बो',
        price: 899,
        duration: '1.5 Hours',
        recommended: false,
        desc: 'Complete service for 2 Split ACs (Save ₹100)',
      },
      {
        id: 'tier-gas',
        nameEn: 'AC Complete Gas Refill & Leakage Fix',
        nameHi: 'एसी गैस रिफिल एवं लीकेज मरम्मत',
        price: 1899,
        duration: '1 Hour',
        recommended: false,
        desc: 'Nitrogen pressure leak test + Genuine R32/R410A gas topup',
      },
    ],
  },

  'wall-moulding-painting': {
    slug: 'wall-moulding-painting',
    titleEn: 'Wall Moulding & Accent Painting',
    titleHi: 'वॉल मोल्डिंग एवं एक्सेंट पेंटिंग',
    category: 'Painter',
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    rating: 4.84,
    reviewsCount: '21.4K',
    badge: 'Luxury Finish',
    descriptionEn:
      'Elevate your living room aesthetics with custom geometric wall moulding panels and premium stain-resistant acrylic paint.',
    descriptionHi:
      'कस्टम ज्योमेट्रिक वॉल मोल्डिंग पैनल्स और प्रीमियम दाग-प्रतिरोधी ऐक्रेलिक पेंट के साथ अपने लिविंग रूम को दें लक्जरी लुक।',
    includes: [
      'High density charcoal / wood-polymer wall mouldings',
      'Laser-aligned geometric grid framing and adhesive fixation',
      'Crack filling, primer coat and 2 coats premium washable paint',
      'Floor covering and post-painting cleanup',
    ],
    tiers: [
      {
        id: 'tier-wall-1',
        nameEn: '1 Living Room Accent Wall Moulding',
        nameHi: '1 लिविंग रूम एक्सेंट वॉल मोल्डिंग',
        price: 1999,
        duration: '1 Day',
        recommended: true,
        desc: 'Up to 100 sq.ft feature wall with classic wainscoting panels',
      },
      {
        id: 'tier-room-1',
        nameEn: '1 Full Room Repainting (2 Coats)',
        nameHi: '1 पूरा कमरा पेंटिंग (2 कोट्स)',
        price: 2999,
        duration: '1 - 2 Days',
        recommended: false,
        desc: 'Complete 4 walls + ceiling painting with Asian Paints Royal/Tractor',
      },
      {
        id: 'tier-2bhk-paint',
        nameEn: '2 BHK Complete Home Refresh Painting',
        nameHi: '2 बीएचके संपूर्ण घर पेंटिंग',
        price: 8999,
        duration: '3 - 4 Days',
        recommended: false,
        desc: 'Full 2 BHK interior painting with free putty patching',
      },
    ],
  },

  'switchboard-wiring-fix': {
    slug: 'switchboard-wiring-fix',
    titleEn: 'Switchboard & Electrical Wiring Repair',
    titleHi: 'स्विचबोर्ड एवं इलेक्ट्रिकल वायरिंग मरम्मत',
    category: 'Electrician',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    rating: 4.91,
    reviewsCount: '52.1K',
    badge: 'Essential',
    descriptionEn:
      'Certified cooperative electricians for safe troubleshooting of burnt switchboards, short circuits, MCB tripping, and wiring replacements.',
    descriptionHi:
      'जले हुए स्विचबोर्ड, शॉर्ट सर्किट, एमसीबी ट्रिपिंग और वायरिंग बदलने के लिए प्रमाणित सहकारी इलेक्ट्रीशियन।',
    includes: [
      'Multi-meter load testing & earthing safety inspection',
      'Switch, socket, regulator & indicator replacement',
      'Safe spark-resistant copper terminal crimping',
      '30-day cooperative service warranty',
    ],
    tiers: [
      {
        id: 'tier-switch-3',
        nameEn: 'Up to 3 Switchboards Repair / Replacement',
        nameHi: '3 स्विचबोर्ड तक मरम्मत या बदलना',
        price: 349,
        duration: '45 Mins',
        recommended: true,
        desc: 'Socket replacement, loose connection fixes across 3 boards',
      },
      {
        id: 'tier-fan-install',
        nameEn: 'Ceiling Fan / Chandelier Installation',
        nameHi: 'सीलिंग फैन / झूमर इंस्टॉलेशन',
        price: 249,
        duration: '30 Mins',
        recommended: false,
        desc: 'Safe rod anchoring, wiring connection & balance check',
      },
      {
        id: 'tier-mcb-check',
        nameEn: 'Whole-House Electrical Health Checkup',
        nameHi: 'पूरे घर की इलेक्ट्रिकल सुरक्षा जांच',
        price: 599,
        duration: '1.5 Hours',
        recommended: false,
        desc: 'MCB box testing, neutral leakage check & appliance safety audit',
      },
    ],
  },

  'wooden-furniture-polish': {
    slug: 'wooden-furniture-polish',
    titleEn: 'Wooden Furniture Restoration & Polishing',
    titleHi: 'लकड़ी फर्नीचर पॉलिशिंग एवं मरम्मत',
    category: 'Carpenter',
    heroImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    rating: 4.86,
    reviewsCount: '19.8K',
    badge: 'Wood Care',
    descriptionEn:
      'Restore shine and grain texture of your valuable wooden tables, beds, and almirahs with scratch removal and premium polyurethane (PU) buffing.',
    descriptionHi:
      'खरोंच हटाने और प्रीमियम पॉलीयुरेथेन (पीयू) बफिंग के साथ अपने लकड़ी के फर्नीचर की चमक और बनावट वापस पाएं।',
    includes: [
      'Deep sanding to remove old dull lacquer and deep stains',
      'Color matching stain application to enhance natural grains',
      '2 coats of protective high-gloss or matte PU coat',
      'Anti-termite wood preservative treatment',
    ],
    tiers: [
      {
        id: 'tier-dining-polish',
        nameEn: 'Dining Table + 4 Chairs Polishing',
        nameHi: 'डाइनिंग टेबल + 4 कुर्सियां पॉलिशिंग',
        price: 799,
        duration: '2 Hours',
        recommended: true,
        desc: 'Scratch removal, wood stain rejuvenation & gloss buffing',
      },
      {
        id: 'tier-bed-polish',
        nameEn: 'Double Bed & 2 Side Tables Polish',
        nameHi: 'डबल बेड एवं 2 साइड टेबल पॉलिश',
        price: 999,
        duration: '2.5 Hours',
        recommended: false,
        desc: 'Headboard detailing, termite treatment & polyurethane coat',
      },
      {
        id: 'tier-wardrobe-polish',
        nameEn: 'Large Wooden Wardrobe (3-Door) Restaining',
        nameHi: 'बड़ा 3-डोर वॉर्डरोब री-स्टेनिंग',
        price: 1499,
        duration: '3.5 Hours',
        recommended: false,
        desc: 'Complete exterior buffing, scratch filling & lacquer spray',
      },
    ],
  },
};

const ServicePackageDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { socket } = useSocket();

  // Find the selected service package or fallback to deep cleaning
  const pkgData = PACKAGES_DATABASE[slug] || PACKAGES_DATABASE['full-home-deep-cleaning'];

  const urlLocation = searchParams.get('location') || '';
  const [selectedTier, setSelectedTier] = useState(pkgData.tiers[1] || pkgData.tiers[0]);

  // Booking Form State
  const [address, setAddress] = useState(urlLocation || user?.address || 'Pocket B, Mayur Vihar / ABES Region');
  const [city, setCity] = useState(user?.city || (urlLocation.toLowerCase().includes('ghaziabad') ? 'Ghaziabad' : urlLocation.toLowerCase().includes('gurgaon') ? 'Gurgaon' : urlLocation.toLowerCase().includes('noida') ? 'Noida' : 'Delhi'));
  const [pincode, setPincode] = useState(user?.pincode || (urlLocation.toLowerCase().includes('abes') ? '201009' : urlLocation.toLowerCase().includes('mayur') ? '110091' : '110001'));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Live Broadcast State after Booking
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [broadcastBooking, setBroadcastBooking] = useState(null);
  const [broadcastAcceptedWorker, setBroadcastAcceptedWorker] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('customer@sevasetu.org');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { login } = useAuth();

  // Update tier if package changes
  useEffect(() => {
    setSelectedTier(pkgData.tiers.find((t) => t.recommended) || pkgData.tiers[0]);
  }, [slug]);

  // Socket listener for live worker acceptance
  useEffect(() => {
    if (!socket || !broadcastBooking) return;

    const handleStatusChanged = (updated) => {
      if (updated && updated._id === broadcastBooking._id && updated.status === 'accepted') {
        setBroadcastAcceptedWorker(updated.worker);
      }
    };

    socket.on('booking_status_changed', handleStatusChanged);
    return () => {
      socket.off('booking_status_changed', handleStatusChanged);
    };
  }, [socket, broadcastBooking]);

  const executeDispatch = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const payload = {
        packageTitle: `${language === 'hi' ? pkgData.titleHi : pkgData.titleEn} (${language === 'hi' ? selectedTier.nameHi : selectedTier.nameEn})`,
        category: pkgData.category,
        price: selectedTier.price,
        date,
        timeSlot,
        address,
        city,
        pincode,
        notes: notes || `Service Package: ${selectedTier.nameEn}`,
      };

      const res = await api.post('/bookings/broadcast', payload);
      if (res.data.success) {
        setBroadcastBooking(res.data.data);
        setBroadcastActive(true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        setBookingError(err.response?.data?.message || 'Failed to dispatch broadcast booking request. Please check details.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBroadcastBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    await executeDispatch();
  };

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(authEmail, authPassword);
      setShowAuthModal(false);
      await executeDispatch();
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-teal-700 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span>/</span>
          <Link to="/explore-services" className="hover:text-teal-700">
            Services
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">
            {language === 'hi' ? pkgData.titleHi : pkgData.titleEn}
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 text-white">
          <div className="relative h-64 sm:h-80 w-full">
            <img
              src={pkgData.heroImage}
              alt={pkgData.titleEn}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider">
                  {pkgData.badge}
                </span>
                <span className="px-3 py-1 bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> 100% Cooperative Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {language === 'hi' ? pkgData.titleHi : pkgData.titleEn}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {language === 'hi' ? pkgData.descriptionHi : pkgData.descriptionEn}
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs">
                <span className="flex items-center gap-1 font-extrabold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {pkgData.rating}
                  <span className="text-slate-300 font-normal">({pkgData.reviewsCount} verified reviews)</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-teal-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Broadcast to All Nearby Workers
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right shrink-0">
              <p className="text-[11px] text-teal-200 font-semibold uppercase">Pricing Starts At</p>
              <p className="text-2xl sm:text-3xl font-black text-white">₹{pkgData.tiers[0].price}</p>
              <span className="text-[10px] text-slate-300 font-medium">Standard Cooperative Wage Floor</span>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN LAYOUT: PACKAGES + BROADCAST BOOKING BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Tiers & Inclusions (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Package Option */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Select Service Package
                </h2>
                <span className="text-xs text-slate-500 font-medium">Step 1 of 2</span>
              </div>

              <div className="space-y-3">
                {pkgData.tiers.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {tier.recommended && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase shadow-xs">
                          Most Popular Choice
                        </span>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedTier(tier)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                          />
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {language === 'hi' ? tier.nameHi : tier.nameEn}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 pl-6">{tier.desc}</p>
                        <p className="text-[11px] text-teal-700 font-bold pl-6 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Duration: {tier.duration}
                        </p>
                      </div>

                      <div className="sm:text-right pl-6 sm:pl-0">
                        <p className="text-xl font-black text-slate-900">₹{tier.price}</p>
                        <span className="text-[10px] text-slate-500 font-medium">All inclusive</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What's Included Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                What's Included in this Cooperative Service
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {pkgData.includes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900 space-y-0.5">
                  <p className="font-bold">Democratic Cooperative Wage Protection</p>
                  <p className="text-[11px] text-teal-800">
                    100% of your service fee goes directly to the cooperative worker. No corporate commissions or wage-cutting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Broadcast Booking Dispatch (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            {!broadcastActive ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                    Step 2: Instant Dispatch
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Broadcast Job Request</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Request goes instantly to all nearby verified {pkgData.category} workers.
                  </p>
                </div>

                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <form onSubmit={handleBroadcastBooking} className="space-y-4">
                  {/* Selected Package Summary */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Selected Option:</span>
                      <p className="font-extrabold text-xs text-slate-900">{selectedTier.nameEn}</p>
                    </div>
                    <span className="text-lg font-black text-teal-800">₹{selectedTier.price}</span>
                  </div>

                  {/* Address / Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Your Service Address / Landmark <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="e.g. Flat 402, Near ABES College, Ghaziabad"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Region</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        placeholder="e.g. Ghaziabad / Delhi"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        placeholder="e.g. 201009 / 110091"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Date & Slot */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                      >
                        <option value="08:00 AM - 11:00 AM">08:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 02:00 PM">11:00 AM - 02:00 PM</option>
                        <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                        <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Specific notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Instructions for Worker (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Bring extra ladder, gate code is 1234, deep cleaning required for kitchen..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {/* Cooperative Notice */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-950 flex items-start gap-2">
                    <Radio className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                    <span>
                      <strong>Broadcast Dispatch:</strong> Your request will ping all verified {pkgData.category} workers in <strong>{city} ({address})</strong>. The first worker to accept will be dispatched to your location!
                    </span>
                  </div>

                  {/* Book Button */}
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {bookingLoading ? (
                      <span>Dispatching to Nearby Workers...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Book {selectedTier.nameEn} (₹{selectedTier.price})
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* LIVE BROADCAST STATUS SCREEN */
              <div className="bg-white rounded-3xl border border-teal-200 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center border-4 border-teal-200 animate-pulse">
                    <Radio className="w-8 h-8 text-teal-700 animate-spin" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {broadcastAcceptedWorker ? 'Worker Assigned!' : 'Broadcasting Job Request...'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Booking ID: <strong className="text-slate-800">#{broadcastBooking?.bookingId}</strong>
                  </p>
                </div>

                {!broadcastAcceptedWorker ? (
                  <div className="p-5 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <Users className="w-4 h-4 text-teal-700" />
                      <span>Broadcasting to Verified Workers in {city}</span>
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed">
                      All approved cooperative {pkgData.category} workers around <strong>{address}</strong> have received your request on their worker dashboard and are reviewing it right now.
                    </p>
                    <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  /* WORKER ACCEPTED CARD */
                  <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={broadcastAcceptedWorker.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                        alt={broadcastAcceptedWorker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900">{broadcastAcceptedWorker.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-xs text-slate-600">{broadcastAcceptedWorker.phone || '+91 9811234567'}</p>
                        <span className="text-[10px] font-bold text-emerald-700">⭐ 4.9 Verified Cooperative Cleaner</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex gap-2">
                      <a
                        href={`tel:${broadcastAcceptedWorker.phone || '9811234567'}`}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Worker
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Link
                    to="/my-bookings"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center block"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBroadcastActive(false)}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 underline block text-center cursor-pointer"
                  >
                    Book another service
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK LOGIN MODAL FOR SEAMLESS 1-CLICK DISPATCH */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">Login to Dispatch Service</h3>
                <p className="text-xs text-teal-200">Authenticate your customer account to book</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-teal-200 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900">Demo Customer Account:</span>
                <p className="text-slate-700">customer@sevasetu.org / password123</p>
              </div>

              <form onSubmit={handleQuickLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="w-1/3 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {authLoading ? 'Signing in...' : 'Sign in & Dispatch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackageDetail;
