import React, { useState, useEffect } from 'react';
// import { gsap } from 'gsap';
import { supabaseService } from '../lib/supabase';

const AdminNew = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
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
  const [teamRegistrations, setTeamRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [searchRollNumber, setSearchRollNumber] = useState('');

  // QR & UPI Settings state
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState(null);
  const [currentUpiId, setCurrentUpiId] = useState('');

  // Helper function to filter registrations
  const getFilteredRegistrations = () => {
    return teamRegistrations.filter(registration => {
      // Filter by status
      const statusMatch = registrationFilter === 'all' || registration.registration_status === registrationFilter;

      // Filter by roll number search
      const rollNumberMatch = !searchRollNumber ||
        registration.leader_roll?.toLowerCase().includes(searchRollNumber.toLowerCase());

      return statusMatch && rollNumberMatch;
    });
  };

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

  // Load team registrations from database
  const loadTeamRegistrations = async () => {
    setLoading(true);
    try {
      const registrations = await supabaseService.getTeamRegistrations();
      setTeamRegistrations(registrations || []);
    } catch (err) {
      setError('Failed to load team registrations');
      console.error('Error loading team registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load QR & UPI settings from database
  const loadQrUpiSettings = async () => {
    try {
      const settings = await supabaseService.getQrUpiSettings();
      if (settings) {
        setCurrentQrCodeUrl(settings.qr_code_url);
        setCurrentUpiId(settings.upi_id || '');
        setUpiId(settings.upi_id || '');
      }
    } catch (err) {
      console.error('Error loading QR & UPI settings:', err);
    }
  };

  // Validate UPI ID format
  const validateUpiId = (upiId) => {
    if (!upiId.trim()) {
      return 'UPI ID is required';
    }

    // Basic UPI ID format validation
    const upiPattern = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{2,64}$/;
    if (!upiPattern.test(upiId)) {
      return 'Please enter a valid UPI ID (e.g., user@paytm, user@phonepe)';
    }

    return null;
  };

  // Save QR & UPI settings with validation
  const handleSaveQrUpiSettings = async (e) => {
    e.preventDefault();

    // Validate UPI ID
    const upiError = validateUpiId(upiId);
    if (upiError) {
      setError(upiError);
      return;
    }

    // Check if we have either a new QR code or existing one
    if (!qrCodeFile && !currentQrCodeUrl) {
      setError('Please upload a QR code image');
      return;
    }

    setLoading(true);
    try {
      let qrCodeUrl = currentQrCodeUrl;

      if (qrCodeFile) {
        const uploadResult = await supabaseService.uploadQrCodeImage(qrCodeFile);
        qrCodeUrl = uploadResult.url;
      }

      await supabaseService.saveQrUpiSettings({
        qr_code_url: qrCodeUrl,
        upi_id: upiId.trim()
      });

      setCurrentQrCodeUrl(qrCodeUrl);
      setCurrentUpiId(upiId.trim());
      setQrCodeFile(null);
      setQrCodePreview(null);
      setError(null);

      // Show success message
      const successMsg = qrCodeFile ? 'QR code uploaded and UPI settings saved successfully!' : 'UPI settings updated successfully!';
      alert(successMsg);
    } catch (err) {
      setError(`Failed to save QR & UPI settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete QR & UPI settings
  const handleDeleteQrUpiSettings = async () => {
    if (!confirm('Are you sure you want to delete the current QR code and UPI ID? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await supabaseService.deleteQrUpiSettings();
      setCurrentQrCodeUrl(null);
      setCurrentUpiId('');
      setUpiId('');
      setQrCodeFile(null);
      setQrCodePreview(null);
      setError(null);
      alert('QR & UPI settings deleted successfully!');
    } catch (err) {
      setError(`Failed to delete QR & UPI settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update registration status
  const updateRegistrationStatus = async (id, status) => {
    try {
      await supabaseService.updateRegistrationStatus(id, status);
      // Reload registrations to reflect changes
      await loadTeamRegistrations();
      setError(null);
    } catch (err) {
      setError(`Failed to ${status} registration`);
      console.error('Error updating registration status:', err);
    }
  };

  // Handle poster file selection
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPosterPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle QR code file selection with validation
  const handleQrCodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, JPEG, etc.)');
        e.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Validate image dimensions (optional - QR codes should be square)
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          setError('QR code image should be at least 100x100 pixels');
          e.target.value = '';
          return;
        }

        setQrCodeFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setQrCodePreview(e.target.result);
        reader.readAsDataURL(file);
        setError(null); // Clear any previous errors
      };

      img.onerror = () => {
        setError('Invalid image file. Please select a valid QR code image.');
        e.target.value = '';
      };

      img.src = URL.createObjectURL(file);
    }
  };

  // Handle adding new hot event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.description) return;

    setLoading(true);
    try {
      let posterImageUrl = null;
      let posterImagePath = null;

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
      setEventForm({ name: '', description: '', instagram_reel: '', show_on_homepage: false });
      setPosterFile(null);
      setPosterPreview(null);
      setShowAddEventForm(false);
    } catch (err) {
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
      console.error('Delete event error:', err);
      setError('Failed to delete event');
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
        event.id === id ? { ...event, show_on_homepage: !currentStatus } : event
      ));
    } catch (err) {
      console.error('Update event error:', err);
      setError('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotEvents();
    loadTeamRegistrations();
    loadQrUpiSettings();
  }, []);

  const stats = [
    { title: 'Total Events', value: hotEvents.length.toString(), icon: '🔥', color: 'from-blue-400 to-cyan-400' },
    { title: 'Homepage Events', value: hotEvents.filter(e => e.show_on_homepage).length.toString(), icon: '🏠', color: 'from-purple-400 to-pink-400' },
    { title: 'Team Registrations', value: teamRegistrations.length.toString(), icon: '👥', color: 'from-green-400 to-blue-400' },
    { title: 'Pending Reviews', value: teamRegistrations.filter(r => r.registration_status === 'pending').length.toString(), icon: '⏳', color: 'from-yellow-400 to-orange-400' },
    { title: 'With Instagram', value: hotEvents.filter(e => e.instagram_reel).length.toString(), icon: '📱', color: 'from-green-400 to-emerald-400' },
    { title: 'With Posters', value: hotEvents.filter(e => e.poster_image_url).length.toString(), icon: '🖼️', color: 'from-orange-400 to-red-400' }
  ];

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f0f0f;
          color: #f0f0f0;
        }

        .gradient-text {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 700;
        }

        .gradient-text-purple {
          background: linear-gradient(135deg, #a960ee 0%, #ff333d 50%, #90e0ff 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 700;
        }

        .gradient-text-green {
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 700;
        }

        .admin-container {
          min-height: 100vh;
          display: flex;
          background: #0f0f0f;
        }

        .sidebar {
          width: 280px;
          background: #1a1a1a;
          border-right: 1px solid #333;
          padding: 2rem 0;
          position: fixed;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar.closed {
          transform: translateX(-100%);
        }

        @media (min-width: 769px) {
          .sidebar.closed {
            transform: translateX(-100%);
          }
        }

        .sidebar-header {
          padding: 0 2rem 2rem;
          border-bottom: 1px solid #333;
          margin-bottom: 2rem;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-nav {
          padding: 0 1rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #aaa;
          text-decoration: none;
        }

        .nav-item:hover {
          background: #2d2d2d;
          color: #f0f0f0;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(79, 172, 254, 0.3);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
        }

        .main-content.sidebar-closed {
          margin-left: 0;
        }

        @media (min-width: 769px) {
          .main-content.sidebar-closed {
            margin-left: 0;
          }
        }

        .header {
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .hamburger {
          background: none;
          border: none;
          color: #f0f0f0;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.3s ease;
        }

        .hamburger:hover {
          background-color: #2d2d2d;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-input {
          background: #2d2d2d;
          border: 1px solid #444;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          color: #f0f0f0;
          width: 300px;
        }

        .search-input::placeholder {
          color: #888;
        }

        .content {
          padding: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .stat-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #aaa;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .dashboard-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 1rem;
          padding: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, #a960ee 0%, #ff333d 50%, #90e0ff 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(79, 172, 254, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(79, 172, 254, 0.4);
        }

        .btn-secondary {
          background: #2d2d2d;
          color: #f0f0f0;
          border: 1px solid #444;
        }

        .btn-secondary:hover {
          background: #3d3d3d;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #f0f0f0;
          font-weight: 500;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 0.875rem;
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 0.5rem;
          color: #f0f0f0;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .file-input-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .file-input {
          width: 100%;
          padding: 0.875rem;
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 0.5rem;
          color: #f0f0f0;
          cursor: pointer;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #444;
          transition: 0.4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .event-card {
          background: #2d2d2d;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 1px solid #444;
          transition: all 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .event-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .event-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #f0f0f0;
        }

        .event-description {
          color: #aaa;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .event-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .event-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-homepage {
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
          color: white;
        }

        .badge-instagram {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
          color: white;
        }

        .badge-poster {
          background: linear-gradient(135deg, #a960ee 0%, #ff333d 100%);
          color: white;
        }

        .event-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-danger {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          color: white;
        }

        .btn-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #333;
          border-top: 3px solid #4facfe;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-alert {
          background: #ff4757;
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-image {
          width: 100%;
          max-width: 200px;
          height: 120px;
          object-fit: cover;
          border-radius: 0.5rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
          }

          .search-input {
            width: 200px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Team Registrations Styles */
        .full-width {
          grid-column: 1 / -1;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-select {
          background: #2d2d2d;
          border: 1px solid #444;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          color: #f0f0f0;
          cursor: pointer;
        }

        .registrations-grid {
          display: grid;
          gap: 1.5rem;
        }

        .registration-card {
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .registration-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .registration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #444;
        }

        .team-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .team-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f0f0f0;
          margin: 0;
        }

        .app-number {
          font-size: 0.875rem;
          color: #4facfe;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          margin: 0.25rem 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending {
          background: linear-gradient(135deg, #ffd93d 0%, #ff8800 100%);
          color: #000;
        }

        .status-verified {
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
          color: white;
        }

        .status-rejected {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          color: white;
        }

        .registration-date {
          color: #aaa;
          font-size: 0.875rem;
        }

        .member-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #4facfe;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .member-details {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .member-details div {
          margin-bottom: 0.5rem;
          color: #f0f0f0;
        }

        .member-details div:last-child {
          margin-bottom: 0;
        }

        .payment-proof {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-image {
          max-width: 300px;
          max-height: 200px;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .payment-image:hover {
          transform: scale(1.05);
        }

        .payment-status {
          color: #aaa;
          font-size: 0.875rem;
        }

        .no-payment {
          color: #ff6b6b;
          font-style: italic;
        }

        .registration-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #444;
        }

        .btn-success {
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
          color: white;
        }

        .btn-success:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3);
        }

        .btn-warning {
          background: linear-gradient(135deg, #ffd93d 0%, #ff8800 100%);
          color: #000;
        }

        .btn-warning:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 217, 61, 0.3);
        }

        .no-registrations {
          text-align: center;
          color: #aaa;
          font-style: italic;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .registration-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .registration-actions {
            flex-direction: column;
          }

          .payment-image {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="admin-container">
        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>S</div>
              <div>
                <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>SAE Admin</h2>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Hot Events Portal</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a
              href="#"
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className={`nav-item ${activeSection === 'events' ? 'active' : ''}`}
              onClick={() => setActiveSection('events')}
            >
              <span>🔥</span>
              <span>Hot Events</span>
            </a>
            <a
              href="#"
              className={`nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
              onClick={() => setActiveSection('registrations')}
            >
              <span>👥</span>
              <span>Team Registrations</span>
            </a>
            <a
              href="#"
              className={`nav-item ${activeSection === 'qr-upi' ? 'active' : ''}`}
              onClick={() => setActiveSection('qr-upi')}
            >
              <span>💳</span>
              <span>QR & UPI Settings</span>
            </a>
            <a
              href="#"
              className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              <span>📈</span>
              <span>Analytics</span>
            </a>
            <a
              href="#"
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <button
                className="hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <h1 className="page-title">
                {activeSection === 'dashboard' ? 'Dashboard' :
                 activeSection === 'events' ? 'Hot Events Management' :
                 activeSection === 'registrations' ? 'Team Registrations Management' :
                 activeSection === 'qr-upi' ? 'QR & UPI Settings' :
                 activeSection === 'analytics' ? 'Analytics' : 'Settings'}
              </h1>
            </div>
            <div className="header-right">
              <input
                type="search"
                placeholder="Search events..."
                className="search-input"
              />
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #a960ee 0%, #ff333d 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                A
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content">
            {/* Error Alert */}
            {error && (
              <div className="error-alert">
                <span>{error}</span>
                <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
              </div>
            )}

            {/* Dashboard View */}
            {activeSection === 'dashboard' && (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-header">
                        <span className="stat-icon">{stat.icon}</span>
                      </div>
                      <div className={`stat-value gradient-text`} style={{
                        background: `linear-gradient(135deg, ${stat.color.split(' ')[0].replace('from-', '')} 0%, ${stat.color.split(' ')[1].replace('to-', '')} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                      }}>
                        {stat.value}
                      </div>
                      <div className="stat-label">{stat.title}</div>
                    </div>
                  ))}
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h3 className="card-title">Recent Events</h3>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => setActiveSection('events')}
                      >
                        View All
                      </button>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {hotEvents.slice(0, 3).map(event => (
                        <div key={event.id} style={{ padding: '1rem', background: '#2d2d2d', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                          <h4 style={{ color: '#f0f0f0', marginBottom: '0.5rem' }}>{event.name}</h4>
                          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>{event.description.substring(0, 100)}...</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-card">
                    <div className="card-header">
                      <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setActiveSection('events');
                          setShowAddEventForm(true);
                        }}
                      >
                        <span>➕</span>
                        Add New Hot Event
                      </button>
                      <button className="btn btn-secondary">
                        <span>📊</span>
                        View Analytics
                      </button>
                      <button className="btn btn-secondary">
                        <span>⚙️</span>
                        Manage Settings
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Events View */}
            {activeSection === 'events' && (
              <div className="dashboard-grid">
                {/* Add Event Form */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">🔥 Hot Events</h3>
                    <button
                      className={`btn ${showAddEventForm ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => setShowAddEventForm(!showAddEventForm)}
                    >
                      {showAddEventForm ? 'Cancel' : '+ Add Hot Event'}
                    </button>
                  </div>

                  {showAddEventForm ? (
                    <form onSubmit={handleAddEvent}>
                      <div className="form-group">
                        <label className="form-label">Event Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={eventForm.name}
                          onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                          placeholder="e.g., BAJA Championship 2024"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Event Description</label>
                        <textarea
                          className="form-textarea"
                          value={eventForm.description}
                          onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                          placeholder="Provide detailed information about the event..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Event Poster (Optional)</label>
                        <input
                          type="file"
                          className="file-input"
                          accept="image/*"
                          onChange={handlePosterChange}
                        />
                        {posterPreview && (
                          <img src={posterPreview} alt="Preview" className="preview-image" />
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Instagram Reel Link (Optional)</label>
                        <input
                          type="url"
                          className="form-input"
                          value={eventForm.instagram_reel}
                          onChange={(e) => setEventForm({...eventForm, instagram_reel: e.target.value})}
                          placeholder="https://www.instagram.com/reel/..."
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <label className="form-label">Show on Homepage</label>
                          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Display this event on the main homepage</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={eventForm.show_on_homepage}
                            onChange={(e) => setEventForm({...eventForm, show_on_homepage: e.target.checked})}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        Create Hot Event
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
                      <p style={{ color: '#aaa' }}>Click "Add Hot Event" to create a new event</p>
                    </div>
                  )}
                </div>

                {/* Events List */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">All Hot Events</h3>
                    <div className="badge" style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white'
                    }}>
                      {hotEvents.length} events
                    </div>
                  </div>

                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {hotEvents.length > 0 ? (
                      hotEvents.map(event => (
                        <div key={event.id} className="event-card">
                          {event.poster_image_url && (
                            <img
                              src={event.poster_image_url}
                              alt={`${event.name} poster`}
                              className="event-image"
                            />
                          )}

                          <h4 className="event-title">{event.name}</h4>
                          <p className="event-description">{event.description}</p>

                          <div className="event-meta">
                            <div className="event-badges">
                              {event.show_on_homepage && (
                                <span className="badge badge-homepage">Homepage</span>
                              )}
                              {event.instagram_reel && (
                                <span className="badge badge-instagram">Instagram</span>
                              )}
                              {event.poster_image_url && (
                                <span className="badge badge-poster">Poster</span>
                              )}
                            </div>

                            <div className="event-actions">
                              <label className="toggle-switch" style={{ transform: 'scale(0.8)' }}>
                                <input
                                  type="checkbox"
                                  checked={event.show_on_homepage}
                                  onChange={() => handleToggleHomepage(event.id, event.show_on_homepage)}
                                />
                                <span className="slider"></span>
                              </label>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <p style={{ color: '#aaa' }}>No hot events created yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Team Registrations Section */}
            {activeSection === 'registrations' && (
              <div className="dashboard-grid">
                {/* Filter Controls */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">👥 Team Registrations</h3>
                    <div className="filter-controls">
                      <input
                        type="text"
                        placeholder="Search by team leader roll number..."
                        value={searchRollNumber}
                        onChange={(e) => setSearchRollNumber(e.target.value)}
                        className="search-input"
                        style={{
                          padding: '8px 12px',
                          border: '2px solid #374151',
                          borderRadius: '8px',
                          backgroundColor: '#1f2937',
                          color: '#fff',
                          marginRight: '12px',
                          minWidth: '250px',
                          fontSize: '14px'
                        }}
                      />
                      <select
                        value={registrationFilter}
                        onChange={(e) => setRegistrationFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Registrations</option>
                        <option value="pending">Pending Review</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Registrations List */}
                <div className="dashboard-card full-width">
                  <div className="card-header">
                    <h3 className="card-title">
                      📋 Registration Details
                      ({getFilteredRegistrations().length} entries)
                    </h3>
                  </div>
                  <div className="card-content">
                    {loading ? (
                      <div className="loading-spinner">Loading registrations...</div>
                    ) : (
                      <div className="registrations-grid">
                        {getFilteredRegistrations()
                          .map(registration => (
                            <div key={registration.id} className="registration-card">
                              {/* Registration Header */}
                              <div className="registration-header">
                                <div className="team-info">
                                  <h4 className="team-name">{registration.team_name}</h4>
                                  <div className="app-number">App: {registration.application_number}</div>
                                  <span className={`status-badge status-${registration.registration_status}`}>
                                    {registration.registration_status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="registration-date">
                                  {new Date(registration.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Leader Information */}
                              <div className="member-section">
                                <h5 className="section-title">👑 Team Leader</h5>
                                <div className="member-details">
                                  <div><strong>Name:</strong> {registration.leader_name}</div>
                                  <div><strong>Roll:</strong> {registration.leader_roll}</div>
                                  <div><strong>Branch:</strong> {registration.leader_branch}</div>
                                </div>
                              </div>

                              {/* Team Members */}
                              {[1, 2, 3, 4].some(i => registration[`member${i}_name`]) && (
                                <div className="member-section">
                                  <h5 className="section-title">👥 Team Members</h5>
                                  {[1, 2, 3, 4].map(i => (
                                    registration[`member${i}_name`] && (
                                      <div key={i} className="member-details">
                                        <div><strong>Member {i}:</strong> {registration[`member${i}_name`]}</div>
                                        <div><strong>Roll:</strong> {registration[`member${i}_roll`]}</div>
                                        <div><strong>Branch:</strong> {registration[`member${i}_branch`]}</div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              )}

                              {/* Payment Information */}
                              <div className="member-section">
                                <h5 className="section-title">💰 Payment Information</h5>
                                {registration.payment_screenshot_url ? (
                                  <div className="payment-proof">
                                    <img
                                      src={registration.payment_screenshot_url}
                                      alt="Payment Screenshot"
                                      className="payment-image"
                                      onClick={() => window.open(registration.payment_screenshot_url, '_blank')}
                                    />
                                    <div className="payment-status">
                                      Payment Verified: {registration.payment_verified ? '✅ Yes' : '❌ No'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="no-payment">No payment screenshot provided</div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="registration-actions">
                                {registration.registration_status === 'pending' && (
                                  <>
                                    <button
                                      className="btn btn-success"
                                      onClick={() => updateRegistrationStatus(registration.id, 'verified')}
                                    >
                                      ✅ Verify Registration
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => updateRegistrationStatus(registration.id, 'rejected')}
                                    >
                                      ❌ Reject Registration
                                    </button>
                                  </>
                                )}
                                {registration.registration_status === 'verified' && (
                                  <button
                                    className="btn btn-warning"
                                    onClick={() => updateRegistrationStatus(registration.id, 'pending')}
                                  >
                                    ⏳ Move to Pending
                                  </button>
                                )}
                                {registration.registration_status === 'rejected' && (
                                  <button
                                    className="btn btn-success"
                                    onClick={() => updateRegistrationStatus(registration.id, 'verified')}
                                  >
                                    ✅ Verify Registration
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                        {getFilteredRegistrations().length === 0 && (
                          <div className="no-registrations">
                            {searchRollNumber
                              ? `No registrations found for roll number "${searchRollNumber}"`
                              : `No ${registrationFilter === 'all' ? '' : registrationFilter} registrations found.`
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* QR & UPI Settings View */}
            {activeSection === 'qr-upi' && (
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">💳 QR Code & UPI Settings</h3>
                  </div>

                  <form onSubmit={handleSaveQrUpiSettings}>
                    <div className="form-group">
                      <label className="form-label">QR Code Image *</label>
                      <input
                        type="file"
                        className="file-input"
                        accept="image/*"
                        onChange={handleQrCodeChange}
                        disabled={loading}
                      />
                      <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Supported formats: PNG, JPG, JPEG. Max size: 5MB. Min dimensions: 100x100px
                      </p>
                      {qrCodePreview && (
                        <img src={qrCodePreview} alt="QR Code Preview" className="preview-image" />
                      )}
                      {currentQrCodeUrl && !qrCodePreview && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current QR Code:</p>
                          <img src={currentQrCodeUrl} alt="Current QR Code" className="preview-image" />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">UPI ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g., example@paytm, example@phonepe"
                        required
                        disabled={loading}
                        pattern="[a-zA-Z0-9.-]+@[a-zA-Z][a-zA-Z0-9.-]+"
                        title="Please enter a valid UPI ID format (e.g., user@paytm)"
                      />
                      <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Enter the UPI ID for payment collection (format: user@bank)
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                        {loading ? '⏳ Saving...' : '💾 Save QR & UPI Settings'}
                      </button>
                      {currentQrCodeUrl && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={loading}
                          onClick={handleDeleteQrUpiSettings}
                          style={{ flexShrink: 0 }}
                        >
                          {loading ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">📱 Current Settings Preview</h3>
                  </div>

                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    {currentQrCodeUrl ? (
                      <div>
                        <img
                          src={currentQrCodeUrl}
                          alt="Current QR Code"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                          }}
                        />
                        <p style={{ color: '#f0f0f0', fontWeight: '600' }}>
                          UPI ID: {currentUpiId || 'Not set'}
                        </p>
                        <p style={{ color: '#aaa', fontSize: '0.875rem' }}>
                          This will be displayed on the registration form
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                        <p style={{ color: '#aaa' }}>No QR code uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Sections */}
            {activeSection === 'analytics' && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">📈 Analytics</h3>
                </div>
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <p style={{ color: '#aaa' }}>Analytics dashboard coming soon...</p>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">⚙️ Settings</h3>
                </div>
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
                  <p style={{ color: '#aaa' }}>Settings panel coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminNew;