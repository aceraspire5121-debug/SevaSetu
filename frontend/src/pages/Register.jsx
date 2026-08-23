import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  HeartHandshake,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileCheck,
  Eye,
  FileText,
  Lock,
  Camera,
  User,
  Sparkles,
  ShieldAlert,
  Scan,
  XCircle,
  RefreshCw,
  FileWarning,
  Crown,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Key,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  // Roles: 'customer', 'worker', 'societyAdmin', 'federationAdmin'
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80');
  const [customPhotoUploaded, setCustomPhotoUploaded] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Worker Mandatory Document State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [idDocumentName, setIdDocumentName] = useState('');
  const [idDocumentBase64, setIdDocumentBase64] = useState('');
  const [idDocumentFile, setIdDocumentFile] = useState(null);

  // Document Verification State
  const [aiVerifying, setAiVerifying] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detectedDocType, setDetectedDocType] = useState('');

  // Worker Specific State
  const [societies, setSocieties] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(250);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);

  // Admin Specific State
  const [adminDesignation, setAdminDesignation] = useState('Society Secretary');
  const [federationCode, setFederationCode] = useState('');

  // Form State
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [socRes, catRes] = await Promise.all([
        api.get('/societies'),
        api.get('/categories'),
      ]);

      if (socRes.data.success && socRes.data.data.length > 0) {
        setSocieties(socRes.data.data);
        setSelectedSocietyId(socRes.data.data[0]._id);
      }

      if (catRes.data.success && catRes.data.data.length > 0) {
        setCategoriesList(catRes.data.data);
        setSelectedCategories([catRes.data.data[0].name]);
      }
    } catch (err) {
      console.error('Error loading societies/categories:', err);
    }
  };

  const handleCategoryToggle = (catName) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const currentMinWageFloor = categoriesList
    .filter((cat) => selectedCategories.includes(cat.name))
    .reduce((max, cat) => Math.max(max, cat.minHourlyRate || 150), 150);

  // Profile Photo File Upload Handler
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile photo size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.post('/upload', {
          image: reader.result,
          folder: 'sevasetu/profiles',
        });
        if (res.data.success) {
          setProfilePhoto(res.data.url);
          setCustomPhotoUploaded(true);
        }
      } catch (err) {
        console.error('Cloudinary profile upload error:', err);
        setProfilePhoto(reader.result);
        setCustomPhotoUploaded(true);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Real OCR Aadhaar Verification & File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Document file size must be less than 5MB');
      return;
    }

    setAiVerifying(true);
    setAiVerificationResult(null);
    setIdDocumentName('');
    setIdDocumentBase64('');
    setIdDocumentFile(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Payload = reader.result;

        const res = await api.post('/ai/verify-aadhaar', {
          image: base64Payload,
          claimedAadhaarNumber: aadhaarNumber,
          workerName: name,
        });

        if (res.data.success && res.data.isValid) {
          setIdDocumentName(file.name);
          setIdDocumentFile(file);
          setIdDocumentBase64(res.data.url || base64Payload);
          setAiVerificationResult(res.data);

          setFieldErrors((prev) => {
            const next = { ...prev };
            delete next.idDocument;
            return next;
          });
        } else {
          setIdDocumentName('');
          setIdDocumentBase64('');
          setIdDocumentFile(null);
          setAiVerificationResult(null);
          setRejectionReason(
            res.data.message ||
              'The uploaded image was scanned and does not match an official UIDAI Aadhaar Card. Please ensure you upload a clear photo of your original Aadhaar Card.'
          );
          setDetectedDocType(res.data.detectedType || 'Invalid Image');
          setShowRejectionModal(true);
        }
      } catch (err) {
        console.error('Aadhaar verification error:', err);
        setRejectionReason(
          err.response?.data?.message ||
            'Document verification could not authenticate this document. Please upload a clear photo of your Aadhaar Card.'
        );
        setDetectedDocType('Unverified Document');
        setShowRejectionModal(true);
      } finally {
        setAiVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Format Aadhaar Number as XXXX-XXXX-XXXX
  const handleAadhaarChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = val.replace(/(\d{4})(\d{4})?(\d{4})?/, function (match, p1, p2, p3) {
      let res = p1;
      if (p2) res += '-' + p2;
      if (p3) res += '-' + p3;
      return res;
    });
    setAadhaarNumber(formatted);
  };

  const validateForm = () => {
    const errors = {};

    if (!name || name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s\.\-\(\)]+$/.test(name)) {
      errors.name = 'Name contains invalid characters';
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address (e.g. user@domain.com)';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    const phoneClean = phone.replace(/\D/g, '').slice(-10);
    if (!phoneClean || !/^[6-9]\d{9}$/.test(phoneClean)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9';
    }

    if (!city || city.trim().length < 2) {
      errors.city = 'Please enter a valid city name';
    }

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      errors.pincode = 'Please enter a valid 6-digit Indian postal pincode (e.g. 400001)';
    }

    if (!address || address.trim().length < 5) {
      errors.address = 'Please enter a complete address (at least 5 characters)';
    }

    if (role === 'worker') {
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar Card Number';
      }

      if (!idDocumentBase64 && !idDocumentName) {
        errors.idDocument = 'Mandatory: You MUST upload an authenticated Aadhaar Card image/PDF!';
      }

      if (!selectedSocietyId) {
        errors.societyId = 'Please select a registered Labour Cooperative Society';
      }

      if (selectedCategories.length === 0) {
        errors.categories = 'Please select at least one service category';
      }

      if (Number(hourlyRate) < currentMinWageFloor) {
        errors.hourlyRate = `Rate cannot be lower than the admin minimum fair wage floor of ₹${currentMinWageFloor}/hr`;
      }

      if (!bio || bio.trim().length < 10) {
        errors.bio = 'Worker bio / skill description must be at least 10 characters long';
      }
    }

    if (role === 'societyAdmin') {
      if (!selectedSocietyId) {
        errors.societyId = 'Please select the Labour Cooperative Society you represent';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please resolve the highlighted validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formattedDocString = `Aadhaar Verified (${aadhaarNumber}) | Doc: ${idDocumentName || 'Uploaded File'}`;

      const payload = {
        name,
        email,
        password,
        phone,
        role,
        city,
        pincode,
        address,
        profilePhoto,
        idProofDocument: role === 'worker' ? (idDocumentBase64 || formattedDocString) : `${role} Verified`,
        aadhaarNumber: role === 'worker' ? aadhaarNumber : '',
        ...(role === 'worker' && {
          societyId: selectedSocietyId,
          categories: selectedCategories,
          hourlyRate: Number(hourlyRate),
          bio,
          experienceYears: Number(experienceYears),
        }),
        ...(role === 'societyAdmin' && {
          societyId: selectedSocietyId,
        }),
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'worker') {
          navigate('/worker-pending');
        } else if (role === 'societyAdmin') {
          navigate('/society-dashboard');
        } else if (role === 'federationAdmin') {
          navigate('/federation-dashboard');
        } else {
          navigate('/explore-services');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = [
    {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Book household services',
      icon: User,
      badge: 'Households',
      color: 'teal',
    },
    {
      id: 'worker',
      title: 'Cooperative Worker',
      subtitle: 'Democratic ownership & fair wage',
      icon: Briefcase,
      badge: 'Fair Wage Floor',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-[90vh] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Urban-Style Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 mx-auto flex items-center justify-center border border-teal-400/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Create your {t('brand')} Account</h2>
            <p className="text-xs text-teal-200 max-w-md mx-auto">
              Democratic Labour Cooperative Platform for Customers & Verified Cooperative Workers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. ROLE SWITCHER 2-CARD GRID (Customer & Cooperative Worker only) */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Select Registration Role <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleConfigs.map((rc) => {
                const Icon = rc.icon;
                const isSelected = role === rc.id;
                return (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => {
                      setRole(rc.id);
                      setFieldErrors({});
                    }}
                    className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-600 shadow-md ring-2 ring-teal-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </div>

                    <div>
                      <h4 className={`text-xs font-black ${isSelected ? 'text-teal-950' : 'text-slate-900'}`}>
                        {rc.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{rc.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PROFILE PHOTO CARD (Urban Company Avatar Element) */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={profilePhoto}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-teal-600 shadow-sm"
              />
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <label className="block text-xs font-bold text-slate-800">
                {customPhotoUploaded ? 'Profile Picture Uploaded ✅' : 'Upload Profile Photo (Optional)'}
              </label>
              <p className="text-[11px] text-slate-500">
                Upload your actual face photo from device gallery/camera (JPG, PNG - Max 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                disabled={uploadingPhoto}
                className="block text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. SECTION: PERSONAL & ACCOUNT DETAILS (Nested Element Card) */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2.5">
              <User className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">1. Personal & Contact Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Verma"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.name && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.email && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.password ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.password && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.phone && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.phone}</p>}
              </div>
            </div>
          </div>

          {/* 4. SECTION: LOCATION & ADDRESS */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">2. Location & Address</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.city ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.city && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  6-Digit Postal Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 400001"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.pincode ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.pincode && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.pincode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Residential Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat/House No., Building, Street Name, Locality..."
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none transition-colors ${
                  fieldErrors.address ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                }`}
              />
              {fieldErrors.address && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.address}</p>}
            </div>
          </div>

          {/* 5. ROLE-SPECIFIC CARD: WORKER (Aadhaar, Verification, Categories, Rate Floor) */}
          {role === 'worker' && (
            <div className="p-6 bg-teal-50/60 border border-teal-200 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                <div className="flex items-center gap-2 text-teal-950">
                  <Building2 className="w-5 h-5 text-teal-700" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">
                    3. Worker Identity & Cooperative Credentials
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full border border-teal-200">
                  Document Verified
                </span>
              </div>

              {/* 12-Digit Aadhaar Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  12-Digit Aadhaar Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  placeholder="XXXX-XXXX-XXXX"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-bold tracking-widest outline-none transition-colors ${
                    fieldErrors.aadhaarNumber ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.aadhaarNumber && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.aadhaarNumber}</p>}
              </div>

              {/* Document Upload Box with OCR Verification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Aadhaar Card (Image/PDF) <span className="text-red-500">*</span>
                </label>

                <div
                  className={`relative p-5 border-2 border-dashed rounded-2xl text-center space-y-3 transition-all ${
                    fieldErrors.idDocument
                      ? 'border-red-400 bg-red-50/40'
                      : aiVerificationResult?.isValid
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                      : 'border-teal-400 bg-white hover:bg-teal-50/40'
                  }`}
                >
                  {aiVerifying ? (
                    <div className="py-4 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-teal-500 text-teal-700 flex items-center justify-center mx-auto animate-pulse">
                        <Scan className="w-6 h-6 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                          Validating Document...
                        </h4>
                        <p className="text-[11px] text-teal-700 mt-0.5">
                          Please wait while we verify your Aadhaar document
                        </p>
                      </div>
                      <div className="w-48 h-1.5 bg-teal-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full animate-[progress_1s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  ) : aiVerificationResult?.isValid ? (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-emerald-900 text-left">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs text-emerald-950 block">
                            Verified Official Aadhaar Card ✅
                          </span>
                          <p className="text-[11px] text-emerald-800 font-medium truncate max-w-xs mt-0.5">
                            {idDocumentName || 'Aadhaar_Document_Verified.jpg'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAiVerificationResult(null);
                          setIdDocumentName('');
                          setIdDocumentBase64('');
                          setIdDocumentFile(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-teal-600 mx-auto animate-bounce" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Click to select or drag & drop Aadhaar Card file
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supports JPG, PNG, WEBP, or PDF (Max 5MB)
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={aiVerifying}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer disabled:opacity-50"
                      />
                    </>
                  )}
                </div>
                {fieldErrors.idDocument && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.idDocument}</p>}
              </div>

              {/* Society Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Affiliated Labour Cooperative Society <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  {societies.map((soc) => (
                    <option key={soc._id} value={soc._id}>
                      {soc.name} ({soc.city} - {soc.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Category Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Categories (Select all that apply) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categoriesList.map((cat) => {
                    const isSel = selectedCategories.includes(cat.name);
                    return (
                      <button
                        type="button"
                        key={cat._id}
                        onClick={() => handleCategoryToggle(cat.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {cat.name} (Floor: ₹{cat.minHourlyRate})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rate & Wage Floor Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Hourly / Per-Job Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min={currentMinWageFloor}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-bold outline-none ${
                      fieldErrors.hourlyRate ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                    }`}
                  />
                  {fieldErrors.hourlyRate ? (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.hourlyRate}</p>
                  ) : (
                    <p className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      Admin Minimum Fair Wage Floor: ₹{currentMinWageFloor}/hr
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min={0}
                    max={50}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Worker Bio / Skill Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Describe your expertise and cooperative work experience (Min 10 characters)..."
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm outline-none ${
                    fieldErrors.bio ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                  }`}
                />
                {fieldErrors.bio && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.bio}</p>}
              </div>
            </div>
          )}

          {/* 6. ROLE-SPECIFIC CARD: SOCIETY ADMIN */}
          {role === 'societyAdmin' && (
            <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-blue-950 border-b border-blue-200 pb-3">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  3. Society Administration Assignment
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Labour Cooperative Society to Govern <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {societies.map((soc) => (
                    <option key={soc._id} value={soc._id}>
                      {soc.name} ({soc.city} - Society Code: {soc.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700 mt-1">
                  You will manage registrations, verify worker IDs, and set fair wage floors for this society.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Designation</label>
                <input
                  type="text"
                  value={adminDesignation}
                  onChange={(e) => setAdminDesignation(e.target.value)}
                  placeholder="e.g. Society Secretary / Executive Officer"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* 7. ROLE-SPECIFIC CARD: FEDERATION ADMIN */}
          {role === 'federationAdmin' && (
            <div className="p-6 bg-purple-50/60 border border-purple-200 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-purple-950 border-b border-purple-200 pb-3">
                <Crown className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  3. Federation Directorate Verification
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Federation Authorization Key (Demo: FED2026)
                </label>
                <input
                  type="text"
                  value={federationCode}
                  onChange={(e) => setFederationCode(e.target.value)}
                  placeholder="Enter federation authorization passkey..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-[11px] text-purple-700 mt-1">
                  Federation Admins have access to cross-society demand forecasting, AI analytics, and society onboarding.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Validating & Registering...' : `Complete ${roleConfigs.find((r) => r.id === role)?.title} Registration`}
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-700 hover:underline">
              {t('login')} here
            </Link>
          </p>
        </form>
      </div>

      {/* AI REJECTION POPUP MODAL */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-200 text-center animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="w-16 h-16 bg-red-100 border-4 border-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-extrabold rounded-full border border-red-200 mb-2">
                <FileWarning className="w-3.5 h-3.5" />
                Document Verification Failed
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Not Identified as Aadhaar Card
              </h3>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl text-left space-y-2">
              <p className="text-xs text-red-900 font-semibold leading-relaxed">
                {rejectionReason}
              </p>
              <div className="pt-2 border-t border-red-200/60 text-[11px] text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="text-red-500">✕</span> Random photos, selfies or blank papers are rejected.
                </p>
                <p className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="text-emerald-600">✓</span> Must be a clear photo of your official Aadhaar Card.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRejectionModal(false)}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Re-upload Aadhaar Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
