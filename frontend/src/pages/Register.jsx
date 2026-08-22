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
} from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  const [role, setRole] = useState('customer'); // 'customer' or 'worker'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  // Real Profile Photo File Upload State
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80');
  const [customPhotoUploaded, setCustomPhotoUploaded] = useState(false);

  // Mandatory Worker Document State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [idDocumentName, setIdDocumentName] = useState('');
  const [idDocumentBase64, setIdDocumentBase64] = useState('');
  const [idDocumentFile, setIdDocumentFile] = useState(null);

  // Worker specific state
  const [societies, setSocieties] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(250);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);

  // Real-time Field Errors
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
      if (selectedCategories.length === 1) return; // Must have at least 1 category
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  // Get max minimum wage floor among selected categories
  const currentMinWageFloor = categoriesList
    .filter((cat) => selectedCategories.includes(cat.name))
    .reduce((max, cat) => Math.max(max, cat.minHourlyRate || 150), 150);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Profile Photo Real File Upload Handler (Cloudinary)
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
        // Fallback to Base64
        setProfilePhoto(reader.result);
        setCustomPhotoUploaded(true);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // File Upload Handler for Aadhaar Document (Cloudinary)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Document file size must be less than 5MB');
      return;
    }

    setIdDocumentName(file.name);
    setIdDocumentFile(file);
    setUploadingDoc(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.post('/upload', {
          image: reader.result,
          folder: 'sevasetu/documents',
        });
        if (res.data.success) {
          setIdDocumentBase64(res.data.url);
        }
      } catch (err) {
        console.error('Cloudinary document upload error:', err);
        // Fallback to Base64
        setIdDocumentBase64(reader.result);
      } finally {
        setUploadingDoc(false);
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
        errors.idDocument = 'Mandatory: You MUST upload an Aadhaar Card or Government ID Document image/PDF!';
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fix the highlighted errors in the form before submitting.');
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
        idProofDocument: role === 'worker' ? (idDocumentBase64 || formattedDocString) : 'Customer Verified',
        aadhaarNumber: role === 'worker' ? aadhaarNumber : '',
        ...(role === 'worker' && {
          societyId: selectedSocietyId,
          categories: selectedCategories,
          hourlyRate: Number(hourlyRate),
          bio,
          experienceYears: Number(experienceYears),
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
      setError(err.response?.data?.message || 'Registration failed. Please check form validation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 mx-auto mb-3 flex items-center justify-center border border-teal-400/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold">{t('register')} on {t('brand')}</h2>
          <p className="text-xs text-teal-200 mt-1">Strict & Verified Registration for Customers & Cooperative Workers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Switcher Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Register As</label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setFieldErrors({});
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  role === 'customer'
                    ? 'bg-white text-teal-800 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👤 Customer (Household Services)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('worker');
                  setFieldErrors({});
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  role === 'worker'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛠 Worker (Mandatory ID Verification)
              </button>
            </div>
          </div>

          {/* REAL PROFILE PHOTO FILE UPLOAD BOX */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <img
                src={profilePhoto}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-teal-600 shadow-md"
              />
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <label className="block text-xs font-bold text-slate-800">
                {customPhotoUploaded ? 'Custom Photo Uploaded ✅' : 'Upload Real Profile Picture (Optional)'}
              </label>
              <p className="text-[11px] text-slate-500">
                Upload your actual face photo from device gallery/camera (JPG, PNG - Max 3MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="block text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Personal Info Grid */}
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
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
                placeholder="ramesh@domain.com"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                }`}
              />
              {fieldErrors.phone && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
                  fieldErrors.pincode ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
                }`}
              />
              {fieldErrors.pincode && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.pincode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Residential Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building name, street, locality..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
                fieldErrors.address ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-teal-600'
              }`}
            />
            {fieldErrors.address && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.address}</p>}
          </div>

          {/* WORKER SPECIFIC FORM SECTION (MANDATORY DOCUMENT UPLOAD & AADHAAR) */}
          {role === 'worker' && (
            <div className="p-6 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                <div className="flex items-center gap-2 text-teal-900">
                  <Building2 className="w-5 h-5 text-teal-700" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Mandatory Worker Identity Verification</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full border border-red-200">
                  Document Upload Required
                </span>
              </div>

              {/* Mandatory Aadhaar Number */}
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

              {/* Mandatory File Upload Box for Worker ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Aadhaar / Govt ID Proof Document (PDF/Image) <span className="text-red-500">*</span>
                </label>

                <div className={`p-5 border-2 border-dashed rounded-2xl bg-white text-center space-y-3 transition-colors ${
                  fieldErrors.idDocument ? 'border-red-400 bg-red-50/40' : 'border-teal-400 hover:bg-teal-50/40'
                }`}>
                  {idDocumentName ? (
                    <div className="flex items-center justify-between p-3 bg-teal-100 border border-teal-300 rounded-xl text-teal-900">
                      <div className="flex items-center gap-2 text-xs font-bold truncate">
                        <FileCheck className="w-5 h-5 text-teal-700 shrink-0" />
                        <span className="truncate">{idDocumentName}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-700 text-white rounded-full">
                        File Attached
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-teal-600 mx-auto animate-bounce" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Click to select or drag & drop Aadhaar Card / ID Proof file
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP, or PDF (Max 5MB)</p>
                      </div>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                  />
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

              {/* Multi-Select Categories */}
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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
                    Your Hourly / Per-Service Rate (₹) <span className="text-red-500">*</span>
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
                      Admin Fair Wage Floor: ₹{currentMinWageFloor}/hr
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
          >
            {loading ? 'Validating & Registering...' : `Complete ${role === 'worker' ? 'Worker' : 'Customer'} Registration`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
