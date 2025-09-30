import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { supabaseService } from '../lib/supabase';
import HomeButton from '../components/HomeButton';

const LeaderboardNew = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeamForAnalysis, setSelectedTeamForAnalysis] = useState(null);
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const teamsPerPage = 10;

  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // Generate realistic performance data based on SAE rulebook
  const generatePerformanceData = (teamIndex, totalTeams, status) => {
    const isVerified = status === 'verified';
    const performance = {};

    // 1. Technical Inspection (25 + 15 Bonus)
    const inspectionSuccess = Math.random() > 0.15; // 85% pass rate
    const firstAttempt = Math.random() > 0.3; // 70% pass on first attempt
    const hasInnovation = Math.random() > 0.4; // 60% have innovation

    performance.technicalInspection = {
      passed: inspectionSuccess,
      attempt: firstAttempt ? 1 : 2,
      basePoints: inspectionSuccess ? (firstAttempt ? 25 : 20) : 0,
      innovationPoints: hasInnovation && inspectionSuccess ? 15 : 0,
      total: inspectionSuccess ? (firstAttempt ? 25 : 20) + (hasInnovation ? 15 : 0) : 0
    };

    // 2. Manoeuvrability Test (50 Points)
    const manoSuccess = Math.random() > 0.2; // 80% success rate
    const manoFirstAttempt = Math.random() > 0.4; // 60% on first attempt
    const penalties = Math.floor(Math.random() * 3); // 0-2 penalties

    performance.manoeuvrability = {
      completed: manoSuccess,
      attempt: manoFirstAttempt ? 1 : 2,
      basePoints: manoSuccess ? (manoFirstAttempt ? 50 : 40) : 0,
      penalties: penalties * 2,
      total: manoSuccess ? Math.max((manoFirstAttempt ? 50 : 40) - (penalties * 2), 0) : 0
    };

    // 3. Durability Test (50 or 35 Points)
    const durabilitySuccess = Math.random() > 0.25; // 75% success rate
    const durabilityFirstAttempt = Math.random() > 0.5; // 50% on first attempt

    performance.durability = {
      completed: durabilitySuccess,
      attempt: durabilityFirstAttempt ? 1 : 2,
      total: durabilitySuccess ? (durabilityFirstAttempt ? 50 : 35) : 0
    };

    // 4. Pre-final Race (100 to 35 Points)
    const qualifiedForPrefinal = teamIndex < Math.floor(totalTeams * 0.6); // Top 60% qualify
    let prefinalPoints = 0;
    let prefinalPosition = 0;

    if (qualifiedForPrefinal) {
      const racePerformance = Math.random();
      if (racePerformance > 0.75) { prefinalPoints = 100; prefinalPosition = 1; }
      else if (racePerformance > 0.5) { prefinalPoints = 75; prefinalPosition = 2; }
      else if (racePerformance > 0.25) { prefinalPoints = 55; prefinalPosition = 3; }
      else { prefinalPoints = 35; prefinalPosition = 4; }
    }

    performance.prefinalRace = {
      qualified: qualifiedForPrefinal,
      position: prefinalPosition,
      total: prefinalPoints
    };

    // 5. Final Race (75 to 25 Points)
    const qualifiedForFinal = qualifiedForPrefinal && teamIndex < Math.floor(totalTeams * 0.2); // Top 20% make finals
    let finalPoints = 0;
    let finalPosition = 0;

    if (qualifiedForFinal) {
      const finalPerformance = Math.random();
      if (finalPerformance > 0.8) { finalPoints = 75; finalPosition = 1; }
      else if (finalPerformance > 0.6) { finalPoints = 60; finalPosition = 2; }
      else if (finalPerformance > 0.4) { finalPoints = 45; finalPosition = 3; }
      else if (finalPerformance > 0.2) { finalPoints = 30; finalPosition = 4; }
      else { finalPoints = 20; finalPosition = 5; }
    }

    performance.finalRace = {
      qualified: qualifiedForFinal,
      position: finalPosition,
      total: finalPoints
    };

    // 6. Mixed Team Bonus (10 Points)
    const isMixed = Math.random() > 0.7; // 30% mixed teams
    performance.mixedTeamBonus = isMixed ? 10 : 0;

    // Calculate total points
    const totalPoints = performance.technicalInspection.total +
                       performance.manoeuvrability.total +
                       performance.durability.total +
                       performance.prefinalRace.total +
                       performance.finalRace.total +
                       performance.mixedTeamBonus;

    return { performance, totalPoints };
  };

  // Transform database team data to leaderboard format
  const transformTeamData = (teams) => {
    return teams.map((team, index) => {
      const { performance, totalPoints } = generatePerformanceData(index, teams.length, team.registration_status);

      return {
        id: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        rollNumber: team.leader_roll,
        branch: team.leader_branch,
        phone: team.leader_phone || 'N/A',
        registrationDate: new Date(team.created_at),
        status: team.registration_status,
        paymentVerified: team.payment_verified,
        applicationNumber: team.application_number,
        points: totalPoints,
        position: index + 1,
        performance: performance,
        // Additional team member info
        members: [
          team.member1_name && { name: team.member1_name, roll: team.member1_roll, branch: team.member1_branch },
          team.member2_name && { name: team.member2_name, roll: team.member2_roll, branch: team.member2_branch },
          team.member3_name && { name: team.member3_name, roll: team.member3_roll, branch: team.member3_branch },
          team.member4_name && { name: team.member4_name, roll: team.member4_roll, branch: team.member4_branch }
        ].filter(Boolean)
      };
    });
  };

  useEffect(() => {
    // Load data and initialize
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch real team registrations from database
        const rawTeams = await supabaseService.getTeamRegistrations();

        // Sort teams by verification status and registration date first
        const sortedTeams = rawTeams.sort((a, b) => {
          // First prioritize verified teams
          if (a.registration_status === 'verified' && b.registration_status !== 'verified') return -1;
          if (b.registration_status === 'verified' && a.registration_status !== 'verified') return 1;

          // Then sort by registration date (earlier = better rank)
          return new Date(a.created_at) - new Date(b.created_at);
        });

        // Transform to leaderboard format
        const transformedData = transformTeamData(sortedTeams);

        // Sort by total points (descending) to get final rankings
        const finalRankedData = transformedData.sort((a, b) => b.points - a.points);

        // Update positions based on final rankings
        finalRankedData.forEach((team, index) => {
          team.position = index + 1;
        });

        setLeaderboardData(finalRankedData);
        setFilteredData(finalRankedData);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        setLeaderboardData([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...leaderboardData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.branch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(team => team.status === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, leaderboardData]);


  // Get current page data
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredData.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredData.length / teamsPerPage);

  // Handle team card click
  const handleTeamClick = (team) => {
    setSelectedTeamForAnalysis(team);
    setShowAnalysisPopup(true);
  };

  // Close analytics popup
  const closeAnalyticsPopup = () => {
    setShowAnalysisPopup(false);
    setSelectedTeamForAnalysis(null);
  };

  // Generate default performance data if missing
  const getPerformanceData = (team) => {
    if (team.performance) {
      return team.performance;
    }

    // Fallback performance data
    return {
      technicalInspection: { passed: true, attempt: 1, basePoints: 25, innovationPoints: 0, total: 25 },
      manoeuvrability: { completed: true, attempt: 1, basePoints: 50, penalties: 0, total: 50 },
      durability: { completed: true, attempt: 1, total: 50 },
      prefinalRace: { qualified: false, position: 0, total: 0 },
      finalRace: { qualified: false, position: 0, total: 0 },
      mixedTeamBonus: 0
    };
  };

  // Get rank indicator style based on position
  const getRankStyle = (position) => {
    if (position === 1) return { background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#000' };
    if (position === 2) return { background: 'linear-gradient(135deg, #c0c0c0, #e5e7eb)', color: '#000' };
    if (position === 3) return { background: 'linear-gradient(135deg, #cd7f32, #d97706)', color: '#fff' };
    if (position <= 5) return { background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff' };
    if (position <= 10) return { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff' };
    return { background: 'linear-gradient(135deg, #64748b, #475569)', color: '#fff' };
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at top, rgba(220, 38, 38, 0.05) 0%, transparent 35%),
        radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.08) 0%, transparent 40%),
        radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
        linear-gradient(180deg, #0f172a 0%, #1e293b 15%, #0f172a 100%)
      `,
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      color: '#f1f5f9',
      position: 'relative'
    },

    institutionBar: {
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(220, 38, 38, 0.2)',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#cbd5e1',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },

    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },

    championshipHeader: {
      textAlign: 'center',
      margin: '3rem 0 2rem',
      position: 'relative'
    },

    championshipTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 50%, #2563eb 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
      textShadow: '0 0 40px rgba(220, 38, 38, 0.3)'
    },

    lastUpdated: {
      fontSize: '0.875rem',
      color: '#64748b',
      fontWeight: '500'
    },

    controlsContainer: {
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },

    searchContainer: {
      position: 'relative',
      flex: '1 1 300px',
      minWidth: '250px'
    },

    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      borderRadius: '0.75rem',
      color: '#f1f5f9',
      fontSize: '0.925rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none'
    },

    searchIcon: {
      position: 'absolute',
      left: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      fontSize: '1.125rem'
    },

    filterSelect: {
      padding: '0.75rem 2.5rem 0.75rem 1rem',
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      borderRadius: '0.75rem',
      color: '#f1f5f9',
      fontSize: '0.925rem',
      appearance: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '160px',
      outline: 'none'
    },

    teamsCount: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
    },

    teamsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      marginBottom: '2rem',
      maxWidth: '800px',
      margin: '0 auto 2rem auto'
    },

    teamCard: {
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '1.25rem',
      padding: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      width: '100%'
    },

    rankIndicator: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.125rem',
      fontWeight: '800'
    },

    teamHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.25rem',
      marginLeft: '4rem'
    },

    teamName: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#f1f5f9',
      marginBottom: '0.25rem',
      lineHeight: '1.3'
    },

    pointsContainer: {
      textAlign: 'right'
    },

    teamPoints: {
      fontSize: '2.25rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #f59e0b, #eab308)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1'
    },

    pointsLabel: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    leaderInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },

    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },

    infoLabel: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    infoValue: {
      fontSize: '0.925rem',
      color: '#e2e8f0',
      fontWeight: '500'
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '0.375rem 0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.8125rem',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
      width: 'fit-content'
    },

    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      margin: '3rem 0'
    },

    paginationButton: {
      padding: '0.75rem 1rem',
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '0.75rem',
      color: '#cbd5e1',
      fontSize: '0.925rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      outline: 'none'
    },

    paginationButtonActive: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      borderColor: '#dc2626',
      color: 'white',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
    },

    footer: {
      textAlign: 'center',
      padding: '2rem 0',
      borderTop: '1px solid rgba(51, 65, 85, 0.3)',
      marginTop: '3rem'
    },

    footerText: {
      color: '#64748b',
      fontSize: '0.875rem',
      lineHeight: '1.6'
    },

    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem'
    },

    spinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid rgba(220, 38, 38, 0.2)',
      borderTop: '4px solid #dc2626',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    loadingText: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#cbd5e1'
    },

    // Elite Analytics Dashboard Styles
    dashboardOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at center, rgba(0, 168, 255, 0.1) 0%, rgba(10, 10, 10, 0.95) 70%)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'dashboardFadeIn 0.4s ease-out'
    },

    dashboardContainer: {
      background: `
        linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 15, 15, 0.98) 50%, rgba(5, 5, 5, 0.95) 100%),
        radial-gradient(ellipse at top left, rgba(0, 168, 255, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(46, 204, 113, 0.03) 0%, transparent 50%)
      `,
      border: '1px solid rgba(0, 168, 255, 0.2)',
      borderRadius: '20px',
      maxWidth: '1100px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `
        0 32px 120px rgba(0, 0, 0, 0.8),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(0, 168, 255, 0.1)
      `,
      animation: 'dashboardSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
    },

    // Dashboard Header
    dashboardHeader: {
      background: `
        linear-gradient(135deg, rgba(0, 168, 255, 0.1) 0%, rgba(46, 204, 113, 0.05) 100%),
        linear-gradient(180deg, rgba(10, 10, 10, 0.8) 0%, rgba(15, 15, 15, 0.9) 100%)
      `,
      borderBottom: '1px solid rgba(0, 168, 255, 0.2)',
      padding: '1.5rem 2rem',
      position: 'relative',
      backdropFilter: 'blur(20px)'
    },

    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1.5rem',
      background: 'rgba(0, 168, 255, 0.1)',
      border: '1px solid rgba(0, 168, 255, 0.3)',
      borderRadius: '10px',
      width: '2.5rem',
      height: '2.5rem',
      color: '#00A8FF',
      fontSize: '1.125rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600'
    },

    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },

    teamInfo: {
      flex: 1
    },

    teamTitle: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #00A8FF 50%, #2ECC71 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.25rem',
      letterSpacing: '-0.02em'
    },

    teamSubtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },

    rankBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: 'linear-gradient(135deg, #00A8FF, #0077CC)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      boxShadow: '0 6px 24px rgba(0, 168, 255, 0.3)'
    },

    scoreDisplay: {
      textAlign: 'center',
      minWidth: '160px'
    },

    totalScore: {
      fontSize: '3rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #00A8FF 0%, #2ECC71 50%, #F39C12 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1',
      marginBottom: '0.25rem'
    },

    maxScore: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      fontWeight: '600'
    },

    progressRing: {
      width: '100px',
      height: '100px',
      margin: '0.75rem auto',
      position: 'relative'
    },

    dashboardContent: {
      padding: '0',
      height: 'calc(85vh - 140px)',
      overflow: 'auto'
    },

    // Main Dashboard Layout
    dashboardLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      height: '100%',
      gap: '1.5rem',
      padding: '1.5rem'
    },

    // Left Panel - Main Analytics
    leftPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'auto'
    },

    // Right Panel - Detailed Metrics
    rightPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'auto'
    },

    // Glass Panel Base
    glassPanel: {
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%),
        rgba(10, 10, 10, 0.4)
      `,
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 40px rgba(0, 0, 0, 0.3)'
    },


    // Performance Metrics
    metricsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },

    metricItem: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '1.25rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },

    metricTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },

    metricScore: {
      fontSize: '1.5rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #00A8FF, #2ECC71)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },

    // Progress Bars
    progressContainer: {
      position: 'relative',
      height: '8px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden'
    },

    progressBar: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },

    progressGlow: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      animation: 'progressShimmer 2s infinite'
    },

    // Status Indicators
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.375rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    // Gauge Components
    gaugeContainer: {
      position: 'relative',
      width: '120px',
      height: '120px',
      margin: '0 auto'
    },

    // Comparative Analytics
    comparisonContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1rem'
    },

    comparisonItem: {
      textAlign: 'center',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },

    comparisonValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#00A8FF',
      marginBottom: '0.25rem'
    },

    comparisonLabel: {
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    // Team Members
    membersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },

    memberCard: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },

    memberName: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '0.5rem'
    },

    memberRole: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.25rem'
    },

    memberDetails: {
      fontSize: '0.7rem',
      color: 'rgba(255, 255, 255, 0.5)'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.institutionBar}>
          MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY
        </div>
        <div style={styles.container}>
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>Loading Championship Data...</div>
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <HomeButton />

      {/* Institution Header Bar */}
      <div style={styles.institutionBar}>
        MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY
      </div>

      <div ref={containerRef} style={styles.container}>
        {/* Championship Header */}
        <div style={styles.championshipHeader}>
          <h1 style={styles.championshipTitle}>
            BURNOUT LEADERBOARD
          </h1>
          <div style={styles.lastUpdated}>
            Last updated: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* Modern Search and Filter Controls */}
        <div style={styles.controlsContainer}>
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>🔍</div>
            <input
              type="text"
              placeholder="Search teams, leaders, or roll numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.target.style.borderColor = '#dc2626';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
            }}
          >
            <option value="all">All Status</option>
            <option value="verified">✅ Verified</option>
            <option value="pending">⏳ Pending</option>
            <option value="rejected">❌ Rejected</option>
          </select>

          <div style={styles.teamsCount}>
            {filteredData.length} Teams
          </div>
        </div>


        {/* Teams Grid */}
        {currentTeams.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            fontSize: '1.125rem'
          }}>
            {filteredData.length === 0 && leaderboardData.length === 0
              ? 'No teams have registered yet.'
              : 'No teams match your search criteria.'
            }
          </div>
        ) : (
          <div style={styles.teamsGrid}>
            {currentTeams.map((team, index) => {
            const rankStyle = getRankStyle(team.position);
            return (
              <div
                key={team.id}
                style={styles.teamCard}
                onClick={() => handleTeamClick(team)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(220, 38, 38, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)';
                }}
              >
                {/* Rank Indicator */}
                <div style={{ ...styles.rankIndicator, ...rankStyle }}>
                  {team.position}
                </div>

                {/* Team Header */}
                <div style={styles.teamHeader}>
                  <div>
                    <h3 style={styles.teamName}>{team.teamName}</h3>
                    {team.status === 'verified' && (
                      <div style={styles.statusBadge}>
                        ✓ Verified
                      </div>
                    )}
                    {team.status === 'pending' && (
                      <div style={{...styles.statusBadge, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                        ⏳ Pending
                      </div>
                    )}
                    {team.status === 'rejected' && (
                      <div style={{...styles.statusBadge, background: 'linear-gradient(135deg, #dc2626, #b91c1c)'}}>
                        ❌ Rejected
                      </div>
                    )}
                  </div>
                  <div style={styles.pointsContainer}>
                    <div style={styles.teamPoints}>
                      {team.points.toLocaleString()}
                    </div>
                    <div style={styles.pointsLabel}>Points</div>
                  </div>
                </div>

                {/* Leader Information */}
                <div style={styles.leaderInfo}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Leader</div>
                    <div style={styles.infoValue}>{team.leaderName}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Roll Number</div>
                    <div style={styles.infoValue}>{team.rollNumber}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Branch</div>
                    <div style={styles.infoValue}>{team.branch}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Registration</div>
                    <div style={styles.infoValue}>
                      {team.registrationDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Pagination */}
        <div style={styles.paginationContainer}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationButton,
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                ...styles.paginationButton,
                ...(page === currentPage ? styles.paginationButtonActive : {})
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationButton,
              opacity: currentPage === totalPages ? 0.4 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerText}>
            Click on any team card to view detailed statistics
            <br />
            SAE Collegiate Club • Automotive Engineering Competition 2024
          </div>
        </div>
      </div>

      {/* Elite Analytics Dashboard */}
      {showAnalysisPopup && selectedTeamForAnalysis && (
        <div style={styles.dashboardOverlay} onClick={closeAnalyticsPopup}>
          <div style={styles.dashboardContainer} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const performance = getPerformanceData(selectedTeamForAnalysis);
              const scorePercentage = (selectedTeamForAnalysis.points / 325) * 100;

              return (
                <>
                  {/* Dashboard Header */}
                  <div style={styles.dashboardHeader}>
                    <button
                      style={styles.closeButton}
                      onClick={closeAnalyticsPopup}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 168, 255, 0.2)';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 168, 255, 0.1)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      ✕
                    </button>

                    <div style={styles.headerTop}>
                      <div style={styles.teamInfo}>
                        <h1 style={styles.teamTitle}>{selectedTeamForAnalysis.teamName}</h1>
                        <p style={styles.teamSubtitle}>
                          Led by {selectedTeamForAnalysis.leaderName} • {selectedTeamForAnalysis.branch}
                        </p>
                        <div style={styles.rankBadge}>
                          🏆 Rank #{selectedTeamForAnalysis.position}
                        </div>
                      </div>

                      <div style={styles.scoreDisplay}>
                        <div style={styles.totalScore}>
                          {selectedTeamForAnalysis.points}
                        </div>
                        <div style={styles.maxScore}>/ 325 Points</div>

                        {/* Circular Progress Ring */}
                        <div style={styles.progressRing}>
                          <svg width="100" height="100" style={{transform: 'rotate(-90deg)'}}>
                            <circle
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="6"
                            />
                            <circle
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke="url(#progressGradient)"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${scorePercentage * 2.51} ${(100 - scorePercentage) * 2.51}`}
                              style={{
                                transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            />
                            <defs>
                              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00A8FF" />
                                <stop offset="50%" stopColor="#2ECC71" />
                                <stop offset="100%" stopColor="#F39C12" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#00A8FF'
                          }}>
                            {Math.round(scorePercentage)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div style={styles.dashboardContent}>
                    <div style={styles.dashboardLayout}>

                      {/* Left Panel - Main Analytics */}
                      <div style={styles.leftPanel}>

                        {/* Performance Bar Chart */}
                        <div style={{...styles.glassPanel}}>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                          }}>
                            Performance Breakdown
                          </h3>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            padding: '1rem'
                          }}>
                            {/* Technical Inspection Bar */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                minWidth: '90px',
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                              }}>
                                🔧 Technical
                              </div>
                              <div style={{
                                flex: 1,
                                height: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                <div style={{
                                  width: `${(performance.technicalInspection.total / 40) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #00A8FF, #2ECC71)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease-out',
                                  position: 'relative'
                                }}>
                                  <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    right: '0',
                                    bottom: '0',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                    animation: 'progressShimmer 2s infinite'
                                  }}></div>
                                </div>
                              </div>
                              <div style={{
                                minWidth: '60px',
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#00A8FF'
                              }}>
                                {performance.technicalInspection.total}/40
                              </div>
                            </div>

                            {/* Manoeuvrability Bar */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                minWidth: '90px',
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                              }}>
                                🏎️ Maneuver
                              </div>
                              <div style={{
                                flex: 1,
                                height: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(performance.manoeuvrability.total / 50) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #2ECC71, #F39C12)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease-out'
                                }}></div>
                              </div>
                              <div style={{
                                minWidth: '60px',
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#2ECC71'
                              }}>
                                {performance.manoeuvrability.total}/50
                              </div>
                            </div>

                            {/* Durability Bar */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                minWidth: '90px',
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                              }}>
                                💪 Durability
                              </div>
                              <div style={{
                                flex: 1,
                                height: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(performance.durability.total / 50) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #F39C12, #E67E22)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease-out'
                                }}></div>
                              </div>
                              <div style={{
                                minWidth: '60px',
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#F39C12'
                              }}>
                                {performance.durability.total}/50
                              </div>
                            </div>

                            {/* Pre-final Race Bar */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                minWidth: '90px',
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                              }}>
                                🏁 Pre-final
                              </div>
                              <div style={{
                                flex: 1,
                                height: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(performance.prefinalRace.total / 100) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #9B59B6, #8E44AD)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease-out'
                                }}></div>
                              </div>
                              <div style={{
                                minWidth: '60px',
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#9B59B6'
                              }}>
                                {performance.prefinalRace.total}/100
                              </div>
                            </div>

                            {/* Final Race Bar */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                minWidth: '90px',
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                              }}>
                                🏆 Final
                              </div>
                              <div style={{
                                flex: 1,
                                height: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(performance.finalRace.total / 75) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #E74C3C, #C0392B)',
                                  borderRadius: '10px',
                                  transition: 'width 1s ease-out'
                                }}></div>
                              </div>
                              <div style={{
                                minWidth: '60px',
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#E74C3C'
                              }}>
                                {performance.finalRace.total}/75
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Distribution Pie Chart */}
                        <div style={{...styles.glassPanel}}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '1rem',
                            textAlign: 'center'
                          }}>
                            Score Distribution
                          </h3>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '200px'
                          }}>
                            {(() => {
                              const total = selectedTeamForAnalysis.points;
                              const data = [
                                { label: 'Technical', value: performance.technicalInspection.total, color: '#00A8FF' },
                                { label: 'Maneuver', value: performance.manoeuvrability.total, color: '#2ECC71' },
                                { label: 'Durability', value: performance.durability.total, color: '#F39C12' },
                                { label: 'Pre-final', value: performance.prefinalRace.total, color: '#9B59B6' },
                                { label: 'Final', value: performance.finalRace.total, color: '#E74C3C' },
                                { label: 'Bonus', value: performance.mixedTeamBonus, color: '#1ABC9C' }
                              ];

                              let cumulativeAngle = 0;
                              const radius = 80;
                              const centerX = 100;
                              const centerY = 100;

                              return (
                                <div style={{ position: 'relative' }}>
                                  <svg width="200" height="200" viewBox="0 0 200 200">
                                    {data.map((segment, index) => {
                                      if (segment.value === 0) return null;

                                      const angle = (segment.value / total) * 360;
                                      const startAngle = cumulativeAngle;
                                      const endAngle = cumulativeAngle + angle;

                                      const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
                                      const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
                                      const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                                      const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);

                                      const largeArcFlag = angle > 180 ? 1 : 0;

                                      const pathData = [
                                        `M ${centerX} ${centerY}`,
                                        `L ${startX} ${startY}`,
                                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                        'Z'
                                      ].join(' ');

                                      cumulativeAngle += angle;

                                      return (
                                        <path
                                          key={index}
                                          d={pathData}
                                          fill={segment.color}
                                          stroke="rgba(0, 0, 0, 0.3)"
                                          strokeWidth="1"
                                          opacity="0.8"
                                          style={{
                                            transition: 'opacity 0.3s ease'
                                          }}
                                        />
                                      );
                                    })}
                                  </svg>

                                  {/* Legend */}
                                  <div style={{
                                    position: 'absolute',
                                    right: '-120px',
                                    top: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                  }}>
                                    {data.filter(d => d.value > 0).map((item, index) => (
                                      <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                      }}>
                                        <div style={{
                                          width: '12px',
                                          height: '12px',
                                          backgroundColor: item.color,
                                          borderRadius: '2px'
                                        }}></div>
                                        <span style={{
                                          fontSize: '0.75rem',
                                          color: 'rgba(255, 255, 255, 0.8)'
                                        }}>
                                          {item.label}: {item.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Comparative Analytics */}
                        <div style={{...styles.glassPanel}}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '1rem'
                          }}>
                            Performance Insights
                          </h3>

                          <div style={styles.comparisonContainer}>
                            <div style={styles.comparisonItem}>
                              <div style={styles.comparisonValue}>
                                {Math.round((selectedTeamForAnalysis.points / 325) * 100)}%
                              </div>
                              <div style={styles.comparisonLabel}>Efficiency</div>
                            </div>
                            <div style={styles.comparisonItem}>
                              <div style={styles.comparisonValue}>
                                {performance.finalRace.qualified ? 'Elite' : 'Qualified'}
                              </div>
                              <div style={styles.comparisonLabel}>Status</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel - Detailed Metrics */}
                      <div style={styles.rightPanel}>

                        {/* Individual Performance Metrics */}
                        <div style={{...styles.glassPanel}}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '1.5rem'
                          }}>
                            Detailed Breakdown
                          </h3>

                          <div style={styles.metricsContainer}>
                            {/* Technical Inspection */}
                            <div style={styles.metricItem}>
                              <div style={styles.metricHeader}>
                                <div style={styles.metricTitle}>
                                  🔧 Technical Inspection
                                </div>
                                <div style={styles.metricScore}>
                                  {performance.technicalInspection.total}/40
                                </div>
                              </div>
                              <div style={styles.progressContainer}>
                                <div
                                  style={{
                                    ...styles.progressBar,
                                    width: `${(performance.technicalInspection.total / 40) * 100}%`,
                                    background: 'linear-gradient(90deg, #00A8FF, #2ECC71)'
                                  }}
                                >
                                  <div style={styles.progressGlow}></div>
                                </div>
                              </div>
                              <div style={{
                                ...styles.statusBadge,
                                background: performance.technicalInspection.passed ?
                                  'linear-gradient(135deg, #2ECC71, #27AE60)' :
                                  'linear-gradient(135deg, #E74C3C, #C0392B)',
                                marginTop: '0.5rem'
                              }}>
                                {performance.technicalInspection.passed ? 'PASSED' : 'FAILED'}
                              </div>
                            </div>

                            {/* Manoeuvrability */}
                            <div style={styles.metricItem}>
                              <div style={styles.metricHeader}>
                                <div style={styles.metricTitle}>
                                  🏎️ Manoeuvrability
                                </div>
                                <div style={styles.metricScore}>
                                  {performance.manoeuvrability.total}/50
                                </div>
                              </div>
                              <div style={styles.progressContainer}>
                                <div
                                  style={{
                                    ...styles.progressBar,
                                    width: `${(performance.manoeuvrability.total / 50) * 100}%`,
                                    background: 'linear-gradient(90deg, #2ECC71, #F39C12)'
                                  }}
                                >
                                  <div style={styles.progressGlow}></div>
                                </div>
                              </div>
                              <div style={{
                                ...styles.statusBadge,
                                background: performance.manoeuvrability.completed ?
                                  'linear-gradient(135deg, #2ECC71, #27AE60)' :
                                  'linear-gradient(135deg, #E74C3C, #C0392B)',
                                marginTop: '0.5rem'
                              }}>
                                {performance.manoeuvrability.completed ? 'COMPLETED' : 'FAILED'}
                              </div>
                            </div>

                            {/* Durability */}
                            <div style={styles.metricItem}>
                              <div style={styles.metricHeader}>
                                <div style={styles.metricTitle}>
                                  💪 Durability
                                </div>
                                <div style={styles.metricScore}>
                                  {performance.durability.total}/50
                                </div>
                              </div>
                              <div style={styles.progressContainer}>
                                <div
                                  style={{
                                    ...styles.progressBar,
                                    width: `${(performance.durability.total / 50) * 100}%`,
                                    background: 'linear-gradient(90deg, #F39C12, #E67E22)'
                                  }}
                                >
                                  <div style={styles.progressGlow}></div>
                                </div>
                              </div>
                              <div style={{
                                ...styles.statusBadge,
                                background: performance.durability.completed ?
                                  'linear-gradient(135deg, #2ECC71, #27AE60)' :
                                  'linear-gradient(135deg, #E74C3C, #C0392B)',
                                marginTop: '0.5rem'
                              }}>
                                {performance.durability.completed ? 'PASSED' : 'FAILED'}
                              </div>
                            </div>

                            {/* Racing Performance */}
                            <div style={styles.metricItem}>
                              <div style={styles.metricHeader}>
                                <div style={styles.metricTitle}>
                                  🏁 Racing Performance
                                </div>
                                <div style={styles.metricScore}>
                                  {performance.prefinalRace.total + performance.finalRace.total}/175
                                </div>
                              </div>
                              <div style={styles.progressContainer}>
                                <div
                                  style={{
                                    ...styles.progressBar,
                                    width: `${((performance.prefinalRace.total + performance.finalRace.total) / 175) * 100}%`,
                                    background: 'linear-gradient(90deg, #9B59B6, #8E44AD)'
                                  }}
                                >
                                  <div style={styles.progressGlow}></div>
                                </div>
                              </div>
                              <div style={{
                                ...styles.statusBadge,
                                background: performance.finalRace.qualified ?
                                  'linear-gradient(135deg, #F39C12, #D68910)' :
                                  (performance.prefinalRace.qualified ?
                                    'linear-gradient(135deg, #2ECC71, #27AE60)' :
                                    'linear-gradient(135deg, #95A5A6, #7F8C8D)'),
                                marginTop: '0.5rem'
                              }}>
                                {performance.finalRace.qualified ? 'FINALIST' :
                                 (performance.prefinalRace.qualified ? 'QUALIFIED' : 'ELIMINATED')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team Members */}
                        <div style={{...styles.glassPanel}}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '1rem'
                          }}>
                            Team Roster
                          </h3>

                          <div style={styles.membersGrid}>
                            {/* Leader */}
                            <div style={{
                              ...styles.memberCard,
                              border: '1px solid rgba(0, 168, 255, 0.3)',
                              background: 'rgba(0, 168, 255, 0.05)'
                            }}>
                              <div style={styles.memberName}>
                                {selectedTeamForAnalysis.leaderName}
                              </div>
                              <div style={styles.memberRole}>TEAM LEADER</div>
                              <div style={styles.memberDetails}>
                                {selectedTeamForAnalysis.rollNumber} • {selectedTeamForAnalysis.branch}
                              </div>
                            </div>

                            {/* Team Members */}
                            {selectedTeamForAnalysis.members && selectedTeamForAnalysis.members.map((member, index) => (
                              <div key={index} style={styles.memberCard}>
                                <div style={styles.memberName}>{member.name}</div>
                                <div style={styles.memberRole}>MEMBER</div>
                                <div style={styles.memberDetails}>
                                  {member.roll} • {member.branch}
                                </div>
                              </div>
                            ))}

                            {/* Mixed Team Bonus */}
                            {performance.mixedTeamBonus > 0 && (
                              <div style={{
                                ...styles.memberCard,
                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                background: 'rgba(46, 204, 113, 0.05)'
                              }}>
                                <div style={styles.memberName}>🏆 Diversity Bonus</div>
                                <div style={styles.memberRole}>+{performance.mixedTeamBonus} POINTS</div>
                                <div style={styles.memberDetails}>Mixed Gender Team</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes dashboardFadeIn {
            0% {
              opacity: 0;
              backdrop-filter: blur(0px);
            }
            100% {
              opacity: 1;
              backdrop-filter: blur(12px);
            }
          }

          @keyframes dashboardSlideUp {
            0% {
              opacity: 0;
              transform: translateY(60px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes progressShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }


          @media (max-width: 768px) {
            .controlsContainer {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .searchContainer {
              min-width: auto !important;
            }
          }

          input::placeholder {
            color: #64748b;
          }

          select:focus,
          input:focus {
            outline: none;
          }
        `}
      </style>
    </div>
  );
};

export default LeaderboardNew;