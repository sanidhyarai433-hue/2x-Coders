import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import indiaData from '../assets/india_states_districts.json';
import { 
  User, Phone, MapPin, ShieldAlert, Check, RefreshCw, 
  ArrowLeft, Edit, Save, X, Sparkles, Upload, Lock
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  // Edit Mode Switch
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form states
  const [fullName, setFullName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlockOrMunicipality, setSelectedBlockOrMunicipality] = useState('');
  const [address, setAddress] = useState('');
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  
  // Non-editable Phone / Country
  const phone = user?.phone || '9876543210';
  const country = user?.country || 'India 🇮🇳';
  const profileImage = user?.profileImage || '';

  // Initialize form values from user context
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Citizen Name');
      setSelectedState(user.state || '');
      setSelectedDistrict(user.district || '');
      setSelectedBlockOrMunicipality(user.blockOrMunicipality || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load districts cascading dropdown
  useEffect(() => {
    if (selectedState) {
      const list = indiaData[selectedState] || [];
      setDistrictsList(list);
    } else {
      setDistrictsList([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  // Load blocks cascading dropdown
  useEffect(() => {
    if (selectedDistrict) {
      const customMapping = {
        "Mumbai": ["Ward A (Colaba)", "Ward B (Sandhurst Road)", "Ward D (Malabar Hill)", "Ward H-West (Bandra)", "Ward K-West (Andheri)", "Mumbai Municipal Corporation"],
        "Pune": ["Haveli Block", "Pune Municipal Corporation", "Pimpri-Chinchwad Municipal Corporation", "Shirur Block", "Khed Block"],
        "Bengaluru Rural": ["Davanagere Block", "Nelamangala Block", "Hosakote Block", "Devanahalli Block", "Doddaballapura Block"],
        "Bengaluru Urban": ["Bengaluru East Block", "Bengaluru South Block", "Bengaluru North Block", "Bruhat Bengaluru Mahanagara Palike (BBMP)"],
        "New Delhi": ["Chanakyapuri Sub-Division", "Delhi Cantonment Board", "New Delhi Municipal Council (NDMC)", "Vasant Vihar Block"],
        "Lucknow": ["Lucknow Municipal Corporation", "Bakshi Ka Talab Block", "Chinhat Block", "Malihabad Block", "Kakori Block"]
      };

      const list = customMapping[selectedDistrict] || [
        `${selectedDistrict} Central Block`,
        `${selectedDistrict} East Block`,
        `${selectedDistrict} North Block`,
        `${selectedDistrict} Municipal Council`,
        `${selectedDistrict} Rural Block`
      ];
      setBlocksList(list);
    } else {
      setBlocksList([]);
      setSelectedBlockOrMunicipality('');
    }
  }, [selectedDistrict]);

  // handle photo preview change if editing is extended, or display existing photo
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !selectedState || !selectedDistrict || !selectedBlockOrMunicipality || !address.trim()) {
      setError('Please fill in all profile fields.');
      return;
    }

    setLoading(true);
    const success = await updateProfile({
      fullName,
      state: selectedState,
      district: selectedDistrict,
      blockOrMunicipality: selectedBlockOrMunicipality,
      address,
      profileImage // Preserve original image
    });
    setLoading(false);

    if (success) {
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setSelectedState(user.state || '');
      setSelectedDistrict(user.district || '');
      setSelectedBlockOrMunicipality(user.blockOrMunicipality || '');
      setAddress(user.address || '');
    }
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-saffron-500 selection:text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-8 select-none">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-saffron-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <span className="text-[10px] font-mono tracking-widest text-saffron-500 font-bold uppercase bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
            Citizen Registry Profile
          </span>
        </div>

        <div className="glass rounded-3xl border border-slate-800/80 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Tri-color Top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-saffron-500 via-white to-ashoka-500"></div>

          {/* FEEDBACK BANNERS */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 mb-6 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-400 font-medium">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-ashoka-500/10 border border-ashoka-500/30 rounded-xl p-3 mb-6 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs text-green-400 font-medium">{successMsg}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* LEFT CONTAINER: PHOTO AVATAR DISPLAY */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={fullName} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-750 shadow-md shadow-slate-950/50"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 text-3xl font-black">
                    {fullName.charAt(0) || "C"}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-ashoka-500 border-2 border-slate-900 text-white rounded-full flex items-center justify-center text-[10px]" title="Identity Verified">
                  ✓
                </span>
              </div>
              <div className="text-center md:text-left select-none">
                <h3 className="font-extrabold text-sm text-slate-200">{fullName}</h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">Phone: +91 {phone}</p>
              </div>
            </div>

            {/* RIGHT CONTAINER: ACCOUNT PROFILE DETAILS */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-6 select-none">
                <h2 className="text-base font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  Registry Credentials
                </h2>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs font-bold text-saffron-500 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-200 border-none bg-transparent cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-1 text-xs font-bold text-ashoka-500 hover:underline border-none bg-transparent cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* PROFILE FIELDS DISPLAY / EDIT FORM */}
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Part 1: Locked Parameters */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Mobile Number (Locked)
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-xs select-all">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      +91 {phone}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Registry Country (Locked)
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <span>🇮🇳</span>
                      {country}
                    </div>
                  </div>
                </div>

                {/* Part 2: Editable Parameters */}
                <div className="space-y-4">
                  
                  {/* Full Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    {isEditing ? (
                      <div className="relative rounded-xl border border-slate-850 bg-slate-950/40 focus-within:border-slate-750 transition-all">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 bg-transparent text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="text-slate-200 text-xs font-semibold pl-1">
                        {fullName}
                      </div>
                    )}
                  </div>

                  {/* State, District & Block Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* State Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        State / UT
                      </label>
                      {isEditing ? (
                        <select
                          required
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="block w-full py-2 px-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-slate-700 text-xs"
                        >
                          <option value="">-- Choose State --</option>
                          {Object.keys(indiaData).map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-slate-200 text-xs font-semibold pl-1">
                          {selectedState || "Not specified"}
                        </div>
                      )}
                    </div>

                    {/* District Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        District / City
                      </label>
                      {isEditing ? (
                        <select
                          required
                          disabled={!selectedState}
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="block w-full py-2 px-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-slate-700 text-xs disabled:opacity-40"
                        >
                          <option value="">-- Choose District --</option>
                          {districtsList.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-slate-200 text-xs font-semibold pl-1">
                          {selectedDistrict || "Not specified"}
                        </div>
                      )}
                    </div>

                    {/* Block / Municipality Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Block / Municipality
                      </label>
                      {isEditing ? (
                        <select
                          required
                          disabled={!selectedDistrict}
                          value={selectedBlockOrMunicipality}
                          onChange={(e) => setSelectedBlockOrMunicipality(e.target.value)}
                          className="block w-full py-2 px-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-slate-700 text-xs disabled:opacity-40"
                        >
                          <option value="">-- Choose Block/Municipality --</option>
                          {blocksList.map((blk) => (
                            <option key={blk} value={blk}>{blk}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-slate-200 text-xs font-semibold pl-1">
                          {selectedBlockOrMunicipality || "Not specified"}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Address Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Residential Address Address
                    </label>
                    {isEditing ? (
                      <textarea
                        required
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="block w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-slate-700 text-xs resize-none"
                      />
                    ) : (
                      <div className="text-slate-350 text-xs leading-relaxed pl-1 whitespace-pre-line bg-slate-950/20 p-3 rounded-xl border border-slate-850/50">
                        {address || "No residential address provided."}
                      </div>
                    )}
                  </div>

                </div>

              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
