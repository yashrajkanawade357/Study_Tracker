import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { ACHIEVEMENT_DEFS } from '../utils/storage';
import { formatFull } from '../utils/dateUtils';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Alex Chen', level: 12, xp: 1187, streak: 45, avatar: '🎯', bio: 'Coding my way through college!', linkedin: 'https://linkedin.com', instagram: 'alex' },
  { rank: 2, name: 'Priya Sharma', level: 10, xp: 998, streak: 32, avatar: '⭐', bio: 'Aspiring doctor 🩺', linkedin: '', instagram: 'priya' },
  { rank: 3, name: 'James Wilson', level: 9, xp: 876, streak: 28, avatar: '🚀', bio: 'Stay hard!', linkedin: '', instagram: '' },
  { rank: 4, name: 'Sofia García', level: 8, xp: 754, streak: 21, avatar: '🌟', bio: '', linkedin: '', instagram: '' },
  { rank: 5, name: 'Kai Tanaka', level: 7, xp: 623, streak: 15, avatar: '⚡', bio: '', linkedin: '', instagram: '' },
];

const PublicProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  const isImage = user.avatar?.startsWith('http') || user.avatar?.startsWith('data:');
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-24 bg-gradient-to-r from-purple-600 to-cyan-600 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
             ✕
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-navy-800 border-4 border-navy-900 flex items-center justify-center text-4xl overflow-hidden -mt-10 mx-auto shadow-xl z-10 relative">
             {isImage ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user.avatar || '🎓')}
          </div>
          
          <div className="text-center mt-3">
            <h3 className="font-display font-bold text-xl text-white">{user.name}</h3>
            <div className="flex items-center justify-center gap-3 mt-1 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <span>Level {user.level}</span>
              <span>•</span>
              <span className="text-orange-400">{user.streak} Day Streak</span>
            </div>
          </div>
          
          {user.bio && (
            <div className="mt-5 p-4 rounded-xl bg-navy-800/50 text-sm text-gray-300 italic text-center border border-gray-700/30">
              "{user.bio}"
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-700/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400 font-display">{user.xp.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              {user.linkedin && (
                <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 hover:bg-purple-600/30">
                  🔗 LinkedIn
                </a>
              )}
              {user.instagram && (
                <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 hover:bg-purple-600/30">
                  📷 Instagram
                </a>
              )}
              {!user.linkedin && !user.instagram && (
                <p className="text-xs text-gray-500 text-center italic mt-2">No social links</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BadgeCard = ({ def, achievement, index }) => {
  const unlocked = achievement?.unlocked;
  const progress = getProgress(def.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`badge ${unlocked ? 'unlocked' : 'locked'} group relative`}
    >
      <div className={`text-4xl mb-2 ${!unlocked && 'grayscale'} transition-transform group-hover:scale-110 duration-200`}>
        {def.icon}
      </div>
      <p className={`text-sm font-display font-bold ${unlocked ? 'text-white' : 'text-gray-600'}`}>
        {def.name}
      </p>
      <p className={`text-xs ${unlocked ? 'text-gray-400' : 'text-gray-600'} leading-tight`}>
        {def.description}
      </p>
      {unlocked ? (
        <>
          <div className="mt-2 text-xs text-purple-400 font-semibold">+{def.xp} XP</div>
          {achievement.unlockedAt && (
            <div className="text-xs text-gray-600 mt-0.5">{formatFull(achievement.unlockedAt)}</div>
          )}
        </>
      ) : (
        <div className="mt-2 text-xs text-gray-600">Locked</div>
      )}
      {unlocked && (
        <div className="absolute -top-1 -right-1">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs">
            ✓
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Dummy progress function (would be replaced with real calculation)
const getProgress = (id) => {
  return null;
};

const Achievements = () => {
  const { achievements, userProfile, studyLogs, subjects, checkAchievements } = useApp();
  
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const xpInLevel = xp % 100;
  const totalAchievements = achievements.filter(a => a.unlocked).length;
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const fetchLeaderboard = async () => {
        try {
          // Do NOT select email — it's sensitive and causes 400 with public policies
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, level, xp, streak, avatar, bio, linkedin, instagram')
            .order('xp', { ascending: false })
            .limit(10);
            
          if (error) throw error;
          
          if (data) {
            const mapped = data.map((p, index) => ({
              rank: index + 1,
              name: p.name || 'Anonymous',
              level: p.level || 1,
              xp: p.xp || 0,
              streak: p.streak || 0,
              avatar: p.avatar || '🎓',
              bio: p.bio || '',
              linkedin: p.linkedin || '',
              instagram: p.instagram || '',
              isCurrentUser: p.id === userProfile?.id,
            }));
            setLeaderboard(mapped);
            setLeaderboardError(false);
          }
        } catch (err) {
          console.error('Error fetching leaderboard:', err);
          setLeaderboardError(true);
          // Fallback to local mock data
          const userRank = MOCK_LEADERBOARD.filter(u => u.xp > xp).length + 1;
          const localLeaderboard = [
            ...MOCK_LEADERBOARD.filter((_, i) => i < Math.min(userRank - 1, 5)),
            {
              rank: userRank,
              name: userProfile?.name || 'You',
              level,
              xp,
              streak: userProfile?.streak || 0,
              avatar: userProfile?.avatar || '🎓',
              bio: userProfile?.bio || '',
              linkedin: userProfile?.linkedin || '',
              instagram: userProfile?.instagram || '',
              isCurrentUser: true,
            },
            ...MOCK_LEADERBOARD.slice(Math.min(userRank - 1, 5)),
          ].slice(0, 6);
          setLeaderboard(localLeaderboard);
        }
      };
      
      fetchLeaderboard();
    } else {
      const userRank = MOCK_LEADERBOARD.filter(u => u.xp > xp).length + 1;
      const localLeaderboard = [
        ...MOCK_LEADERBOARD.filter((_, i) => i < Math.min(userRank - 1, 5)),
        {
          rank: userRank,
          name: userProfile?.name || 'You',
          level,
          xp,
          streak: userProfile?.streak || 0,
          avatar: userProfile?.avatar || '🎓',
          bio: userProfile?.bio || '',
          linkedin: userProfile?.linkedin || '',
          instagram: userProfile?.instagram || '',
          isCurrentUser: true,
        },
        ...MOCK_LEADERBOARD.slice(Math.min(userRank - 1, 5)),
      ].slice(0, 6);
      setLeaderboard(localLeaderboard);
    }
  }, [xp, level, userProfile]);

  useEffect(() => {
    if (studyLogs.length > 0) {
      checkAchievements(studyLogs, subjects);
    }
  }, [studyLogs.length, checkAchievements]);

  const totalHours = studyLogs.reduce((s, l) => s + l.hours, 0);

  return (
    <Layout title="Achievements">
      {/* XP Bar Section */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-2xl gradient-text">Level {level}</h3>
            <p className="text-gray-400 text-sm">{xp.toLocaleString()} total XP earned</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-display text-purple-400">{totalAchievements}/{ACHIEVEMENT_DEFS.length}</p>
            <p className="text-xs text-gray-500">Badges Unlocked</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress to Level {level + 1}</span>
            <span className="text-purple-400 font-semibold">{xpInLevel}/100 XP</span>
          </div>
          <div className="progress-bar h-4">
            <motion.div
              className="progress-fill bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Total Hours', value: totalHours.toFixed(1) + 'h', icon: '⏱️' },
            { label: 'Current Streak', value: (userProfile?.streak || 0) + ' days', icon: '🔥' },
            { label: 'Sessions', value: studyLogs.length, icon: '📚' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-navy-800/50">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-lg font-display font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Badges */}
      <GlassCard className="p-6 mb-6">
        <h3 className="font-display font-bold text-white mb-6">🏅 Achievement Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const achievement = achievements.find(a => a.id === def.id);
            return <BadgeCard key={def.id} def={def} achievement={achievement} index={i} />;
          })}
        </div>
      </GlassCard>

      {/* Leaderboard */}
      <GlassCard className="p-6">
        <h3 className="font-display font-bold text-white mb-6">🏆 Global Leaderboard</h3>
        <div className="flex flex-col gap-2">
          {leaderboard.map((user, i) => {
            const rankEmoji = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`;
            const isImage = user.avatar?.startsWith('http') || user.avatar?.startsWith('data:');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  user.isCurrentUser
                    ? 'bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30'
                    : 'bg-navy-800/30 hover:bg-navy-700/50'
                }`}
              >
                <div className="w-8 text-center text-lg font-bold">{rankEmoji}</div>
                <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                  {isImage ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${user.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                    {user.name} {user.isCurrentUser && '(You)'}
                  </p>
                  <p className="text-xs text-gray-500">Level {user.level} · {user.streak} day streak 🔥</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-purple-400">{user.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 text-center mt-4">
          {leaderboardError
            ? '⚠️ Could not load live leaderboard — showing demo data.'
            : '* Rankings update in real-time based on total XP earned.'}
        </p>
      </GlassCard>

      {/* Profile Modal */}
      {selectedUser && (
        <PublicProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </Layout>
  );
};

export default Achievements;
