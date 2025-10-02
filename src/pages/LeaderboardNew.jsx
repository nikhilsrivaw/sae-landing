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

  // Convert database scores to performance data format
  const convertScoresToPerformance = (scores) => {
    if (!scores) {
      return {
        performance: {
          technicalInspection: { total: 0, basePoints: 0, innovationPoints: 0, passed: false },
          manoeuvrability: { total: 0, completed: false },
          durability: { total: 0, completed: false },
          prefinalRace: { total: 0, qualified: false },
          finalRace: { total: 0, qualified: false },
          mixedTeamBonus: 0
        },
        totalPoints: 0
      };
    }

    const performance = {
      technicalInspection: {
        basePoints: scores.technical_inspection || 0,
        innovationPoints: scores.innovation_bonus || 0,
        total: (scores.technical_inspection || 0) + (scores.innovation_bonus || 0),
        passed: (scores.technical_inspection || 0) > 0
      },
      manoeuvrability: {
        total: scores.manoeuvrability || 0,
        completed: (scores.manoeuvrability || 0) > 0
      },
      durability: {
        total: scores.durability || 0,
        completed: (scores.durability || 0) > 0
      },
      prefinalRace: {
        total: scores.pre_final_race || 0,
        qualified: (scores.pre_final_race || 0) > 0
      },
      finalRace: {
        total: scores.final_race || 0,
        qualified: (scores.final_race || 0) > 0
      },
      mixedTeamBonus: scores.mixed_team_bonus || 0
    };

    const totalPoints = (scores.technical_inspection || 0) +
                       (scores.innovation_bonus || 0) +
                       (scores.manoeuvrability || 0) +
                       (scores.durability || 0) +
                       (scores.pre_final_race || 0) +
                       (scores.final_race || 0) +
                       (scores.mixed_team_bonus || 0);

    return { performance, totalPoints };
  };

  // Transform database team data to leaderboard format
  const transformTeamData = (teams) => {
    return teams.map((team, index) => {
      const { performance, totalPoints } = convertScoresToPerformance(team.scores);

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
        points: team.total_score || totalPoints,
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
        // Fetch real team registrations with scores from database
        const rawTeams = await supabaseService.getLeaderboard();

        console.log('Fetched teams with scores:', rawTeams);

        // Transform to leaderboard format
        const transformedData = transformTeamData(rawTeams);

        // Sort by total points (descending) to get final rankings
        const finalRankedData = transformedData.sort((a, b) => b.points - a.points);

        // Update positions based on final rankings
        finalRankedData.forEach((team, index) => {
          team.position = index + 1;
        });

        console.log('Final leaderboard data:', finalRankedData);

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

    // Update time every second for real-time clock
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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
        linear-gradient(180deg, #0a0a0a 0%, #121212 50%, #0a0a0a 100%)
      `,
      fontFamily: '"Courier New", "Courier", monospace',
      color: '#f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    },

    // GTA 5 Scanlines Overlay - Animated
    scanlines: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: 0.3,
      animation: 'scanlineMove 8s linear infinite'
    },

    // GTA 5 Vignette
    vignette: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
      pointerEvents: 'none',
      zIndex: 1
    },

    // GTA Grid Pattern Overlay
    gridPattern: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.4
    },

    // Statistics Dashboard
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },

    statCard: {
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'visible',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)'
    },

    statLabel: {
      fontSize: '0.75rem',
      color: '#FFD700',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      fontFamily: '"Courier New", monospace',
      marginBottom: '0.5rem',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
    },

    statValue: {
      fontSize: '2rem',
      fontWeight: '900',
      color: '#2ECC71',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 20px rgba(46, 204, 113, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.8)',
      lineHeight: '1'
    },

    // Mission Status Banner
    missionBanner: {
      background: `
        linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(255, 215, 0, 0.15) 100%)
      `,
      border: '2px solid rgba(255, 215, 0, 0.4)',
      borderLeft: '6px solid #FFD700',
      padding: '1rem 1.5rem',
      marginBottom: '2rem',
      position: 'relative',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)'
    },

    missionTitle: {
      fontSize: '0.875rem',
      color: '#FFD700',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
      marginBottom: '0.25rem'
    },

    missionText: {
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    // HUD Clock Element
    hudClock: {
      position: 'fixed',
      top: '5rem',
      right: '2rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      padding: '0.75rem 1rem',
      zIndex: 50,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.5)',
      animation: 'slideInRight 0.6s ease-out'
    },

    hudClockLabel: {
      fontSize: '0.65rem',
      color: '#FFD700',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      marginBottom: '0.25rem'
    },

    hudClockTime: {
      fontSize: '1.25rem',
      color: '#2ECC71',
      fontWeight: '900',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 10px rgba(46, 204, 113, 0.5)',
      lineHeight: '1'
    },

    // Mission Indicator
    missionIndicator: {
      position: 'fixed',
      top: '9rem',
      right: '2rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      borderLeft: '4px solid #FFD700',
      padding: '0.75rem 1rem',
      zIndex: 50,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.5)',
      animation: 'slideInRight 0.8s ease-out'
    },

    missionIndicatorText: {
      fontSize: '0.7rem',
      color: '#FFD700',
      fontWeight: '800',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      animation: 'pulse 2s ease-in-out infinite'
    },

    // GTA Divider Line
    gtaDivider: {
      height: '2px',
      background: `
        linear-gradient(90deg,
          transparent 0%,
          rgba(255, 215, 0, 0.3) 20%,
          rgba(255, 215, 0, 0.8) 50%,
          rgba(255, 215, 0, 0.3) 80%,
          transparent 100%
        )
      `,
      margin: '2rem 0',
      position: 'relative',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
    },

    dividerIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#FFD700',
      padding: '0.5rem 1rem',
      fontSize: '0.75rem',
      fontWeight: '800',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'
    },

    institutionBar: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#FFD700',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
    },

    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },

    championshipHeader: {
      textAlign: 'center',
      margin: '3rem 0 2rem',
      position: 'relative',
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      borderRadius: '8px',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      boxShadow: `
        0 0 30px rgba(255, 215, 0, 0.15),
        inset 0 0 20px rgba(0, 0, 0, 0.5)
      `
    },

    // GTA Corner Brackets for Header - Animated
    headerCornerBracket: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      border: '3px solid #FFD700',
      animation: 'bracketGlow 2.5s ease-in-out infinite'
    },

    championshipTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: '900',
      color: '#FFD700',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      textShadow: `
        0 0 20px rgba(255, 215, 0, 0.6),
        0 0 40px rgba(255, 215, 0, 0.3),
        3px 3px 6px rgba(0, 0, 0, 0.8)
      `,
      fontFamily: '"Courier New", monospace',
      marginBottom: '0.5rem',
      textAlign: 'center',
      marginLeft: '-0.15em',
      marginRight: 0,
      paddingLeft: 0,
      paddingRight: 0,
      width: '100%',
      display: 'block'
    },

    lastUpdated: {
      fontSize: '0.875rem',
      color: '#64748b',
      fontWeight: '500'
    },

    controlsContainer: {
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '0px',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)'
    },

    searchContainer: {
      position: 'relative',
      flex: '1 1 300px',
      minWidth: '250px'
    },

    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '0px',
      color: '#FFFFFF',
      fontSize: '0.925rem',
      fontFamily: '"Courier New", monospace',
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
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '0px',
      color: '#FFFFFF',
      fontSize: '0.925rem',
      fontFamily: '"Courier New", monospace',
      appearance: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '160px',
      outline: 'none'
    },

    teamsCount: {
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#2ECC71',
      padding: '0.625rem 1.25rem',
      border: '2px solid #2ECC71',
      borderRadius: '0px',
      fontSize: '0.875rem',
      fontWeight: '800',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      whiteSpace: 'nowrap',
      boxShadow: '0 0 15px rgba(46, 204, 113, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'
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
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '0px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: `
        0 4px 20px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
      `,
      width: '100%'
    },

    // GTA Corner Brackets for Team Cards - Animated Glow
    cardCornerBracket: {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: '2px solid rgba(255, 215, 0, 0.6)',
      transition: 'all 0.3s ease',
      animation: 'bracketGlow 3s ease-in-out infinite'
    },

    rankIndicator: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      minWidth: '4rem',
      height: '3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: '800',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.6)',
      padding: '0.5rem 0.75rem',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'
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
      color: '#FFD700',
      marginBottom: '0.25rem',
      lineHeight: '1.3',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)'
    },

    pointsContainer: {
      textAlign: 'right'
    },

    teamPoints: {
      fontSize: '2.25rem',
      fontWeight: '900',
      color: '#2ECC71',
      lineHeight: '1',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 20px rgba(46, 204, 113, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.8)',
      letterSpacing: '0.05em'
    },

    pointsLabel: {
      fontSize: '0.75rem',
      color: '#FFD700',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
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
      color: '#FFD700',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontFamily: '"Courier New", monospace'
    },

    infoValue: {
      fontSize: '0.925rem',
      color: '#FFFFFF',
      fontWeight: '600',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase'
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#2ECC71',
      padding: '0.375rem 0.75rem',
      border: '2px solid #2ECC71',
      borderRadius: '0px',
      fontSize: '0.8125rem',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      boxShadow: '0 0 10px rgba(46, 204, 113, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)',
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
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '0px',
      color: '#FFD700',
      fontSize: '0.925rem',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      outline: 'none'
    },

    paginationButtonActive: {
      background: 'rgba(0, 0, 0, 0.95)',
      borderColor: '#FFD700',
      color: '#FFD700',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.5)'
    },

    footer: {
      textAlign: 'center',
      padding: '2rem 0',
      borderTop: '1px solid rgba(51, 65, 85, 0.3)',
      marginTop: '3rem'
    },

    footerText: {
      color: '#FFD700',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
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
      border: '4px solid rgba(255, 215, 0, 0.2)',
      borderTop: '4px solid #FFD700',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    loadingText: {
      fontSize: '1.125rem',
      fontWeight: '800',
      color: '#FFD700',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
    },

    // Team Performance Analytics Dashboard Styles - GTA Theme
    dashboardOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, rgba(10, 10, 10, 0.98) 70%),
        repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)
      `,
      backdropFilter: 'blur(16px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'dashboardFadeIn 0.4s ease-out'
    },

    dashboardContainer: {
      background: `
        linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(15, 15, 15, 0.98) 50%, rgba(5, 5, 5, 0.98) 100%)
      `,
      border: '3px solid rgba(255, 215, 0, 0.4)',
      borderRadius: '0px',
      maxWidth: '1100px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `
        0 32px 120px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(255, 215, 0, 0.2),
        inset 0 0 30px rgba(0, 0, 0, 0.8)
      `,
      animation: 'dashboardSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
    },

    // Dashboard Header - GTA Style
    dashboardHeader: {
      background: `
        linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)
      `,
      borderBottom: '2px solid rgba(255, 215, 0, 0.4)',
      padding: '1.5rem 2rem',
      position: 'relative',
      backdropFilter: 'blur(20px)'
    },

    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1.5rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid rgba(255, 215, 0, 0.6)',
      borderRadius: '0px',
      width: '2.5rem',
      height: '2.5rem',
      color: '#FFD700',
      fontSize: '1.125rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'
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
      fontWeight: '900',
      color: '#FFD700',
      marginBottom: '0.25rem',
      letterSpacing: '0.1em',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 3px 3px 6px rgba(0, 0, 0, 0.8)'
    },

    teamSubtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    rankBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#FFD700',
      padding: '0.5rem 1rem',
      border: '2px solid #FFD700',
      borderRadius: '0px',
      fontSize: '1rem',
      fontWeight: '800',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.5)'
    },

    scoreDisplay: {
      textAlign: 'center',
      minWidth: '160px'
    },

    totalScore: {
      fontSize: '3rem',
      fontWeight: '900',
      color: '#2ECC71',
      lineHeight: '1',
      marginBottom: '0.25rem',
      fontFamily: '"Courier New", monospace',
      textShadow: '0 0 30px rgba(46, 204, 113, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.8)'
    },

    maxScore: {
      fontSize: '1rem',
      color: '#FFD700',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
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
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0, 168, 255, 0.5) rgba(255, 255, 255, 0.1)',
      WebkitOverflowScrolling: 'touch'
    },

    // Main Dashboard Layout
    dashboardLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      minHeight: '100%',
      gap: '1.5rem',
      padding: '1.5rem',
      paddingBottom: '5rem'
    },

    // Left Panel - Main Analytics
    leftPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'visible'
    },

    // Right Panel - Detailed Metrics
    rightPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'visible'
    },

    // Glass Panel Base - GTA Style with Glow
    glassPanel: {
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '0px',
      padding: '1.5rem',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      overflow: 'visible',
      position: 'relative',
      animation: 'fadeInUp 0.5s ease-out'
    },

    // Panel Corner Bracket (for glass panels)
    panelBracket: {
      position: 'absolute',
      width: '15px',
      height: '15px',
      border: '2px solid rgba(255, 215, 0, 0.6)',
      animation: 'bracketGlow 3s ease-in-out infinite'
    },

    // Popup Scanlines
    popupScanlines: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',
      pointerEvents: 'none',
      zIndex: 1000,
      opacity: 0.2,
      animation: 'scanlineMove 8s linear infinite'
    },

    // Classified Stamp
    classifiedStamp: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: 'rgba(220, 38, 38, 0.9)',
      border: '3px solid rgba(220, 38, 38, 0.4)',
      padding: '0.5rem 1.5rem',
      transform: 'rotate(-15deg)',
      zIndex: 10,
      boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.5)'
    },

    classifiedText: {
      fontSize: '1.25rem',
      fontWeight: '900',
      color: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
      letterSpacing: '0.3em',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
    },

    // Mission ID Badge
    missionIdBadge: {
      position: 'absolute',
      top: '1rem',
      right: '5rem',
      background: 'rgba(0, 0, 0, 0.95)',
      border: '2px solid rgba(255, 215, 0, 0.5)',
      padding: '0.5rem 1rem',
      zIndex: 10,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'
    },

    missionIdText: {
      fontSize: '0.7rem',
      color: '#FFD700',
      fontWeight: '700',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.15em'
    },

    // Achievement Badge
    achievementBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid',
      borderRadius: '0px',
      padding: '0.75rem 1rem',
      fontFamily: '"Courier New", monospace',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontSize: '0.8rem',
      boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.5)',
      animation: 'pulse 2s ease-in-out infinite'
    },

    // Radar/Minimap Decoration
    radarDecoration: {
      position: 'absolute',
      bottom: '2rem',
      left: '2rem',
      width: '120px',
      height: '120px',
      background: `
        radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%),
        conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 0, 0.3) 45deg, transparent 90deg)
      `,
      border: '2px solid rgba(255, 215, 0, 0.4)',
      borderRadius: '50%',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      animation: 'radarSpin 4s linear infinite',
      zIndex: 5
    },

    radarCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '8px',
      height: '8px',
      background: '#FFD700',
      borderRadius: '50%',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)'
    },

    // Section Divider for Popup
    popupDivider: {
      height: '2px',
      background: `
        linear-gradient(90deg,
          transparent 0%,
          rgba(255, 215, 0, 0.3) 20%,
          rgba(255, 215, 0, 0.8) 50%,
          rgba(255, 215, 0, 0.3) 80%,
          transparent 100%
        )
      `,
      margin: '1.5rem 0',
      position: 'relative',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
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
      gridTemplateColumns: 'repeat(3, 1fr)',
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
      marginTop: '1rem',
      maxHeight: '400px',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: '0.5rem',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0, 168, 255, 0.5) rgba(255, 255, 255, 0.1)'
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
      {/* GTA 5 Scanlines Effect */}
      <div style={styles.scanlines}></div>
      {/* GTA 5 Vignette Effect */}
      <div style={styles.vignette}></div>
      {/* GTA Grid Pattern */}
      <div style={styles.gridPattern}></div>

      {/* HUD Clock */}
      <div className="hud-clock-mobile" style={styles.hudClock}>
        <div style={styles.hudClockLabel}>⏱ MISSION TIME</div>
        <div style={styles.hudClockTime}>{currentTime.toLocaleTimeString()}</div>
      </div>

      {/* Mission Indicator */}
      <div className="hud-mission-mobile" style={styles.missionIndicator}>
        <div style={styles.missionIndicatorText}>🔴 LIVE • BURNOUT 2025</div>
      </div>

      <HomeButton />

      {/* Institution Header Bar */}
      <div style={styles.institutionBar}>
        MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY
      </div>

      <div ref={containerRef} style={styles.container}>
        {/* Championship Header */}
        <div style={styles.championshipHeader}>
          {/* GTA 5 Corner Brackets */}
          <div style={{...styles.headerCornerBracket, top: '-3px', left: '-3px', borderRight: 'none', borderBottom: 'none'}}></div>
          <div style={{...styles.headerCornerBracket, top: '-3px', right: '-3px', borderLeft: 'none', borderBottom: 'none'}}></div>
          <div style={{...styles.headerCornerBracket, bottom: '-3px', left: '-3px', borderRight: 'none', borderTop: 'none'}}></div>
          <div style={{...styles.headerCornerBracket, bottom: '-3px', right: '-3px', borderLeft: 'none', borderTop: 'none'}}></div>

          <h1 style={{
            ...styles.championshipTitle,
            textIndent: '-0.15em'
          }}>
            BURNOUT LEADERBOARD
          </h1>
          <div style={styles.lastUpdated}>
            LAST UPDATED: {currentTime.toLocaleString().toUpperCase()}
          </div>
        </div>

        {/* Mission Status Banner */}
        <div style={styles.missionBanner}>
          <div style={styles.missionTitle}>⚠ MISSION STATUS: ACTIVE</div>
          <div style={styles.missionText}>
            SAE BURNOUT CHAMPIONSHIP 2025 • {filteredData.length} TEAMS COMPETING • LIVE RANKINGS
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            {/* Corner Brackets */}
            <div style={{position: 'absolute', top: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', top: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderTop: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderTop: 'none'}}></div>

            <div style={styles.statLabel}>📊 TOTAL TEAMS</div>
            <div style={styles.statValue}>{leaderboardData.length}</div>
          </div>

          <div style={styles.statCard}>
            {/* Corner Brackets */}
            <div style={{position: 'absolute', top: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', top: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderTop: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderTop: 'none'}}></div>

            <div style={styles.statLabel}>📈 AVERAGE SCORE</div>
            <div style={styles.statValue}>
              {leaderboardData.length > 0
                ? Math.round(leaderboardData.reduce((sum, team) => sum + team.points, 0) / leaderboardData.length)
                : 0}
            </div>
          </div>

          <div style={styles.statCard}>
            {/* Corner Brackets */}
            <div style={{position: 'absolute', top: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', top: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderTop: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderTop: 'none'}}></div>

            <div style={styles.statLabel}>🏆 TOP SCORE</div>
            <div style={styles.statValue}>
              {leaderboardData.length > 0
                ? Math.max(...leaderboardData.map(team => team.points))
                : 0}
            </div>
          </div>

          <div style={styles.statCard}>
            {/* Corner Brackets */}
            <div style={{position: 'absolute', top: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', top: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderBottom: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', left: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderRight: 'none', borderTop: 'none'}}></div>
            <div style={{position: 'absolute', bottom: '-2px', right: '-2px', width: '15px', height: '15px', border: '2px solid #FFD700', borderLeft: 'none', borderTop: 'none'}}></div>

            <div style={styles.statLabel}>✅ VERIFIED</div>
            <div style={styles.statValue}>
              {leaderboardData.filter(team => team.status === 'verified').length}
            </div>
          </div>
        </div>

        {/* GTA Divider */}
        <div style={styles.gtaDivider}>
          <div style={styles.dividerIcon}>⚡ SEARCH & FILTER ⚡</div>
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
                e.target.style.borderColor = '#FFD700';
                e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFD700';
              e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
              e.target.style.boxShadow = 'none';
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

        {/* GTA Divider */}
        <div style={styles.gtaDivider}>
          <div style={styles.dividerIcon}>🏁 RANKINGS 🏁</div>
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
                className="team-card-3d"
                style={styles.teamCard}
                onClick={() => handleTeamClick(team)}
              >
                {/* GTA 5 Corner Brackets */}
                <div style={{...styles.cardCornerBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                <div style={{...styles.cardCornerBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                <div style={{...styles.cardCornerBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                <div style={{...styles.cardCornerBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                {/* Rank Indicator - GTA Style */}
                <div style={{ ...styles.rankIndicator }}>
                  <span style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.8)' }}>
                    {team.position <= 3 ? '★'.repeat(Math.min(team.position, 5)) : `#${team.position}`}
                  </span>
                </div>

                {/* Team Header */}
                <div style={styles.teamHeader}>
                  <div>
                    <h3 style={styles.teamName}>{team.teamName}</h3>
                    {team.status === 'verified' && (
                      <div style={styles.statusBadge}>
                        ✓ VERIFIED
                      </div>
                    )}
                    {team.status === 'pending' && (
                      <div style={{...styles.statusBadge, color: '#F39C12', borderColor: '#F39C12', boxShadow: '0 0 10px rgba(243, 156, 18, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'}}>
                        ⏳ PENDING
                      </div>
                    )}
                    {team.status === 'rejected' && (
                      <div style={{...styles.statusBadge, color: '#E74C3C', borderColor: '#E74C3C', boxShadow: '0 0 10px rgba(231, 76, 60, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)'}}>
                        ❌ REJECTED
                      </div>
                    )}
                  </div>
                  <div style={styles.pointsContainer}>
                    <div style={styles.teamPoints}>
                      {team.points.toLocaleString()}
                    </div>
                    <div style={styles.pointsLabel}>POINTS</div>
                  </div>
                </div>

                {/* Leader Information */}
                <div style={styles.leaderInfo}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Leader</div>
                    <div style={styles.infoValue}>{team.leaderName}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{team.phone}</div>
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
            SAE Collegiate Club • Automotive Engineering Competition 2025
          </div>
        </div>
      </div>

      {/* Team Performance Analytics Dashboard */}
      {showAnalysisPopup && selectedTeamForAnalysis && (
        <div style={styles.dashboardOverlay} onClick={closeAnalyticsPopup}>
          <div className="dashboard-container-mobile" style={styles.dashboardContainer} onClick={(e) => e.stopPropagation()}>
            {/* Popup Scanlines Overlay */}
            <div style={styles.popupScanlines}></div>

            {/* GTA 5 Corner Brackets for Dashboard - Animated */}
            <div style={{
              position: 'absolute', top: '-3px', left: '-3px', width: '30px', height: '30px',
              border: '3px solid #FFD700', borderRight: 'none', borderBottom: 'none', zIndex: 10,
              animation: 'bracketGlow 2.5s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute', top: '-3px', right: '-3px', width: '30px', height: '30px',
              border: '3px solid #FFD700', borderLeft: 'none', borderBottom: 'none', zIndex: 10,
              animation: 'bracketGlow 2.5s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute', bottom: '-3px', left: '-3px', width: '30px', height: '30px',
              border: '3px solid #FFD700', borderRight: 'none', borderTop: 'none', zIndex: 10,
              animation: 'bracketGlow 2.5s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute', bottom: '-3px', right: '-3px', width: '30px', height: '30px',
              border: '3px solid #FFD700', borderLeft: 'none', borderTop: 'none', zIndex: 10,
              animation: 'bracketGlow 2.5s ease-in-out infinite'
            }}></div>

            {(() => {
              const performance = getPerformanceData(selectedTeamForAnalysis);
              const scorePercentage = (selectedTeamForAnalysis.points / 325) * 100;

              return (
                <>
                  {/* Dashboard Header */}
                  <div className="dashboard-header-mobile" style={styles.dashboardHeader}>
                    <button
                      className="close-button-mobile"
                      style={styles.closeButton}
                      onClick={closeAnalyticsPopup}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.95)';
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.borderColor = '#FFD700';
                        e.target.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 15px rgba(0, 0, 0, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.6)';
                        e.target.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)';
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
                        <div className="rank-badge-mobile" style={styles.rankBadge}>
                          🏆 Rank #{selectedTeamForAnalysis.position}
                        </div>
                      </div>

                      <div className="score-display-mobile" style={styles.scoreDisplay}>
                        <div className="total-score-mobile" style={styles.totalScore}>
                          {selectedTeamForAnalysis.points}
                        </div>
                        <div className="max-score-mobile" style={styles.maxScore}>/ 325 Points</div>

                        {/* Circular Progress Ring */}
                        <div className="progress-ring-mobile" style={styles.progressRing}>
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
                          <div className="progress-percentage-mobile" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#00A8FF',
                            textShadow: '0 0 10px rgba(0, 168, 255, 0.5)'
                          }}>
                            {Math.round(scorePercentage)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="dashboard-content-scrollable dashboard-content-mobile" style={styles.dashboardContent}>
                    <div className="dashboard-layout-mobile" style={styles.dashboardLayout}>

                      {/* Left Panel - Main Analytics */}
                      <div style={styles.leftPanel}>

                        {/* Performance Bar Chart */}
                        <div className="glass-panel-mobile" style={{...styles.glassPanel}}>
                          {/* Panel Corner Brackets */}
                          <div style={{...styles.panelBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            color: '#FFD700',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontFamily: '"Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
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

                        {/* Divider */}
                        <div style={styles.popupDivider}></div>

                        {/* Performance Distribution Pie Chart */}
                        <div className="glass-panel-mobile" style={{...styles.glassPanel}}>
                          {/* Panel Corner Brackets */}
                          <div style={{...styles.panelBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: '#FFD700',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            fontFamily: '"Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
                          }}>
                            Score Distribution
                          </h3>

                          <div className="pie-chart-wrapper" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            minHeight: '200px'
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
                                <>
                                  <div className="pie-chart-svg-container" style={{ position: 'relative' }}>
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
                                  </div>

                                  {/* Legend */}
                                  <div className="pie-chart-legend" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    marginLeft: '2rem'
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
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={styles.popupDivider}></div>

                        {/* Comparative Analytics */}
                        <div className="glass-panel-mobile" style={{...styles.glassPanel}}>
                          {/* Panel Corner Brackets */}
                          <div style={{...styles.panelBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: '#FFD700',
                            marginBottom: '1.5rem',
                            fontFamily: '"Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
                          }}>
                            Performance Insights
                          </h3>

                          <div className="comparison-container-mobile" style={styles.comparisonContainer}>
                            {/* Overall Score Percentage */}
                            <div style={styles.comparisonItem}>
                              <div style={styles.comparisonValue}>
                                {Math.round((selectedTeamForAnalysis.points / 325) * 100)}%
                              </div>
                              <div style={styles.comparisonLabel}>Score Efficiency</div>
                            </div>

                            {/* Performance Grade */}
                            <div style={styles.comparisonItem}>
                              <div style={{
                                ...styles.comparisonValue,
                                fontSize: '1.5rem',
                                background: (() => {
                                  const pct = (selectedTeamForAnalysis.points / 325) * 100;
                                  if (pct >= 90) return 'linear-gradient(135deg, #2ECC71, #27AE60)';
                                  if (pct >= 75) return 'linear-gradient(135deg, #00A8FF, #0077CC)';
                                  if (pct >= 60) return 'linear-gradient(135deg, #9B59B6, #8E44AD)';
                                  if (pct >= 40) return 'linear-gradient(135deg, #F39C12, #E67E22)';
                                  return 'linear-gradient(135deg, #95A5A6, #7F8C8D)';
                                })(),
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}>
                                {(() => {
                                  const pct = (selectedTeamForAnalysis.points / 325) * 100;
                                  if (pct >= 90) return 'A+';
                                  if (pct >= 80) return 'A';
                                  if (pct >= 70) return 'B+';
                                  if (pct >= 60) return 'B';
                                  if (pct >= 50) return 'C+';
                                  if (pct >= 40) return 'C';
                                  return 'D';
                                })()}
                              </div>
                              <div style={styles.comparisonLabel}>Performance Grade</div>
                            </div>

                            {/* Competition Tier */}
                            <div style={styles.comparisonItem}>
                              <div style={styles.comparisonValue}>
                                {performance.finalRace.qualified ? 'Finalist' :
                                 performance.prefinalRace.qualified ? 'Semi-Finalist' :
                                 performance.technicalInspection.passed ? 'Competitor' : 'Registered'}
                              </div>
                              <div style={styles.comparisonLabel}>Competition Tier</div>
                            </div>
                          </div>

                          {/* Additional Stats Row */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: 'rgba(0, 168, 255, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 168, 255, 0.1)'
                            }}>
                              <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#00A8FF',
                                marginBottom: '0.25rem'
                              }}>
                                {selectedTeamForAnalysis.points}
                              </div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Total Points
                              </div>
                            </div>

                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: 'rgba(46, 204, 113, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(46, 204, 113, 0.1)'
                            }}>
                              <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#2ECC71',
                                marginBottom: '0.25rem'
                              }}>
                                #{selectedTeamForAnalysis.position}
                              </div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Rank
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel - Detailed Metrics */}
                      <div style={styles.rightPanel}>

                        {/* Individual Performance Metrics */}
                        <div className="glass-panel-mobile" style={{...styles.glassPanel}}>
                          {/* Panel Corner Brackets */}
                          <div style={{...styles.panelBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: '#FFD700',
                            marginBottom: '1.5rem',
                            fontFamily: '"Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
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
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={styles.popupDivider}></div>

                        {/* Performance Feedback */}
                        <div className="glass-panel-mobile" style={{
                          ...styles.glassPanel,
                          marginBottom: '2rem'
                        }}>
                          {/* Panel Corner Brackets */}
                          <div style={{...styles.panelBracket, top: '-2px', left: '-2px', borderRight: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, top: '-2px', right: '-2px', borderLeft: 'none', borderBottom: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', left: '-2px', borderRight: 'none', borderTop: 'none'}}></div>
                          <div style={{...styles.panelBracket, bottom: '-2px', right: '-2px', borderLeft: 'none', borderTop: 'none'}}></div>

                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: '#FFD700',
                            marginBottom: '1rem',
                            fontFamily: '"Courier New", monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)'
                          }}>
                            Performance Assessment
                          </h3>

                          {(() => {
                            const scorePercentage = (selectedTeamForAnalysis.points / 325) * 100;
                            let feedback = {};

                            if (scorePercentage >= 90) {
                              feedback = {
                                title: 'Outstanding Performance',
                                message: 'Exceptional work! Your team has demonstrated excellence across all competition stages.',
                                icon: '🏆',
                                color: '#2ECC71',
                                bgColor: 'rgba(46, 204, 113, 0.1)',
                                borderColor: 'rgba(46, 204, 113, 0.3)'
                              };
                            } else if (scorePercentage >= 75) {
                              feedback = {
                                title: 'Excellent Work',
                                message: 'Great job! Your team has shown strong performance and technical skills.',
                                icon: '⭐',
                                color: '#00A8FF',
                                bgColor: 'rgba(0, 168, 255, 0.1)',
                                borderColor: 'rgba(0, 168, 255, 0.3)'
                              };
                            } else if (scorePercentage >= 60) {
                              feedback = {
                                title: 'Good Work',
                                message: 'Well done! Your team has performed solidly. Focus on key areas to improve further.',
                                icon: '👍',
                                color: '#9B59B6',
                                bgColor: 'rgba(155, 89, 182, 0.1)',
                                borderColor: 'rgba(155, 89, 182, 0.3)'
                              };
                            } else if (scorePercentage >= 40) {
                              feedback = {
                                title: 'Keep Improving',
                                message: 'Your team has potential. Focus on technical skills and competition strategies for better results.',
                                icon: '📈',
                                color: '#F39C12',
                                bgColor: 'rgba(243, 156, 18, 0.1)',
                                borderColor: 'rgba(243, 156, 18, 0.3)'
                              };
                            } else {
                              feedback = {
                                title: 'Need More Practice',
                                message: 'Keep working hard! Every competition is a learning opportunity. Analyze your performance and come back stronger.',
                                icon: '💪',
                                color: '#E74C3C',
                                bgColor: 'rgba(231, 76, 60, 0.1)',
                                borderColor: 'rgba(231, 76, 60, 0.3)'
                              };
                            }

                            return (
                              <div style={{
                                background: feedback.bgColor,
                                border: `1px solid ${feedback.borderColor}`,
                                borderRadius: '0px',
                                padding: '1.25rem',
                                textAlign: 'center'
                              }}>
                                {/* Achievement Badge */}
                                <div style={{
                                  ...styles.achievementBadge,
                                  borderColor: feedback.color,
                                  color: feedback.color,
                                  marginBottom: '1rem',
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}>
                                  <span>{feedback.icon}</span>
                                  <span>ACHIEVEMENT UNLOCKED</span>
                                </div>

                                <div style={{
                                  fontSize: '2rem',
                                  marginBottom: '0.75rem'
                                }}>
                                  {feedback.icon}
                                </div>
                                <div style={{
                                  fontSize: '1.125rem',
                                  fontWeight: '700',
                                  color: feedback.color,
                                  marginBottom: '0.5rem'
                                }}>
                                  {feedback.title}
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  lineHeight: '1.5',
                                  maxWidth: '95%',
                                  margin: '0 auto'
                                }}>
                                  {feedback.message}
                                </div>

                                {/* Score Display */}
                                <div style={{
                                  marginTop: '1rem',
                                  paddingTop: '1rem',
                                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: '1.5rem'
                                }}>
                                  <div>
                                    <div style={{
                                      fontSize: '1.25rem',
                                      fontWeight: '700',
                                      color: feedback.color
                                    }}>
                                      {selectedTeamForAnalysis.points}
                                    </div>
                                    <div style={{
                                      fontSize: '0.65rem',
                                      color: 'rgba(255, 255, 255, 0.5)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      Total Points
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{
                                      fontSize: '1.25rem',
                                      fontWeight: '700',
                                      color: feedback.color
                                    }}>
                                      {Math.round(scorePercentage)}%
                                    </div>
                                    <div style={{
                                      fontSize: '0.65rem',
                                      color: 'rgba(255, 255, 255, 0.5)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      Score Rate
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
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

          @keyframes scanlineMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(10px); }
          }

          @keyframes bracketGlow {
            0%, 100% {
              opacity: 0.6;
              box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
            }
            50% {
              opacity: 1;
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          @keyframes slideInRight {
            0% {
              opacity: 0;
              transform: translateX(30px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Card 3D Tilt Effect */
          .team-card-3d {
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
          }

          .team-card-3d:hover {
            transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-8px) scale(1.02);
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes radarSpin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes glitch {
            0%, 100% {
              transform: translate(0);
            }
            20% {
              transform: translate(-2px, 2px);
            }
            40% {
              transform: translate(-2px, -2px);
            }
            60% {
              transform: translate(2px, 2px);
            }
            80% {
              transform: translate(2px, -2px);
            }
          }


          @media (max-width: 768px) {
            .controlsContainer {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .searchContainer {
              min-width: auto !important;
            }

            /* Show HUD elements on mobile with adjusted positioning */
            .hud-clock-mobile {
              top: 4.5rem !important;
              right: 1rem !important;
              font-size: 0.75rem !important;
            }

            .hud-mission-mobile {
              top: 7.5rem !important;
              right: 1rem !important;
              font-size: 0.7rem !important;
            }

            /* Popup mobile adjustments */
            .popup-classified-mobile {
              transform: rotate(-15deg) scale(0.7) !important;
              top: 0.5rem !important;
              left: 0.5rem !important;
            }

            .popup-mission-id-mobile {
              top: 0.5rem !important;
              right: 3rem !important;
              padding: 0.25rem 0.5rem !important;
              font-size: 0.6rem !important;
            }

            .popup-radar-mobile {
              display: none !important;
            }

            /* Championship header mobile fixes */
            h1 {
              text-align: center !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
          }

          input::placeholder {
            color: #64748b;
          }

          select:focus,
          input:focus {
            outline: none;
          }

          /* Custom Scrollbar Styles for Dashboard Popup */
          .dashboard-content-scrollable::-webkit-scrollbar {
            width: 8px;
          }

          .dashboard-content-scrollable::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .dashboard-content-scrollable::-webkit-scrollbar-thumb {
            background: rgba(0, 168, 255, 0.5);
            border-radius: 10px;
            transition: background 0.3s ease;
          }

          .dashboard-content-scrollable::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 168, 255, 0.7);
          }

          /* Custom Scrollbar Styles for Team Roster Grid */
          .members-grid-scrollable::-webkit-scrollbar {
            width: 6px;
          }

          .members-grid-scrollable::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
          }

          .members-grid-scrollable::-webkit-scrollbar-thumb {
            background: rgba(0, 168, 255, 0.4);
            border-radius: 10px;
            transition: background 0.3s ease;
          }

          .members-grid-scrollable::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 168, 255, 0.6);
          }

          /* Custom Scrollbar for Team Roster Card */
          .team-roster-scrollable::-webkit-scrollbar {
            width: 6px;
          }

          .team-roster-scrollable::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
          }

          .team-roster-scrollable::-webkit-scrollbar-thumb {
            background: rgba(0, 168, 255, 0.4);
            border-radius: 10px;
            transition: background 0.3s ease;
          }

          .team-roster-scrollable::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 168, 255, 0.6);
          }

          /* Mobile Responsive Styles for Dashboard Popup */
          @media (max-width: 768px) {
            .dashboard-container-mobile {
              width: 95% !important;
              max-height: 92vh !important;
              border-radius: 15px !important;
            }

            .dashboard-header-mobile {
              padding: 1rem !important;
              flex-direction: column !important;
              align-items: center !important;
            }

            .dashboard-header-mobile h1 {
              font-size: 1.25rem !important;
              text-align: center !important;
            }

            .dashboard-header-mobile p {
              font-size: 0.75rem !important;
              text-align: center !important;
            }

            .dashboard-content-mobile {
              height: calc(92vh - 100px) !important;
            }

            .dashboard-layout-mobile {
              grid-template-columns: 1fr !important;
              padding: 1rem !important;
              gap: 1rem !important;
              padding-bottom: 3rem !important;
            }

            .close-button-mobile {
              width: 2rem !important;
              height: 2rem !important;
              font-size: 1rem !important;
              top: 0.75rem !important;
              right: 1rem !important;
            }

            .rank-badge-mobile {
              font-size: 0.75rem !important;
              padding: 0.25rem 0.75rem !important;
            }

            .score-display-mobile {
              margin-top: 1rem !important;
            }

            .total-score-mobile {
              font-size: 2rem !important;
            }

            .max-score-mobile {
              font-size: 0.875rem !important;
            }

            .progress-ring-mobile {
              width: 100px !important;
              height: 100px !important;
              margin: 0.5rem auto !important;
              transform: scale(0.7) !important;
              overflow: visible !important;
            }

            .progress-ring-mobile svg {
              width: 100px !important;
              height: 100px !important;
              overflow: visible !important;
            }

            .progress-percentage-mobile {
              font-size: 1.125rem !important;
              font-weight: 800 !important;
              color: #FFFFFF !important;
              text-shadow: 0 0 15px rgba(0, 168, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5) !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
            }

            .glass-panel-mobile {
              padding: 1rem !important;
            }

            .glass-panel-mobile h3 {
              font-size: 1rem !important;
              margin-bottom: 0.75rem !important;
            }

            .comparison-container-mobile {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }

            /* Pie Chart Mobile Adjustments */
            .pie-chart-wrapper {
              flex-direction: column !important;
              align-items: center !important;
              min-height: auto !important;
            }

            .pie-chart-svg-container {
              margin-bottom: 1rem !important;
            }

            .pie-chart-svg-container svg {
              width: 180px !important;
              height: 180px !important;
            }

            .pie-chart-legend {
              margin-left: 0 !important;
              margin-top: 0.5rem !important;
              width: 100% !important;
              max-width: 250px !important;
              align-items: flex-start !important;
            }

            /* Hide or adjust specific elements for mobile */
            .metricItem {
              font-size: 0.875rem !important;
            }

            /* Adjust progress bars for mobile */
            .progress-bar {
              height: 16px !important;
            }

            /* Better spacing for mobile performance assessment */
            .feedback-icon-mobile {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LeaderboardNew;