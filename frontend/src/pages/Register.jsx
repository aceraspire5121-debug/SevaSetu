import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Building2,
  Lock,
  Camera,
  User,
  Sparkles,
  ShieldAlert,
  Scan,
  RefreshCw,
  FileWarning,
  Briefcase,
  ChevronRight,
  Check,
} from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  // Roles: 'customer', 'worker'
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

  // Document Verification State
  const [aiVerifying, setAiVerifying] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Worker Specific State
  const [societies, setSocieties] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(250);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);

  // Skill Passport & Certificate State
  const [certificateTitle, setCertificateTitle] = useState('Vocational Technical Competency Certificate');
  const [certificateIssuer, setCertificateIssuer] = useState('National Skill Development Corporation (NSDC)');
  const [certificateYear, setCertificateYear] = useState(2024);
  const [trainingInstitute, setTrainingInstitute] = useState('Government ITI / Skill India Partner');
  const [specialization, setSpecialization] = useState('Residential & Commercial Maintenance');
  const [certificateDocName, setCertificateDocName] = useState('');
  const [certificateBase64, setCertificateBase64] = useState('');

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

    if (file.size > 8 * 1024 * 1024) {
      alert('File size must be under 8MB');
      return;
    }

    setIdDocumentName(file.name);
    setAiVerifying(true);
    setAiVerificationResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result;
      setIdDocumentBase64(base64Content);

      try {
        const res = await api.post('/ai/verify-aadhaar', {
          image: base64Content,
          claimedAadhaarNumber: aadhaarNumber,
          workerName: name,
        });

        if (res.data.success && res.data.isValid) {
          setAiVerificationResult({
            status: 'verified',
            extractedAadhaar: res.data.extractedData?.aadhaarNumber || aadhaarNumber,
            extractedName: res.data.extractedData?.name || name,
            message: res.data.message || 'Authentic Aadhaar Card verified successfully.',
          });
          setFieldErrors((prev) => ({ ...prev, idDocument: null }));
        } else {
          setAiVerificationResult({
            status: 'rejected',
            message: res.data.message || 'Document verification failed.',
          });
          setIdDocumentBase64('');
          setIdDocumentName('');
          setRejectionReason(
            res.data.message ||
              'The uploaded image was scanned and does not match an official UIDAI Aadhaar Card. Please ensure you upload a clear photo of your original Aadhaar Card.'
          );
          setShowRejectionModal(true);
        }
      } catch (err) {
        console.error('Aadhaar verification error:', err);
        setRejectionReason(
          err.response?.data?.message ||
            'Document verification could not authenticate this document. Please upload a clear photo of your Aadhaar Card.'
        );
        setShowRejectionModal(true);
      } finally {
        setAiVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    const phoneClean = phone.replace(/\D/g, '').slice(-10);
    if (!phoneClean || !/^[6-9]\d{9}$/.test(phoneClean)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!city || city.trim().length < 2) {
      errors.city = 'Please enter your city';
    }

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      errors.pincode = 'Please enter a valid 6-digit postal pincode';
    }

    if (!address || address.trim().length < 5) {
      errors.address = 'Please enter complete street address';
    }

    if (role === 'worker') {
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar Card Number';
      }

      if (!idDocumentBase64 && !idDocumentName) {
        errors.idDocument = 'Please upload a clear photo of your Aadhaar Card';
      }

      if (!selectedSocietyId) {
        errors.societyId = 'Please select a registered Labour Cooperative Society';
      }

      if (selectedCategories.length === 0) {
        errors.categories = 'Please select at least one service category';
      }

      if (Number(hourlyRate) < currentMinWageFloor) {
        errors.hourlyRate = `Rate cannot be lower than minimum fair wage floor of ₹${currentMinWageFloor}/hr`;
      }

      if (!bio || bio.trim().length < 10) {
        errors.bio = 'Worker bio / skill description must be at least 10 characters';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);

    try {
      const phoneClean = phone.replace(/\D/g, '').slice(-10);
      const payload = {
        name,
        email,
        password,
        phone: phoneClean,
        role,
        city,
        pincode,
        address,
        profilePhoto,
        idProofDocument: role === 'worker' ? (idDocumentBase64 || idDocumentName) : `${role} Verified`,
        aadhaarNumber: role === 'worker' ? aadhaarNumber : '',
        ...(role === 'worker' && {
          societyId: selectedSocietyId,
          categories: selectedCategories,
          hourlyRate: Number(hourlyRate),
          bio,
          experienceYears: Number(experienceYears),
          certificateTitle,
          certificateIssuer,
          certificateYear: Number(certificateYear),
          trainingInstitute,
          specialization,
          certificateUrl: certificateBase64 || certificateDocName,
        }),
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'worker') {
          navigate('/worker-pending');
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
    },
    {
      id: 'worker',
      title: 'Cooperative Worker',
      subtitle: 'Democratic ownership & fair wage',
      icon: Briefcase,
    },
  ];

  return (
    <div className="min-h-[85vh] bg-white flex flex-col justify-between items-center px-4 py-8 font-sans">
      <div className="w-full max-w-xl mx-auto space-y-5">
        
        {/* 1. Centered Brand Logo (Matching Screenshot 3) */}
        <div className="flex justify-center pt-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-base tracking-wider font-sans select-none">
                SS
              </span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              SevaSetu
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </span>
          </Link>
        </div>

        {/* 2. Amazon-style Clean Registration Card */}
        <div className="bg-white border border-slate-300/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Join the democratic home services cooperative network
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selector 2-Card Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Select Registration Role <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-700 ring-1 ring-teal-700 shadow-2xs'
                          : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50/60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 truncate">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isSelected ? 'text-teal-950' : 'text-slate-900'}`}>
                            {rc.title}
                          </h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{rc.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={profilePhoto}
                  alt="Profile Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-2xs"
                />
                {customPhotoUploaded && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Profile Photo (Optional)</p>
                <p className="text-[11px] text-slate-500">Upload your face photo (JPG, PNG - Max 5MB)</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <label className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer shadow-2xs transition-colors">
                    {uploadingPhoto ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                    {customPhotoUploaded ? 'Photo uploaded ✓' : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. PERSONAL & CONTACT DETAILS */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                1. Personal & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.name && <p className="text-[10px] text-red-600">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-[10px] text-red-600">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.password && <p className="text-[10px] text-red-600">{fieldErrors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Mobile Number (10 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.phone && <p className="text-[10px] text-red-600">{fieldErrors.phone}</p>}
                </div>
              </div>
            </div>

            {/* 2. LOCATION & ADDRESS */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                2. Location & Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.city ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.city && <p className="text-[10px] text-red-600">{fieldErrors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    6-Digit Postal Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 400001"
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                      fieldErrors.pincode ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.pincode && <p className="text-[10px] text-red-600">{fieldErrors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Residential Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No., Building, Street Name, Locality..."
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none ${
                    fieldErrors.address ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.address && <p className="text-[10px] text-red-600">{fieldErrors.address}</p>}
              </div>
            </div>

            {/* 3. WORKER SPECIFIC DETAILS (Rendered only if role === 'worker') */}
            {role === 'worker' && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  3. Cooperative Worker Profile & Verification
                </h3>

                {/* Society Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Select Labour Cooperative Society <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSocietyId}
                    onChange={(e) => setSelectedSocietyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-teal-700 outline-none"
                  >
                    {societies.map((soc) => (
                      <option key={soc._id} value={soc._id}>
                        {soc.name} ({soc.city}) - Code: {soc.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Skill Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Select Your Service Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoriesList.map((cat) => {
                      const isSel = selectedCategories.includes(cat.name);
                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => handleCategoryToggle(cat.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {cat.name} (Min ₹{cat.minHourlyRate || 150}/hr)
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hourly Rate & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Hourly Rate (₹/hr) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      min={currentMinWageFloor}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    />
                    <p className="text-[10px] text-teal-700">Minimum wage floor: ₹{currentMinWageFloor}/hr</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      min={0}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    />
                  </div>
                </div>

                {/* Worker Bio */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Worker Bio / Expertise Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your repair, maintenance or service experience..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none resize-none"
                  />
                </div>

                {/* 3.1 SKILL PASSPORT & VOCATIONAL CERTIFICATES */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-teal-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      Digital Skill Passport & Vocational Certificates
                    </label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      Skill India / NSDC
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Certificate / Trade Qualification Title
                      </label>
                      <input
                        type="text"
                        value={certificateTitle}
                        onChange={(e) => setCertificateTitle(e.target.value)}
                        placeholder="e.g. NTC Electrician / AC Technician"
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Issuing Authority / Board
                      </label>
                      <input
                        type="text"
                        value={certificateIssuer}
                        onChange={(e) => setCertificateIssuer(e.target.value)}
                        placeholder="e.g. NSDC / NCVT / Govt ITI"
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Training Institute / Vocational Center
                      </label>
                      <input
                        type="text"
                        value={trainingInstitute}
                        onChange={(e) => setTrainingInstitute(e.target.value)}
                        placeholder="e.g. Delhi Govt Industrial Training Institute"
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Year of Issuance
                      </label>
                      <input
                        type="number"
                        value={certificateYear}
                        onChange={(e) => setCertificateYear(e.target.value)}
                        min={1980}
                        max={2026}
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Primary Specialization Area
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Inverter Wiring, DB Box, Heavy Load Circuits"
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Upload Certificate Document (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-300 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-teal-700" />
                        Choose Certificate
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) {
                              setCertificateDocName(f.name);
                              const reader = new FileReader();
                              reader.onloadend = () => setCertificateBase64(reader.result);
                              reader.readAsDataURL(f);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-600 truncate max-w-[200px]">
                        {certificateDocName || 'No certificate uploaded yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aadhaar Card Number & Real OCR Verification */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">
                      12-Digit Aadhaar Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={handleAadhaarChange}
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={14}
                      className="w-full px-3 py-2 border border-amber-300 bg-white rounded-xl text-xs font-mono focus:ring-1 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Upload Aadhaar Card Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        {aiVerifying ? 'Scanning OCR...' : 'Choose Aadhaar Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-amber-900 truncate max-w-[200px]">
                        {idDocumentName || 'No document selected'}
                      </span>
                    </div>
                  </div>

                  {aiVerificationResult?.status === 'verified' && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{aiVerificationResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || aiVerifying}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Complete {role === 'worker' ? 'Worker' : 'Customer'} Registration</span>
              )}
            </button>
          </form>

          {/* Legal / Policy Note */}
          <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
            By creating an account, you agree to SevaSetu's{' '}
            <span className="text-teal-700 hover:underline cursor-pointer">Conditions of Use</span> and{' '}
            <span className="text-teal-700 hover:underline cursor-pointer">Privacy Notice</span>.
          </p>

          <hr className="border-slate-200" />

          {/* Login Link */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-700 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Amazon-style Footer Links */}
      <footer className="w-full max-w-xl mx-auto text-center pt-8 pb-2 space-y-2 border-t border-slate-100 mt-6">
        <div className="flex items-center justify-center gap-6 text-xs text-teal-700 font-semibold">
          <Link to="/" className="hover:underline">Conditions of Use</Link>
          <Link to="/" className="hover:underline">Privacy Notice</Link>
          <Link to="/" className="hover:underline">Help</Link>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 SevaSetu Cooperative Home Services Platform. All rights reserved.
        </p>
      </footer>

      {/* AI REJECTION POPUP MODAL */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-red-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Document Verification Failed</h3>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">{rejectionReason}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRejectionModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Re-upload Aadhaar Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
