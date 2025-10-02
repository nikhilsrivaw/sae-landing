import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../lib/supabase';

const PointsManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentStage, setCurrentStage] = useState('');

  // Stage scoring states
  const [stageScores, setStageScores] = useState({
    technical_inspection: 0,
    innovation_bonus: 0,
    manoeuvrability: 0,
    durability: 0,
    pre_final_race: 0,
    final_race: 0,
    mixed_team_bonus: 0
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const registrations = await supabaseService.getTeamRegistrations();
      setTeams(registrations);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (team) => {
    const scores = team.scores || {};
    return (
      (scores.technical_inspection || 0) +
      (scores.innovation_bonus || 0) +
      (scores.manoeuvrability || 0) +
      (scores.durability || 0) +
      (scores.pre_final_race || 0) +
      (scores.final_race || 0) +
      (scores.mixed_team_bonus || 0)
    );
  };

  const openScoreModal = (team, stage) => {
    setSelectedTeam(team);
    setCurrentStage(stage);
    setStageScores(team.scores || {
      technical_inspection: 0,
      innovation_bonus: 0,
      manoeuvrability: 0,
      durability: 0,
      pre_final_race: 0,
      final_race: 0,
      mixed_team_bonus: 0
    });
    setShowScoreModal(true);
  };

  const saveScore = async () => {
    if (!selectedTeam) {
      alert('No team selected');
      return;
    }

    // Validate scores before saving
    const validationErrors = [];

    if (stageScores.technical_inspection < 0 || stageScores.technical_inspection > 25) {
      validationErrors.push('Technical Inspection must be between 0-25');
    }
    if (stageScores.innovation_bonus < 0 || stageScores.innovation_bonus > 15) {
      validationErrors.push('Innovation Bonus must be between 0-15');
    }
    if (stageScores.manoeuvrability < 0 || stageScores.manoeuvrability > 50) {
      validationErrors.push('Manoeuvrability must be between 0-50');
    }
    if (stageScores.durability < 0 || stageScores.durability > 50) {
      validationErrors.push('Durability must be between 0-50');
    }
    if (stageScores.pre_final_race < 0 || stageScores.pre_final_race > 100) {
      validationErrors.push('Pre-Final Race must be between 0-100');
    }
    if (stageScores.final_race < 0 || stageScores.final_race > 75) {
      validationErrors.push('Final Race must be between 0-75');
    }
    if (stageScores.mixed_team_bonus < 0 || stageScores.mixed_team_bonus > 10) {
      validationErrors.push('Mixed Team Bonus must be 0 or 10');
    }

    if (validationErrors.length > 0) {
      alert('Validation Errors:\n' + validationErrors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      console.log('=== SAVING SCORES ===');
      console.log('Team:', selectedTeam.team_name);
      console.log('Team ID:', selectedTeam.id);
      console.log('Scores to save:', {
        technical_inspection: stageScores.technical_inspection,
        innovation_bonus: stageScores.innovation_bonus,
        manoeuvrability: stageScores.manoeuvrability,
        durability: stageScores.durability,
        pre_final_race: stageScores.pre_final_race,
        final_race: stageScores.final_race,
        mixed_team_bonus: stageScores.mixed_team_bonus,
        calculated_total: Object.values(stageScores).reduce((a, b) => a + b, 0)
      });

      // Update scores in database
      const result = await supabaseService.updateTeamScores(selectedTeam.id, stageScores);

      console.log('=== SAVE SUCCESSFUL ===');
      console.log('Returned data:', result);
      console.log('Saved scores from DB:', result.scores);
      console.log('Total score from DB:', result.total_score);

      // Verify each field was saved
      const verificationErrors = [];
      if (result.scores.technical_inspection !== stageScores.technical_inspection) {
        verificationErrors.push('Technical Inspection mismatch');
      }
      if (result.scores.innovation_bonus !== stageScores.innovation_bonus) {
        verificationErrors.push('Innovation Bonus mismatch');
      }
      if (result.scores.manoeuvrability !== stageScores.manoeuvrability) {
        verificationErrors.push('Manoeuvrability mismatch');
      }
      if (result.scores.durability !== stageScores.durability) {
        verificationErrors.push('Durability mismatch');
      }
      if (result.scores.pre_final_race !== stageScores.pre_final_race) {
        verificationErrors.push('Pre-Final Race mismatch');
      }
      if (result.scores.final_race !== stageScores.final_race) {
        verificationErrors.push('Final Race mismatch');
      }
      if (result.scores.mixed_team_bonus !== stageScores.mixed_team_bonus) {
        verificationErrors.push('Mixed Team Bonus mismatch');
      }

      if (verificationErrors.length > 0) {
        console.warn('⚠️ VERIFICATION WARNINGS:', verificationErrors);
      } else {
        console.log('✅ All fields verified successfully!');
      }

      // Reload teams to reflect changes
      await loadTeams();

      // Show success message
      const totalScore = Object.values(stageScores).reduce((a, b) => a + b, 0);
      alert(`✅ Scores saved successfully for ${selectedTeam.team_name}!\n\nBreakdown:\n- Technical: ${stageScores.technical_inspection} + ${stageScores.innovation_bonus} = ${stageScores.technical_inspection + stageScores.innovation_bonus}\n- Manoeuvrability: ${stageScores.manoeuvrability}\n- Durability: ${stageScores.durability}\n- Pre-Final: ${stageScores.pre_final_race}\n- Final: ${stageScores.final_race}\n- Bonus: ${stageScores.mixed_team_bonus}\n\nTotal Score: ${totalScore} points`);

      setShowScoreModal(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('❌ ERROR SAVING SCORES:', error);
      alert(`Failed to save scores: ${error.message}\n\nPlease try again or contact support.`);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '1rem'
    },
    wrapper: {
      maxWidth: '1600px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '1.5rem',
      padding: '1rem',
      background: '#2d2d2d',
      borderRadius: '1rem',
      border: '1px solid #404040'
    },
    backBtn: {
      background: 'transparent',
      border: '1px solid #555',
      color: '#aaa',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    title: {
      fontSize: 'clamp(1.25rem, 4vw, 2rem)',
      fontWeight: 'bold',
      color: '#f0f0f0',
      margin: 0,
      wordBreak: 'break-word'
    },
    subtitle: {
      color: '#aaa',
      marginTop: '0.5rem',
      fontSize: 'clamp(0.75rem, 2vw, 1rem)'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #404040',
      paddingBottom: '0.5rem',
      overflowX: 'auto'
    },
    tab: {
      background: 'transparent',
      border: 'none',
      color: '#aaa',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      borderRadius: '0.5rem',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    activeTab: {
      background: '#404040',
      color: '#f0f0f0'
    },
    card: {
      background: '#2d2d2d',
      borderRadius: '1rem',
      padding: 'clamp(1rem, 3vw, 1.5rem)',
      border: '1px solid #404040',
      marginBottom: '1rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      display: 'block',
      overflowX: 'auto'
    },
    th: {
      padding: 'clamp(0.5rem, 2vw, 1rem)',
      textAlign: 'left',
      color: '#f0f0f0',
      borderBottom: '2px solid #404040',
      fontWeight: 'bold',
      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: 'clamp(0.5rem, 2vw, 1rem)',
      color: '#ccc',
      borderBottom: '1px solid #333',
      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
      whiteSpace: 'nowrap'
    },
    btn: {
      background: '#4a9eff',
      border: 'none',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      background: '#2d2d2d',
      borderRadius: '1rem',
      padding: 'clamp(1rem, 3vw, 2rem)',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid #404040'
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      color: '#f0f0f0',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '0.5rem',
      color: '#f0f0f0',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      boxSizing: 'border-box'
    },
    btnGroup: {
      display: 'flex',
      flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    saveBtn: {
      flex: 1,
      background: '#4ade80',
      border: 'none',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: 'bold'
    },
    cancelBtn: {
      flex: 1,
      background: '#ef4444',
      border: 'none',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: 'bold'
    }
  };

  const renderOverview = () => (
    <div>
      <div style={styles.card}>
        <h2 style={{ color: '#f0f0f0', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>Competition Scoring Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>🔧 Technical Inspection</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Max: 40 points (25 + 15 bonus)</p>
          </div>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>🎯 Manoeuvrability</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Max: 50 points</p>
          </div>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#f97316', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>🏁 Durability</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Max: 50 points</p>
          </div>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#8b5cf6', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>🏆 Pre-Final Race</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Max: 100 points</p>
          </div>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#ec4899', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>👑 Final Race</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Max: 75 points</p>
          </div>
          <div style={{ ...styles.card, background: '#1a1a1a' }}>
            <h3 style={{ color: '#06b6d4', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>⭐ Mixed Team Bonus</h3>
            <p style={{ color: '#aaa', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>+10 points</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem' }}>
          <h3 style={{ color: '#f0f0f0', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Maximum Total Score: 325 Points</h3>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => {
    const sortedTeams = [...teams].sort((a, b) => calculateTotalScore(b) - calculateTotalScore(a));

    return (
      <div style={styles.card}>
        <h2 style={{ color: '#f0f0f0', marginBottom: '1.5rem' }}>🏆 Leaderboard</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Team Name</th>
              <th style={styles.th}>Leader</th>
              <th style={styles.th}>Technical</th>
              <th style={styles.th}>Manoeuvrability</th>
              <th style={styles.th}>Durability</th>
              <th style={styles.th}>Pre-Final</th>
              <th style={styles.th}>Final</th>
              <th style={styles.th}>Bonus</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const scores = team.scores || {};
              const total = calculateTotalScore(team);
              return (
                <tr key={team.id}>
                  <td style={styles.td}>#{index + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#f0f0f0' }}>{team.team_name}</td>
                  <td style={styles.td}>{team.leader_name}</td>
                  <td style={styles.td}>{(scores.technical_inspection || 0) + (scores.innovation_bonus || 0)}</td>
                  <td style={styles.td}>{scores.manoeuvrability || 0}</td>
                  <td style={styles.td}>{scores.durability || 0}</td>
                  <td style={styles.td}>{scores.pre_final_race || 0}</td>
                  <td style={styles.td}>{scores.final_race || 0}</td>
                  <td style={styles.td}>{scores.mixed_team_bonus || 0}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#4ade80', fontSize: '1.1rem' }}>{total}</td>
                  <td style={styles.td}>
                    <button style={styles.btn} onClick={() => openScoreModal(team, 'all')}>
                      Edit Scores
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderScoreModal = () => {
    if (!showScoreModal || !selectedTeam) return null;

    return (
      <div style={styles.modal} onClick={() => setShowScoreModal(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ color: '#f0f0f0', marginBottom: '1.5rem', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', wordBreak: 'break-word' }}>
            Edit Scores - {selectedTeam.team_name}
          </h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>🔧 Technical Inspection (0-25)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.technical_inspection}
              onChange={(e) => setStageScores({...stageScores, technical_inspection: parseInt(e.target.value) || 0})}
              min="0"
              max="25"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              25 pts (1st attempt) | 20 pts (2nd attempt)
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>💡 Innovation Bonus (0-15)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.innovation_bonus}
              onChange={(e) => setStageScores({...stageScores, innovation_bonus: parseInt(e.target.value) || 0})}
              min="0"
              max="15"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>🎯 Manoeuvrability Test (0-50)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.manoeuvrability}
              onChange={(e) => setStageScores({...stageScores, manoeuvrability: parseInt(e.target.value) || 0})}
              min="0"
              max="50"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              50 pts (1st attempt) | 40 pts (2nd attempt) | Penalties: -2 pts (leave track/stop)
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>🏁 Durability Test (0-50)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.durability}
              onChange={(e) => setStageScores({...stageScores, durability: parseInt(e.target.value) || 0})}
              min="0"
              max="50"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              50 pts (1st attempt) | 35 pts (2nd attempt)
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>🏆 Pre-Final Race (0-100)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.pre_final_race}
              onChange={(e) => setStageScores({...stageScores, pre_final_race: parseInt(e.target.value) || 0})}
              min="0"
              max="100"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              1st: 100 | 2nd: 75 | 3rd: 55 | 4th: 35 | Penalties: -2 pts (leave track/stop)
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>👑 Final Race (0-75)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.final_race}
              onChange={(e) => setStageScores({...stageScores, final_race: parseInt(e.target.value) || 0})}
              min="0"
              max="75"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              1st: 75 | 2nd: 60 | 3rd: 45 | 4th: 30 | 5th: 20
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>⭐ Mixed Team Bonus (0 or 10)</label>
            <input
              type="number"
              style={styles.input}
              value={stageScores.mixed_team_bonus}
              onChange={(e) => setStageScores({...stageScores, mixed_team_bonus: parseInt(e.target.value) || 0})}
              min="0"
              max="10"
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
              +10 points for mixed teams (min 2 boys & 2 girls)
            </small>
          </div>

          <div style={{ padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ color: '#4ade80', margin: 0, fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
              Total Score: {Object.values(stageScores).reduce((a, b) => a + b, 0)} / 325
            </h3>
          </div>

          <div style={styles.btnGroup}>
            <button style={styles.saveBtn} onClick={saveScore} disabled={loading}>
              {loading ? 'Saving...' : 'Save Scores'}
            </button>
            <button style={styles.cancelBtn} onClick={() => setShowScoreModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <button onClick={() => navigate('/admin')} style={styles.backBtn}>
              ← Back to Admin
            </button>
            <h1 style={styles.title}>🎯 Points Scheme Management</h1>
            <p style={styles.subtitle}>
              Manage team points and competition scoring (Max: 325 points)
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'leaderboard' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Content */}
        {loading && activeTab === 'leaderboard' ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#aaa' }}>Loading teams...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
          </>
        )}

        {/* Score Modal */}
        {renderScoreModal()}
      </div>
    </div>
  );
};

export default PointsManagement;
