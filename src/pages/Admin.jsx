import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { supabaseService } from '../lib/supabase';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('events');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    instagram_reel: '',
    show_on_homepage: false
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [hotEvents, setHotEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bank Details State
  const [bankDetails, setBankDetails] = useState({
    account_number: '',
    ifsc_code: '',
    is_confirmed: false
  });
  const [existingBankDetails, setExistingBankDetails] = useState(null);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Load hot events from database
  const loadHotEvents = async () => {
    setLoading(true);
    try {
      const events = await supabaseService.getHotEvents();
      setHotEvents(events || []);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle poster file selection
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert file to base64
  // const fileToBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = error => reject(error);
  //   });
  // };

  // Handle adding new hot event
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!eventForm.name || !eventForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let posterImageUrl = null;
      let posterImagePath = null;

      // Upload poster image if provided
      if (posterFile) {
        const uploadResult = await supabaseService.uploadPosterImage(posterFile, eventForm.name);
        posterImageUrl = uploadResult.url;
        posterImagePath = uploadResult.path;
      }

      const eventData = {
        ...eventForm,
        poster_image_url: posterImageUrl,
        poster_image_path: posterImagePath
      };

      const newEvent = await supabaseService.createHotEvent(eventData);

      setHotEvents([newEvent, ...hotEvents]);
      setEventForm({
        name: '',
        description: '',
        instagram_reel: '',
        show_on_homepage: false
      });
      setPosterFile(null);
      setPosterPreview(null);
      setShowAddEventForm(false);

      // Success animation
      gsap.fromTo('.success-message',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    } catch (err) {
      console.error('Error creating event:', err);
      setError(`Failed to create event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting event
  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      await supabaseService.deleteHotEvent(id);
      setHotEvents(hotEvents.filter(event => event.id !== id));
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle homepage visibility
  const handleToggleHomepage = async (id, currentStatus) => {
    setLoading(true);
    try {
      await supabaseService.updateHotEvent(id, { show_on_homepage: !currentStatus });
      setHotEvents(hotEvents.map(event =>
        event.id === id
          ? { ...event, show_on_homepage: !currentStatus }
          : event
      ));
    } catch (err) {
      setError('Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load bank details
  const loadBankDetails = async () => {
    try {
      const details = await supabaseService.getBankDetails();
      if (details) {
        setExistingBankDetails(details);
        setBankDetails(details);
      }
    } catch (err) {
      console.error('Error loading bank details:', err);
    }
  };

  // Handle saving bank details
  const handleSaveBankDetails = async () => {
    if (!bankDetails.account_number || !bankDetails.ifsc_code) {
      setError('Please fill in both account number and IFSC code');
      return;
    }

    if (!bankDetails.is_confirmed) {
      setError('Please confirm that the bank details are correct');
      return;
    }

    setLoading(true);
    try {
      const savedDetails = await supabaseService.saveBankDetails(bankDetails);
      setExistingBankDetails(savedDetails);
      setBankDetails(savedDetails);
      setIsEditingBank(false);
      setError(null);
    } catch (err) {
      setError('Failed to save bank details');
      console.error('Error saving bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing bank details
  const handleEditBankDetails = () => {
    setIsEditingBank(true);
    setBankDetails({ ...existingBankDetails, is_confirmed: false });
  };

  // Handle deleting bank details
  const handleDeleteBankDetails = async () => {
    if (!confirm('Are you sure you want to delete the bank details?')) return;

    setLoading(true);
    try {
      await supabaseService.deleteBankDetails();
      setExistingBankDetails(null);
      setBankDetails({ account_number: '', ifsc_code: '', is_confirmed: false });
      setIsEditingBank(false);
      setError(null);
    } catch (err) {
      setError('Failed to delete bank details');
      console.error('Error deleting bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotEvents();
    loadBankDetails();

    // Entrance animation
    gsap.fromTo('.admin-dashboard',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">SAE Admin</h1>
                <p className="text-sm text-gray-500">Hot Events Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                ● Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Panel</h3>

            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              <button
                onClick={() => setActiveSection('events')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeSection === 'events'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔥 Hot Events
              </button>
              <button
                onClick={() => setActiveSection('bank')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeSection === 'bank'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏦 Bank Details
              </button>
            </nav>

            {/* Bank Details Section */}
            {activeSection === 'bank' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Bank Information</h4>
                  {existingBankDetails && !isEditingBank && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditBankDetails}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={handleDeleteBankDetails}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>

                {existingBankDetails && !isEditingBank ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Account Number</label>
                      <p className="font-mono text-sm text-gray-900">{existingBankDetails.account_number}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">IFSC Code</label>
                      <p className="font-mono text-sm text-gray-900">{existingBankDetails.ifsc_code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        existingBankDetails.is_confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {existingBankDetails.is_confirmed ? '✅ Confirmed' : '❌ Not Confirmed'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={bankDetails.account_number}
                        onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={bankDetails.ifsc_code}
                        onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="confirmBank"
                        checked={bankDetails.is_confirmed}
                        onChange={(e) => setBankDetails({...bankDetails, is_confirmed: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="confirmBank" className="text-sm text-gray-700">
                        Confirm details are correct
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveBankDetails}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
                      >
                        💾 Save
                      </button>
                      {isEditingBank && (
                        <button
                          onClick={() => {
                            setIsEditingBank(false);
                            setBankDetails(existingBankDetails || { account_number: '', ifsc_code: '', is_confirmed: false });
                          }}
                          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">❌</div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 font-medium">Loading...</span>
            </div>
          </div>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Section 1: Add Hot Events */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">🔥</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Hot Events</h2>
                </div>
                <button
                  onClick={() => setShowAddEventForm(!showAddEventForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  {showAddEventForm ? 'Cancel' : '+ Add Hot Event'}
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Add Event Form */}
              {showAddEventForm ? (
                <form onSubmit={handleAddEvent} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Event Name</label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="e.g., BAJA Championship 2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Event Description</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Provide detailed information about the event..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Event Poster (Optional)</label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {posterPreview && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img
                            src={posterPreview}
                            alt="Poster preview"
                            className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Instagram Reel Link (Optional)</label>
                    <input
                      type="url"
                      value={eventForm.instagram_reel}
                      onChange={(e) => setEventForm({...eventForm, instagram_reel: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="https://www.instagram.com/reel/..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Show on Homepage</label>
                      <p className="text-gray-500 text-xs">Display this event on the main homepage</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEventForm({...eventForm, show_on_homepage: !eventForm.show_on_homepage})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        eventForm.show_on_homepage ? 'bg-green-600' : 'bg-red-400'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                          eventForm.show_on_homepage ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Create Hot Event
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🔥</div>
                  <p className="text-gray-500">Click "Add Hot Event" to create a new event</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Events List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📋</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">All Hot Events</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {hotEvents.length} events
                </span>
              </div>
            </div>

            <div className="p-8 max-h-[600px] overflow-y-auto">
              {hotEvents.length > 0 ? (
                <div className="space-y-4">
                  {hotEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {event.poster_image_url && (
                            <div className="mb-3">
                              <img
                                src={event.poster_image_url}
                                alt={`${event.name} poster`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{event.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

                          {event.instagram_reel && (
                            <div className="mb-3">
                              <a
                                href={event.instagram_reel}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-pink-600 hover:text-pink-700 text-sm font-medium"
                              >
                                📱 Instagram Reel
                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </a>
                            </div>
                          )}

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Homepage:</span>
                              <button
                                onClick={() => handleToggleHomepage(event.id, event.show_on_homepage)}
                                disabled={loading}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                  event.show_on_homepage ? 'bg-green-600' : 'bg-red-400'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                                    event.show_on_homepage ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            <span className="text-xs text-gray-400">
                              {new Date(event.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={loading}
                          className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📋</div>
                  <p className="text-gray-500">No hot events created yet</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Bank Details Section */}
        {activeSection === 'bank' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">🏦</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Bank Details Management</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🏦</div>
                  <p className="text-gray-500">Use the sidebar to manage bank details</p>
                  <p className="text-gray-400 text-sm mt-2">Add, edit, or delete bank account information</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Admin;