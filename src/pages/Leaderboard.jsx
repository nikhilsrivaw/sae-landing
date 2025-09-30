import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { supabaseService } from '../lib/supabase';
import HomeButton from '../components/HomeButton';

const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeamForAnalysis, setSelectedTeamForAnalysis] = useState(null);
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const teamsPerPage = 10;

  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // Function to generate comprehensive team stats for analysis
  const generateTeamStats = (index) => {
    const basePoints = Math.max(3000 - (index * 50) + Math.floor(Math.random() * 100), 500);
    const totalRaces = Math.floor(Math.random() * 10) + 8; // 8-18 races
    const wins = Math.floor(totalRaces * (0.8 - index * 0.05)); // Decreasing win rate
    const winPercentage = Math.round((wins / totalRaces) * 100);
    const avgPoints = Math.round(basePoints / totalRaces);

    const minutes = Math.floor(Math.random() * 2) + 2; // 2-4 minutes
    const seconds = Math.floor(Math.random() * 60); // 0-59 seconds
    const milliseconds = Math.floor(Math.random() * 100); // 0-99 milliseconds
    const lapTime = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;

    const events = [
      "BAJA SAE 2024",
      "Formula SAE",
      "Efficiency Challenge",
      "Endurance Race",
      "Go-Kart Championship",
      "Design Competition",
      "Innovation Challenge",
      "Technical Presentation"
    ];

    const achievements = [
      "🏆 Overall Champion",
      "🥈 Runner-up",
      "🥉 Third Place",
      "🏁 Best Performance",
      "🎯 Technical Excellence",
      "⚡ Innovation Award",
      "🔧 Best Engineering",
      "🏅 Rising Star",
      "💡 Creative Design",
      "🌟 Team Spirit"
    ];

    // Generate detailed performance breakdown
    const designScore = Math.max(60, 100 - index * 3 + Math.floor(Math.random() * 20));
    const performanceScore = Math.max(50, 95 - index * 4 + Math.floor(Math.random() * 25));
    const innovationScore = Math.max(45, 90 - index * 3.5 + Math.floor(Math.random() * 20));
    const teamworkScore = Math.max(70, 95 - index * 2 + Math.floor(Math.random() * 15));
    const technicalScore = Math.max(55, 92 - index * 3 + Math.floor(Math.random() * 18));

    // Event-wise performance
    const eventPerformance = [
      { event: "BAJA SAE 2024", score: Math.max(40, 90 - index * 4), position: Math.min(index + 1 + Math.floor(Math.random() * 3), 20) },
      { event: "Formula SAE", score: Math.max(35, 85 - index * 3.5), position: Math.min(index + 2 + Math.floor(Math.random() * 4), 25) },
      { event: "Efficiency Challenge", score: Math.max(30, 80 - index * 3), position: Math.min(index + 1 + Math.floor(Math.random() * 2), 15) },
      { event: "Design Competition", score: Math.max(45, 88 - index * 3.2), position: Math.min(index + 3 + Math.floor(Math.random() * 3), 18) }
    ];

    // Monthly progress data
    const monthlyProgress = [
      { month: "Jan", points: Math.floor(basePoints * 0.1) },
      { month: "Feb", points: Math.floor(basePoints * 0.18) },
      { month: "Mar", points: Math.floor(basePoints * 0.25) },
      { month: "Apr", points: Math.floor(basePoints * 0.35) },
      { month: "May", points: Math.floor(basePoints * 0.5) },
      { month: "Jun", points: Math.floor(basePoints * 0.65) },
      { month: "Jul", points: Math.floor(basePoints * 0.78) },
      { month: "Aug", points: Math.floor(basePoints * 0.88) },
      { month: "Sep", points: basePoints }
    ];

    // Skills breakdown
    const skillsBreakdown = {
      mechanical: Math.max(50, 90 - index * 2.5 + Math.floor(Math.random() * 15)),
      electrical: Math.max(45, 85 - index * 3 + Math.floor(Math.random() * 20)),
      software: Math.max(40, 80 - index * 3.5 + Math.floor(Math.random() * 18)),
      design: Math.max(55, 92 - index * 2.8 + Math.floor(Math.random() * 12)),
      teamwork: Math.max(60, 95 - index * 2 + Math.floor(Math.random() * 10))
    };

    return {
      points: basePoints,
      totalRaces,
      winPercentage,
      avgPoints,
      lapTime,
      events: events.slice(0, Math.floor(Math.random() * 3) + 2),
      achievements: achievements[Math.floor(Math.random() * achievements.length)],
      bestFinish: `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place - ${events[Math.floor(Math.random() * events.length)]}`,

      // Enhanced analysis data
      performanceBreakdown: {
        design: designScore,
        performance: performanceScore,
        innovation: innovationScore,
        teamwork: teamworkScore,
        technical: technicalScore
      },
      eventPerformance,
      monthlyProgress,
      skillsBreakdown,
      overallRating: Math.round((designScore + performanceScore + innovationScore + teamworkScore + technicalScore) / 5),
      strengths: ["Mechanical Design", "Team Coordination", "Innovation"].slice(0, Math.floor(Math.random() * 2) + 1),
      improvements: ["Time Management", "Software Skills", "Presentation"].slice(0, Math.floor(Math.random() * 2) + 1)
    };
  };

  // Function to process database teams into leaderboard format
  const processTeamsData = (teams) => {
    return teams.map((team, index) => {
      const stats = generateTeamStats(index);

      // Get all team members
      const members = [
        team.leader_name,
        team.member1_name,
        team.member2_name,
        team.member3_name,
        team.member4_name
      ].filter(Boolean); // Remove null/undefined members

      return {
        id: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        leaderRoll: team.leader_roll,
        leaderBranch: team.leader_branch,
        leaderPhone: team.leader_phone,
        position: index + 1,
        members,
        institution: "MMMUT",
        registrationStatus: team.registration_status,
        paymentVerified: team.payment_verified,
        createdAt: team.created_at,
        ...stats
      };
    });
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch teams from database
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching teams from database...');

        const teams = await supabaseService.getTeamRegistrations();
        console.log(`Found ${teams.length} teams in database`);

        // Process teams into leaderboard format and sort by points (highest first)
        const processedTeams = processTeamsData(teams);
        const sortedTeams = processedTeams.sort((a, b) => b.points - a.points);

        // Update positions after sorting
        const rankedTeams = sortedTeams.map((team, index) => ({
          ...team,
          position: index + 1
        }));

        setLeaderboardData(rankedTeams);
        setFilteredData(rankedTeams);

        // Animate cards in sequence
        setTimeout(() => {
          gsap.fromTo(cardsRef.current,
            { y: 50, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "back.out(1.7)"
            }
          );
        }, 200);

      } catch (error) {
        console.error('Error fetching teams:', error);
        // Fallback to empty array if database fails
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Filter and search logic
  useEffect(() => {
    console.log('Filtering teams...', {
      leaderboardDataLength: leaderboardData.length,
      searchTerm,
      statusFilter
    });

    let filtered = leaderboardData.filter(team => {
      const matchesSearch =
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderRoll.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || team.registrationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    console.log('Filtered results:', {
      originalLength: leaderboardData.length,
      filteredLength: filtered.length,
      firstFewTeams: filtered.slice(0, 3).map(t => ({ id: t.id, name: t.teamName }))
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, leaderboardData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / teamsPerPage);
  const startIndex = (currentPage - 1) * teamsPerPage;
  const endIndex = startIndex + teamsPerPage;
  const currentTeams = filteredData.slice(startIndex, endIndex);

  // Debug logging
  console.log('Pagination Debug:', {
    currentPage,
    totalPages,
    filteredDataLength: filteredData.length,
    startIndex,
    endIndex,
    currentTeamsLength: currentTeams.length,
    teamsPerPage
  });

  // Reset cardsRef when page changes to ensure proper GSAP targeting
  useEffect(() => {
    cardsRef.current = [];

    // Animate cards after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!isLoading && cardsRef.current.length > 0) {
        gsap.fromTo(cardsRef.current,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
          }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentPage, isLoading]);

  const getPositionIcon = (position) => {
    switch(position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getPositionColor = (position) => {
    switch(position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#1e40af';
    }
  };

  const getPositionGradient = (position) => {
    switch(position) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 50%, #808080 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #D2691E 50%, #A0522D 100%)';
      default: return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)';
    }
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const openTeamAnalysis = (team) => {
    setSelectedTeamForAnalysis(team);
    setShowAnalysisPopup(true);
  };

  const closeTeamAnalysis = () => {
    setShowAnalysisPopup(false);
    setSelectedTeamForAnalysis(null);
  };

  // World-Class Bar Chart with Data Storytelling
  const BarChart = ({ data, title, color = '#3b82f6' }) => {
    if (!data) return null;

    const entries = Object.entries(data);
    const maxValue = Math.max(...entries.map(([, value]) => value));
    const avgValue = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;

    const getPerformanceLevel = (value) => {
      if (value >= 90) return { level: 'Elite', color: '#10b981', icon: '🔥' };
      if (value >= 80) return { level: 'Excellent', color: '#3b82f6', icon: '⭐' };
      if (value >= 70) return { level: 'Good', color: '#f59e0b', icon: '💪' };
      if (value >= 60) return { level: 'Average', color: '#6b7280', icon: '📈' };
      return { level: 'Needs Improvement', color: '#ef4444', icon: '🎯' };
    };

    const getBarColor = (value) => {
      const performance = getPerformanceLevel(value);
      return performance.color;
    };

    return (
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        {/* Enhanced Title with Context */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '8px',
            color: '#1f2937',
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {title}
          </h4>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <span>Team Average: <strong style={{ color: '#1f2937' }}>{avgValue.toFixed(1)}%</strong></span>
            <span>Peak Score: <strong style={{ color: '#1f2937' }}>{maxValue}%</strong></span>
          </div>
        </div>

        {/* Sophisticated Bar Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.map(([key, value], index) => {
            const performance = getPerformanceLevel(value);
            const barColor = getBarColor(value);
            const isHighest = value === maxValue;

            return (
              <div key={key} style={{
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)
                `,
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                border: isHighest ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: isHighest ?
                  '0 8px 25px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)' :
                  '0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                animation: `chartBarAppear 0.8s ease-out ${index * 0.1}s both`
              }}>
                {/* Top Performance Indicator */}
                {isHighest && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #10b981, #22c55e)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}>
                    TOP SCORE
                  </div>
                )}

                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      color: '#1f2937',
                      fontFamily: '"Inter", sans-serif'
                    }}>
                      {key}
                    </div>
                    <div style={{
                      background: `linear-gradient(135deg, ${performance.color}20, ${performance.color}10)`,
                      color: performance.color,
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: `1px solid ${performance.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {performance.icon} {performance.level}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: barColor,
                    fontFamily: '"Inter", sans-serif'
                  }}>
                    {value}%
                  </div>
                </div>

                {/* Advanced Progress Bar */}
                <div style={{
                  position: 'relative',
                  height: '16px',
                  background: `
                    linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)
                  `,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* Background Grid Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 19px,
                        rgba(0,0,0,0.02) 19px,
                        rgba(0,0,0,0.02) 20px
                      )
                    `
                  }} />

                  {/* Progress Fill */}
                  <div style={{
                    width: `${value}%`,
                    height: '100%',
                    background: `
                      linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 50%, ${barColor} 100%),
                      linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)
                    `,
                    borderRadius: '12px',
                    position: 'relative',
                    animation: `barFill 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1 + 0.3}s both`,
                    boxShadow: `
                      0 0 15px ${barColor}40,
                      inset 0 1px 0 rgba(255,255,255,0.5)
                    `
                  }}>
                    {/* Animated Shine Effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-50%',
                      width: '50%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                      animation: `barShine 2s ease-in-out ${index * 0.2 + 1}s infinite`,
                      borderRadius: '12px'
                    }} />
                  </div>
                </div>

                {/* Performance Insights */}
                <div style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    {value > avgValue ? '↗️ Above average' : value === avgValue ? '➡️ At average' : '↘️ Below average'}
                    <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                      ({value > avgValue ? '+' : ''}{(value - avgValue).toFixed(1)}%)
                    </span>
                  </span>
                  <span style={{ color: '#374151', fontWeight: '600' }}>
                    {((value / maxValue) * 100).toFixed(0)}% of peak
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sophisticated Pie Chart with Interactive Storytelling
  const PieChart = ({ data, title }) => {
    if (!data) return null;

    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    const maxValue = Math.max(...entries.map(([, value]) => value));
    const dominantSkill = entries.find(([, value]) => value === maxValue);

    let currentAngle = 0;
    const radius = 80;
    const innerRadius = 35;
    const centerX = 100;
    const centerY = 100;

    const sophisticatedColors = [
      { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
      { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
      { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fcd34d' },
      { primary: '#ef4444', secondary: '#f87171', accent: '#fca5a5' },
      { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
      { primary: '#ec4899', secondary: '#f472b6', accent: '#f9a8d4' }
    ];

    const getSkillInsight = (key, value, percentage) => {
      if (percentage >= 25) return { status: 'strength', icon: '🔥', message: 'Core Strength' };
      if (percentage >= 20) return { status: 'proficient', icon: '⭐', message: 'Strong Skill' };
      if (percentage >= 15) return { status: 'developing', icon: '📈', message: 'Growing' };
      return { status: 'opportunity', icon: '🎯', message: 'Growth Area' };
    };

    return (
      <div style={{ marginBottom: '30px' }}>
        {/* Enhanced Title with Insights */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '8px',
            color: '#1f2937',
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {title}
          </h4>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            <span style={{ color: '#1f2937', fontWeight: '700' }}>
              Dominant Strength: {dominantSkill[0].charAt(0).toUpperCase() + dominantSkill[0].slice(1)}
            </span>
            <span style={{ marginLeft: '15px' }}>
              ({((dominantSkill[1] / total) * 100).toFixed(1)}% of total skills)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px' }}>
          {/* Advanced Donut Chart */}
          <div style={{
            position: 'relative',
            background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)
            `,
            borderRadius: '50%',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <svg width="200" height="200" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
              {/* Background Circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="6"
              />

              {/* Chart Segments */}
              {entries.map(([key, value], index) => {
                const percentage = (value / total) * 100;
                const angle = (value / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;

                // Outer arc
                const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                // Inner arc
                const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;
                const colors = sophisticatedColors[index % sophisticatedColors.length];

                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                  'Z'
                ].join(' ');

                currentAngle += angle;

                return (
                  <g key={key}>
                    {/* Main segment */}
                    <path
                      d={pathData}
                      fill={`url(#gradient${index})`}
                      stroke="white"
                      strokeWidth="3"
                      style={{
                        filter: `drop-shadow(0 2px 4px ${colors.primary}40)`,
                        animation: `pieSegmentAppear 1s ease-out ${index * 0.1}s both`
                      }}
                    />

                    {/* Gradient definitions */}
                    <defs>
                      <radialGradient id={`gradient${index}`} cx="0.3" cy="0.3">
                        <stop offset="0%" stopColor={colors.accent} />
                        <stop offset="70%" stopColor={colors.secondary} />
                        <stop offset="100%" stopColor={colors.primary} />
                      </radialGradient>
                    </defs>

                    {/* Value labels */}
                    {percentage > 8 && (
                      <text
                        x={centerX + (radius - 20) * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                        y={centerY + (radius - 20) * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="13"
                        fontWeight="700"
                        fill="white"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {percentage.toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Center Circle with Total */}
              <circle
                cx={centerX}
                cy={centerY}
                r={innerRadius}
                fill="url(#centerGradient)"
                stroke="white"
                strokeWidth="3"
              />
              <defs>
                <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <text
                x={centerX}
                y={centerY - 5}
                textAnchor="middle"
                fontSize="16"
                fontWeight="900"
                fill="#1f2937"
              >
                {total}
              </text>
              <text
                x={centerX}
                y={centerY + 12}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#6b7280"
              >
                TOTAL POINTS
              </text>
            </svg>
          </div>

          {/* Enhanced Legend with Insights */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entries.map(([key, value], index) => {
                const percentage = ((value / total) * 100);
                const colors = sophisticatedColors[index % sophisticatedColors.length];
                const insight = getSkillInsight(key, value, percentage);

                return (
                  <div key={key} style={{
                    background: `
                      linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)
                    `,
                    backdropFilter: 'blur(10px)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${colors.primary}20`,
                    boxShadow: `0 4px 15px ${colors.primary}15`,
                    transition: 'all 0.3s ease',
                    animation: `legendItemAppear 0.6s ease-out ${index * 0.1 + 0.5}s both`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          borderRadius: '50%',
                          boxShadow: `0 2px 8px ${colors.primary}40`
                        }} />
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#1f2937',
                          textTransform: 'capitalize',
                          fontFamily: '"Inter", sans-serif'
                        }}>
                          {key}
                        </span>
                      </div>
                      <div style={{
                        background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
                        color: colors.primary,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: `1px solid ${colors.primary}30`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {insight.icon} {insight.message}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <span>
                        <strong style={{ color: '#1f2937' }}>{value}</strong> points
                      </span>
                      <span>
                        <strong style={{ color: colors.primary }}>{percentage.toFixed(1)}%</strong> of skills
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div style={{
                      marginTop: '8px',
                      height: '4px',
                      background: '#f1f5f9',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                        borderRadius: '2px',
                        animation: `miniBarFill 1s ease-out ${index * 0.1 + 0.8}s both`
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component for rendering line chart (monthly progress)
  const LineChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.points));
    const width = 300;
    const height = 150;
    const padding = 30;

    const points = data.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (data.length - 1);
      const y = height - padding - ((d.points / maxValue) * (height - padding * 2));
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: '15px',
          color: '#1f2937',
          fontFamily: '"Poppins", sans-serif'
        }}>
          {title}
        </h4>
        <div style={{ position: 'relative' }}>
          <svg width={width} height={height} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1={padding}
                y1={padding + (i * (height - padding * 2)) / 4}
                x2={width - padding}
                y2={padding + (i * (height - padding * 2)) / 4}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Data line */}
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data && data.map((d, i) => {
              const x = padding + (i * (width - padding * 2)) / (data.length - 1);
              const y = height - padding - ((d.points / maxValue) * (height - padding * 2));
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

            {/* Month labels */}
            {data && data.map((d, i) => {
              const x = padding + (i * (width - padding * 2)) / (data.length - 1);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {d.month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
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
      padding: '0',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      position: 'relative',
      color: '#f1f5f9'
    },
    container: {
      background: 'transparent',
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      position: 'relative'
    },

    // New SAE Championship Header Styles
    institutionBar: {
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(220, 38, 38, 0.2)',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },

    institutionText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#cbd5e1',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
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
      '::placeholder': {
        color: '#64748b'
      }
    },

    searchIcon: {
      position: 'absolute',
      left: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      fontSize: '1.125rem'
    },

    filterContainer: {
      position: 'relative',
      minWidth: '160px'
    },

    filterSelect: {
      width: '100%',
      padding: '0.75rem 2.5rem 0.75rem 1rem',
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      borderRadius: '0.75rem',
      color: '#f1f5f9',
      fontSize: '0.925rem',
      appearance: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
    paperTexture: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.12,
      background: `
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(0,0,0,0.025) 1px,
          rgba(0,0,0,0.025) 2px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(0,0,0,0.02) 1px,
          rgba(0,0,0,0.02) 2px
        ),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(139, 125, 107, 0.015) 20px,
          rgba(139, 125, 107, 0.015) 21px
        )
      `,
      pointerEvents: 'none'
    },
    // Enhanced stains and wear marks
    stains: {
      position: 'absolute',
      top: '12%',
      right: '8%',
      width: '100px',
      height: '75px',
      background: 'radial-gradient(ellipse, rgba(101, 67, 33, 0.12) 0%, rgba(139, 69, 19, 0.08) 50%, transparent 80%)',
      borderRadius: '60% 40%',
      transform: 'rotate(-15deg)'
    },
    stains2: {
      position: 'absolute',
      bottom: '18%',
      left: '3%',
      width: '140px',
      height: '50px',
      background: 'radial-gradient(ellipse, rgba(139, 69, 19, 0.1) 0%, rgba(101, 67, 33, 0.06) 60%, transparent 85%)',
      borderRadius: '50%',
      transform: 'rotate(25deg)'
    },
    stains3: {
      position: 'absolute',
      top: '45%',
      right: '2%',
      width: '60px',
      height: '30px',
      background: 'radial-gradient(ellipse, rgba(160, 145, 125, 0.08) 0%, transparent 70%)',
      borderRadius: '50%',
      transform: 'rotate(-45deg)'
    },
    // Enhanced staples
    stapleLeft: {
      position: 'absolute',
      top: '35px',
      left: '90px',
      width: '16px',
      height: '16px',
      background: 'linear-gradient(45deg, #2a2a2a 0%, #444 30%, #666 50%, #444 70%, #2a2a2a 100%)',
      borderRadius: '50%',
      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), 0 0 0 2px #1a1a1a',
      border: '1px solid #555'
    },
    stapleRight: {
      position: 'absolute',
      top: '35px',
      right: '90px',
      width: '16px',
      height: '16px',
      background: 'linear-gradient(45deg, #2a2a2a 0%, #444 30%, #666 50%, #444 70%, #2a2a2a 100%)',
      borderRadius: '50%',
      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), 0 0 0 2px #1a1a1a',
      border: '1px solid #555'
    },
    // Enhanced header design
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      position: 'relative',
      zIndex: 2
    },
    logoSection: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #60a5fa 60%, #1e40af 100%)',
      color: '#fff',
      padding: '16px 32px',
      margin: '0 auto 30px',
      width: 'fit-content',
      fontFamily: '"Poppins", sans-serif',
      fontSize: window.innerWidth < 768 ? '12px' : '16px',
      fontWeight: '700',
      letterSpacing: '2px',
      border: '3px solid #1e40af',
      borderRadius: '12px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
      boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    title: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '28px' : '42px',
      fontWeight: '800',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '2px' : '4px',
      margin: window.innerWidth < 768 ? '20px 0' : '30px 0',
      textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
      lineHeight: '1.1',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 50%, #1f2937 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      position: 'relative'
    },
    subtitle: {
      fontFamily: '"Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '14px' : '16px',
      color: '#666',
      margin: '15px 0',
      fontWeight: '600',
      fontStyle: 'italic',
      lineHeight: '1.4'
    },
    // Enhanced leaderboard container
    leaderboardContainer: {
      position: 'relative',
      zIndex: 2,
      marginBottom: '40px'
    },
    // Completely redesigned team cards
    leaderboardCard: (position, index) => ({
      background: `
        linear-gradient(145deg,
          rgba(255, 255, 255, 0.95) 0%,
          rgba(250, 250, 250, 0.9) 50%,
          rgba(245, 245, 245, 0.95) 100%
        )
      `,
      border: position <= 3 ? '5px solid transparent' : '4px solid #d1d5db',
      borderImage: position <= 3 ? `${getPositionGradient(position)} 1` : 'none',
      margin: window.innerWidth < 768 ? '20px 0' : '25px 0',
      padding: window.innerWidth < 768 ? '20px' : '30px',
      position: 'relative',
      boxShadow: position <= 3 ?
        `0 10px 30px rgba(0,0,0,0.15), 0 4px 15px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8)` :
        `0 8px 25px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.08)`,
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      opacity: 0
    }),
    // Enhanced position badge
    positionBadge: (position) => ({
      width: window.innerWidth < 768 ? '70px' : '90px',
      height: window.innerWidth < 768 ? '70px' : '90px',
      borderRadius: '50%',
      background: getPositionGradient(position),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      boxShadow: `0 8px 20px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)`,
      border: '3px solid rgba(255,255,255,0.8)',
      position: 'relative',
      flexShrink: 0
    }),
    positionIcon: (position) => ({
      fontSize: window.innerWidth < 768 ? '24px' : '32px',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    }),
    positionNumber: {
      fontSize: window.innerWidth < 768 ? '10px' : '12px',
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '700',
      marginTop: '2px',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
    },
    // Enhanced team info layout
    teamInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginLeft: window.innerWidth < 768 ? '15px' : '25px'
    },
    teamName: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: window.innerWidth < 768 ? '20px' : '28px',
      fontWeight: '700',
      color: '#1e40af',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '0.5px' : '1.5px',
      textShadow: '2px 2px 4px rgba(30, 64, 175, 0.2)',
      lineHeight: '1.2'
    },
    leaderName: {
      fontFamily: '"Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '15px' : '18px',
      color: '#4b5563',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    teamDetails: {
      fontFamily: '"Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '13px' : '15px',
      color: '#6b7280',
      lineHeight: '1.6'
    },
    // Enhanced points section
    pointsSection: {
      display: window.innerWidth < 768 ? 'none' : 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(30, 64, 175, 0.12) 100%)',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid rgba(59, 130, 246, 0.2)',
      minWidth: '140px',
      boxShadow: 'inset 0 2px 4px rgba(59, 130, 246, 0.1)'
    },
    pointsValue: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '24px',
      fontWeight: '800',
      color: '#1e40af',
      textShadow: '1px 1px 2px rgba(30, 64, 175, 0.3)'
    },
    pointsLabel: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '11px',
      color: '#6b7280',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '4px'
    },
    mobilePoints: {
      display: window.innerWidth < 768 ? 'block' : 'none',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e40af',
      marginTop: '8px'
    },
    // Enhanced loading design
    loadingContainer: {
      textAlign: 'center',
      margin: '80px 0',
      position: 'relative',
      zIndex: 2
    },
    loadingText: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '24px',
      color: '#1a1a1a',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      marginBottom: '40px',
      textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '5px solid #e5e7eb',
      borderTop: '5px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1.2s linear infinite',
      margin: '0 auto 30px',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
    },
    loadingBar: {
      width: '350px',
      height: '12px',
      background: '#e5e7eb',
      border: '3px solid #374151',
      borderRadius: '8px',
      margin: '0 auto 25px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2)'
    },
    loadingBarFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 30%, #60a5fa 70%, #1e40af 100%)',
      borderRadius: '6px',
      animation: 'loadingPulse 2.5s ease-in-out infinite',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
    },
    // Enhanced expanded section
    expandedSection: {
      marginTop: '25px',
      padding: '25px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
      borderRadius: '12px',
      border: '2px solid rgba(59, 130, 246, 0.1)',
      animation: 'slideDown 0.3s ease-out'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes loadingPulse {
            0% { width: 0%; }
            25% { width: 40%; }
            50% { width: 70%; }
            75% { width: 85%; }
            100% { width: 100%; }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }

          .team-card:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.1) !important;
          }

          .position-badge {
            animation: float 3s ease-in-out infinite;
          }

          /* Enhanced mobile scrollbar */
          @media (max-width: 768px) {
            .mobile-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .mobile-scroll::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
              border-radius: 4px;
            }
            .mobile-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
              border-radius: 4px;
            }
          }

          /* Trophy glow effect for top 3 */
          .trophy-glow {
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
            animation: float 2s ease-in-out infinite;
          }

          /* Shimmer effect for loading */
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          /* World-Class Popup Animations */
          @keyframes modalAppear {
            0% {
              opacity: 0;
              backdrop-filter: blur(0px);
              background: linear-gradient(135deg, rgba(15, 23, 42, 0) 0%, rgba(30, 41, 59, 0) 50%, rgba(15, 23, 42, 0) 100%);
            }
            100% {
              opacity: 1;
              backdrop-filter: blur(25px);
              background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%);
            }
          }

          @keyframes heroEntrance {
            0% {
              transform: scale(0.3) rotateY(-45deg) rotateX(15deg);
              opacity: 0;
              filter: blur(20px);
            }
            30% {
              transform: scale(0.8) rotateY(-10deg) rotateX(5deg);
              opacity: 0.6;
              filter: blur(5px);
            }
            60% {
              transform: scale(1.05) rotateY(5deg) rotateX(-2deg);
              opacity: 0.9;
              filter: blur(0px);
            }
            100% {
              transform: scale(1) rotateY(0deg) rotateX(0deg);
              opacity: 1;
              filter: blur(0px);
            }
          }

          @keyframes particleFloat {
            0%, 100% {
              transform: translateY(0px) scale(1) rotate(0deg);
              opacity: 0.6;
            }
            33% {
              transform: translateY(-20px) scale(1.1) rotate(120deg);
              opacity: 0.8;
            }
            66% {
              transform: translateY(-10px) scale(0.9) rotate(240deg);
              opacity: 0.7;
            }
          }

          @keyframes heroWaves {
            0%, 100% {
              transform: translateX(0%) translateY(0%) scale(1);
              opacity: 0.6;
            }
            25% {
              transform: translateX(5%) translateY(-2%) scale(1.02);
              opacity: 0.8;
            }
            50% {
              transform: translateX(-3%) translateY(3%) scale(0.98);
              opacity: 0.7;
            }
            75% {
              transform: translateX(2%) translateY(-1%) scale(1.01);
              opacity: 0.9;
            }
          }

          @keyframes floatShape1 {
            0%, 100% {
              transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-15px) translateX(10px) rotate(180deg) scale(1.2);
              opacity: 0.7;
            }
          }

          @keyframes floatShape2 {
            0%, 100% {
              transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
              opacity: 0.3;
            }
            50% {
              transform: translateY(20px) translateX(-15px) rotate(-180deg) scale(0.8);
              opacity: 0.6;
            }
          }

          @keyframes premiumBadge {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.2), inset 0 4px 0 rgba(255, 255, 255, 0.6);
            }
            50% {
              transform: scale(1.08) rotate(1deg);
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 15px 30px rgba(0, 0, 0, 0.3), inset 0 6px 0 rgba(255, 255, 255, 0.7);
            }
          }

          @keyframes badgeRotate {
            0% { transform: rotate(0deg); opacity: 0.6; }
            25% { opacity: 1; }
            50% { opacity: 0.8; }
            75% { opacity: 1; }
            100% { transform: rotate(360deg); opacity: 0.6; }
          }

          @keyframes badgeShine {
            0% {
              transform: rotate(45deg) translateX(-200%);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.8;
            }
            100% {
              transform: rotate(45deg) translateX(200%);
              opacity: 0;
            }
          }

          @keyframes tagShine {
            0% { left: -100%; opacity: 0; }
            50% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }

          /* World-Class Card Hover Effects */
          .chart-card {
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
          }

          .chart-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1;
            pointer-events: none;
          }

          .chart-card:hover::before {
            left: 100%;
          }

          .chart-card:hover {
            transform: translateY(-8px) scale(1.03) rotateX(2deg) !important;
            box-shadow:
              0 35px 60px rgba(0, 0, 0, 0.2),
              0 20px 30px rgba(0, 0, 0, 0.1),
              inset 0 2px 0 rgba(255, 255, 255, 0.8) !important;
            border: 2px solid rgba(255, 255, 255, 0.6) !important;
          }

          .chart-card:active {
            transform: translateY(-4px) scale(1.01) !important;
          }

          /* Advanced Chart Animations */
          @keyframes chartBarAppear {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes barFill {
            0% {
              width: 0%;
              opacity: 0.8;
            }
            70% {
              opacity: 1;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes barShine {
            0% {
              left: -50%;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }

          @keyframes pieSegmentAppear {
            0% {
              opacity: 0;
              transform: scale(0.8) rotate(-10deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }

          @keyframes legendItemAppear {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes miniBarFill {
            0% {
              width: 0%;
            }
            100% {
              width: var(--target-width);
            }
          }

          @keyframes strengthAppear {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes improvementAppear {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes insightWaves {
            0%, 100% {
              transform: translateX(0%) translateY(0%) scale(1) rotate(0deg);
              opacity: 0.6;
            }
            25% {
              transform: translateX(2%) translateY(-1%) scale(1.01) rotate(0.5deg);
              opacity: 0.8;
            }
            50% {
              transform: translateX(-1%) translateY(2%) scale(0.99) rotate(-0.5deg);
              opacity: 0.7;
            }
            75% {
              transform: translateX(1%) translateY(-0.5%) scale(1.005) rotate(0.3deg);
              opacity: 0.9;
            }
          }

          /* Custom Scrollbar for Popup Content */
          .popup-content::-webkit-scrollbar {
            width: 8px;
          }
          .popup-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          .popup-content::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
            border-radius: 10px;
          }
          .popup-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
          }
        `}
      </style>

      <div style={styles.pageContainer} className="mobile-scroll">
        <HomeButton />

        <div ref={containerRef} style={styles.container}>
          <div style={styles.paperTexture}></div>

          {/* Enhanced stains and wear marks */}
          <div style={styles.stains}></div>
          <div style={styles.stains2}></div>
          <div style={styles.stains3}></div>

          {/* Enhanced staples */}
          <div style={styles.stapleLeft}></div>
          <div style={styles.stapleRight}></div>

          {/* Enhanced header */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <div className="shimmer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '12px' }}></div>
              MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY
            </div>
            <h1 style={styles.title}>
              SAE CHAMPIONSHIP LEADERBOARD
            </h1>
            <div style={styles.subtitle}>
              SAE COLLEGIATE CLUB - AUTOMOTIVE ENGINEERING COMPETITION
              <br />
              <strong>Last Updated:</strong> {currentTime.toLocaleString()}
            </div>
          </div>

          {/* Modern Search and Filter Controls */}
          {!isLoading && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '3px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr auto auto',
                gap: '15px',
                alignItems: 'center'
              }}>
                {/* Search Input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search teams, leaders, or roll numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 20px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: '"Inter", sans-serif',
                      background: 'white',
                      transition: 'border-color 0.3s ease',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: '#6b7280'
                  }}>
                    🔍
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '12px 15px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: '"Inter", sans-serif',
                    background: 'white',
                    minWidth: '150px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="verified">✅ Verified</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="rejected">❌ Rejected</option>
                </select>

                {/* Results Count */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  minWidth: '120px',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                }}>
                  📊 {filteredData.length} Teams
                </div>
              </div>
            </div>
          )}

          {/* Enhanced content */}
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div style={styles.loadingText}>
                📊 LOADING CHAMPIONSHIP DATA
              </div>
              <div style={styles.loadingBar}>
                <div style={styles.loadingBarFill}></div>
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '20px', fontFamily: '"Inter", sans-serif' }}>
                Fetching team registrations from database...
              </div>
            </div>
          ) : (
            <div style={styles.leaderboardContainer}>
              {currentTeams.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  border: '2px solid #d1d5db',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                  <h3 style={{ color: '#374151', fontSize: '24px', marginBottom: '10px' }}>No Teams Found</h3>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search terms or filters'
                      : 'No teams are registered yet'
                    }
                  </p>
                </div>
              ) : (
                currentTeams.map((team, index) => (
                  <div
                    key={`${team.id}-page-${currentPage}`}
                    ref={el => {
                      if (el) cardsRef.current[index] = el;
                    }}
                    className="team-card"
                    style={{
                      ...styles.leaderboardCard(team.position, index),
                      display: 'flex',
                      alignItems: 'center',
                      animationDelay: `${index * 0.1}s`
                    }}
                    onClick={() => openTeamAnalysis(team)}
                  >
                  {/* Enhanced position badge */}
                  <div className={`position-badge ${team.position <= 3 ? 'trophy-glow' : ''}`} style={styles.positionBadge(team.position)}>
                    <div style={styles.positionIcon(team.position)}>
                      {getPositionIcon(team.position)}
                    </div>
                    {team.position > 3 && (
                      <div style={styles.positionNumber}>
                        #{team.position}
                      </div>
                    )}
                  </div>

                  {/* Enhanced team info */}
                  <div style={styles.teamInfo}>
                    <div style={styles.teamName}>
                      🏁 {team.teamName}
                    </div>
                    <div style={styles.leaderName}>
                      <span>👤</span>
                      <span>Leader: <strong>{team.leaderName}</strong></span>
                    </div>
                    <div style={styles.teamDetails}>
                      📋 <strong>Roll No:</strong> {team.leaderRoll}
                      <br />
                      🎓 <strong>Branch:</strong> {team.leaderBranch}
                      <br />
                      📞 <strong>Phone:</strong> {team.leaderPhone || 'Not provided'}
                      <br />
                      📅 <strong>Registered:</strong> {new Date(team.createdAt).toLocaleDateString()}
                      <br />
                      ✅ <strong>Status:</strong> <span style={{
                        color: team.registrationStatus === 'verified' ? '#22c55e' :
                              team.registrationStatus === 'pending' ? '#f59e0b' : '#ef4444',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {team.registrationStatus}
                      </span>
                    </div>
                    <div style={styles.mobilePoints}>
                      📊 {team.points.toLocaleString()} pts
                    </div>
                  </div>

                  {/* Enhanced points section */}
                  <div style={styles.pointsSection}>
                    <div style={styles.pointsValue}>
                      {team.points.toLocaleString()}
                    </div>
                    <div style={styles.pointsLabel}>
                      POINTS
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div style={{
                    marginLeft: '15px',
                    fontSize: '20px',
                    color: '#6b7280',
                    transform: expandedTeam === team.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </div>

                  {/* Enhanced expanded section */}
                  {expandedTeam === team.id && (
                    <div style={{
                      ...styles.expandedSection,
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      right: '0',
                      zIndex: 10,
                      background: 'rgba(248, 250, 252, 0.98)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <h4 style={{
                        margin: '0 0 20px 0',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e40af',
                        textAlign: 'center'
                      }}>
                        📋 DETAILED TEAM STATISTICS
                      </h4>

                      <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                          <div style={styles.statValue}>{team.totalRaces}</div>
                          <div style={styles.statLabel}>Total Races</div>
                        </div>
                        <div style={styles.statCard}>
                          <div style={styles.statValue}>{team.winPercentage}%</div>
                          <div style={styles.statLabel}>Win Rate</div>
                        </div>
                        <div style={styles.statCard}>
                          <div style={styles.statValue}>{team.avgPoints}</div>
                          <div style={styles.statLabel}>Avg Points</div>
                        </div>
                        <div style={styles.statCard}>
                          <div style={styles.statValue}>{team.lapTime}</div>
                          <div style={styles.statLabel}>Best Lap</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: '#1e40af' }}>📋 Registration Details:</strong>
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                          <div><strong>Registration ID:</strong> #{team.id}</div>
                          <div><strong>Payment Verified:</strong> {team.paymentVerified ? '✅ Yes' : '❌ No'}</div>
                          <div><strong>Registration Date:</strong> {new Date(team.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: '#1e40af' }}>👥 Team Members ({team.members.length}):</strong>
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {team.members.map((member, idx) => (
                            <span key={idx} style={{
                              background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                              color: idx === 0 ? 'white' : '#374151',
                              padding: '6px 14px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: idx === 0 ? '700' : '500',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              border: idx === 0 ? '2px solid #fbbf24' : '1px solid #d1d5db'
                            }}>
                              {idx === 0 && '👑 LEADER: '}{member}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: '#1e40af' }}>🏆 Competition Performance:</strong>
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                          <div><strong>Best Finish:</strong> {team.bestFinish}</div>
                          <div><strong>Events Participated:</strong> {team.events.join(', ')}</div>
                          <div><strong>Achievement:</strong> {team.achievements}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                ))
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '40px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center'
                  }}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            background: currentPage === pageNum
                              ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                              : 'rgba(255, 255, 255, 0.9)',
                            color: currentPage === pageNum ? 'white' : '#374151',
                            border: '2px solid #d1d5db',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: '600',
                            fontSize: '14px',
                            minWidth: '45px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      background: currentPage === totalPages ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div style={{
                textAlign: 'center',
                marginTop: '20px',
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} teams
                {searchTerm && ` (filtered from ${leaderboardData.length} total)`}
              </div>
            </div>
          )}

          {/* Enhanced footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '25px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '15px',
              color: '#6b7280',
              fontWeight: '600',
              lineHeight: '1.6'
            }}>
              📊 <strong>RANKINGS UPDATED:</strong> {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} | 🕒 {currentTime.toLocaleTimeString()}
              <br />
              🏛️ <strong>MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY</strong>
              <br />
              🔧 <strong>SAE COLLEGIATE CLUB OFFICIAL CHAMPIONSHIP LEADERBOARD</strong>
              <br />
              <span style={{ fontSize: '13px', color: '#9ca3af', marginTop: '10px', display: 'block' }}>
                Click on any team card to view detailed statistics and member information
              </span>
            </div>
          </div>
        </div>

        {/* Team Analysis Popup */}
        {showAnalysisPopup && selectedTeamForAnalysis && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              width: '90vw',
              maxWidth: '1200px',
              height: '85vh',
              maxHeight: '800px',
              overflow: 'hidden',
              position: 'relative',
              border: '2px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                color: 'white',
                padding: '30px',
                position: 'relative',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}>
                <button
                  onClick={closeTeamAnalysis}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Position Badge */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: getPositionGradient(selectedTeamForAnalysis.position),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    border: '3px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    {getPositionIcon(selectedTeamForAnalysis.position)}
                  </div>

                  {/* Team Info */}
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      margin: '0 0 8px 0',
                      fontFamily: '"Poppins", sans-serif'
                    }}>
                      {selectedTeamForAnalysis.teamName}
                    </h2>
                    <div style={{
                      fontSize: '16px',
                      opacity: 0.9,
                      fontFamily: '"Inter", sans-serif'
                    }}>
                      Position #{selectedTeamForAnalysis.position} • {selectedTeamForAnalysis.points.toLocaleString()} Points
                    </div>
                    <div style={{
                      fontSize: '14px',
                      opacity: 0.8,
                      marginTop: '4px'
                    }}>
                      Leader: {selectedTeamForAnalysis.leaderName} • Rating: {selectedTeamForAnalysis.overallRating}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="popup-content" style={{
                padding: '40px',
                maxHeight: '75vh',
                overflowY: 'auto',
                background: `
                  linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%),
                  radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.03) 0%, transparent 50%)
                `,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(2, 1fr)',
                  gap: '35px'
                }}>
                  {/* Performance Breakdown Card */}
                  <div className="chart-card" style={{
                    background: `
                      linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%),
                      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: `
                      0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px'
                    }} />
                    <BarChart
                      data={selectedTeamForAnalysis?.performanceBreakdown}
                      title="📊 Performance Breakdown"
                      color="#3b82f6"
                    />
                  </div>

                  {/* Skills Analysis Card */}
                  <div className="chart-card" style={{
                    background: `
                      linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%),
                      radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: `
                      0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px'
                    }} />
                    <PieChart
                      data={selectedTeamForAnalysis?.skillsBreakdown}
                      title="🎯 Skills Distribution"
                    />
                  </div>

                  {/* Monthly Progress Card */}
                  <div className="chart-card" style={{
                    gridColumn: window.innerWidth < 1024 ? '1' : 'span 2',
                    background: `
                      linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%),
                      radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: `
                      0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px'
                    }} />
                    <LineChart
                      data={selectedTeamForAnalysis?.monthlyProgress}
                      title="📈 Monthly Progress Trend"
                    />
                  </div>

                  {/* Event Performance Card */}
                  <div className="chart-card" style={{
                    background: `
                      linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%),
                      radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: `
                      0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px'
                    }} />

                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      marginBottom: '25px',
                      color: '#1f2937',
                      fontFamily: '"Poppins", sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      🏁 Event Performance
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedTeamForAnalysis.eventPerformance?.map((event, index) => (
                        <div key={index} style={{
                          background: `
                            linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)
                          `,
                          backdropFilter: 'blur(10px)',
                          padding: '20px',
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                          }}>
                            <span style={{
                              fontWeight: '700',
                              color: '#1f2937',
                              fontSize: '16px',
                              fontFamily: '"Inter", sans-serif'
                            }}>
                              {event.event}
                            </span>
                            <span style={{
                              background: event.position <= 3 ?
                                'linear-gradient(135deg, #10b981 0%, #22c55e 100%)' :
                                event.position <= 10 ?
                                'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' :
                                'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                              #{event.position}
                            </span>
                          </div>

                          <div style={{
                            width: '100%',
                            height: '12px',
                            background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            <div style={{
                              width: `${event.score}%`,
                              height: '100%',
                              background: `linear-gradient(90deg,
                                ${event.score >= 80 ? '#10b981' : event.score >= 60 ? '#f59e0b' : '#ef4444'} 0%,
                                ${event.score >= 80 ? '#22c55e' : event.score >= 60 ? '#fbbf24' : '#f87171'} 100%
                              )`,
                              borderRadius: '8px',
                              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: `0 0 10px ${event.score >= 80 ? 'rgba(16, 185, 129, 0.4)' : event.score >= 60 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                            }} />
                          </div>

                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            marginTop: '8px',
                            fontWeight: '600'
                          }}>
                            Score: <span style={{color: '#1f2937', fontWeight: '700'}}>{event.score}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Essential Charts Section */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Team Performance Chart */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <BarChart
                        data={teamStats.chartData}
                        title="Team Performance Breakdown"
                      />
                    </div>

                    {/* Skills Distribution */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <PieChart
                        data={teamStats.skillsData}
                        title="Skills Distribution"
                      />
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '20px'
                  }}>
                    <LineChart
                      data={teamStats.monthlyProgress}
                      title="Monthly Progress"
                    />
                  </div>

                  {/* Basic Team Metrics */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '15px'
                    }}>
                      Team Metrics
                    </h4>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                      gap: '15px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#059669'
                        }}>
                          {selectedTeamForAnalysis?.totalPoints || 0}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Total Points
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#2563eb'
                        }}>
                          #{selectedTeamForAnalysis?.position || 'N/A'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Current Rank
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#7c3aed'
                        }}>
                          {selectedTeamForAnalysis?.lapTime || 'N/A'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Best Lap Time
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#dc2626'
                        }}>
                          {selectedTeamForAnalysis?.avgPoints || 0}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Average Points
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
