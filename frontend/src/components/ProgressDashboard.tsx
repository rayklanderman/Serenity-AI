import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Flame, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Target,
  Award,
  Star
} from 'lucide-react';
import { usePlannerStorage } from '../hooks/usePlannerStorage';

interface Activity {
  id: string;
  time: string;
  activity: string;
  icon: string;
  duration: string;
  completed?: boolean;
}

interface DayPlan {
  day: string;
  activities: Activity[];
  affirmation: string;
}

interface WeeklyStats {
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  bestDay: string;
  bestDayRate: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProgressDashboard: React.FC = () => {
  const { getCurrentPlan } = usePlannerStorage();
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const savedPlan = await getCurrentPlan();
      if (savedPlan?.plan_data) {
        setPlan(savedPlan.plan_data as DayPlan[]);
      }
      // Load streak from localStorage (simple approach)
      const savedStreak = localStorage.getItem('serenity_streak');
      if (savedStreak) {
        const streakData = JSON.parse(savedStreak);
        setStreak(streakData.count || 0);
      }
      setLoading(false);
    };
    loadData();
  }, [getCurrentPlan]);

  // Calculate weekly stats
  const weeklyStats: WeeklyStats = useMemo(() => {
    if (!plan) {
      return { totalActivities: 0, completedActivities: 0, completionRate: 0, bestDay: '', bestDayRate: 0 };
    }

    let total = 0;
    let completed = 0;
    let bestDay = '';
    let bestDayRate = 0;

    plan.forEach(day => {
      const dayTotal = day.activities.length;
      const dayCompleted = day.activities.filter(a => a.completed).length;
      total += dayTotal;
      completed += dayCompleted;

      const dayRate = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0;
      if (dayRate > bestDayRate && dayCompleted > 0) {
        bestDayRate = dayRate;
        bestDay = day.day;
      }
    });

    return {
      totalActivities: total,
      completedActivities: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      bestDay,
      bestDayRate: Math.round(bestDayRate)
    };
  }, [plan]);

  // Calculate daily completion for chart
  const dailyData = useMemo(() => {
    if (!plan) return DAYS.map(day => ({ day: day.slice(0, 3), completed: 0, total: 0, rate: 0 }));

    return plan.map(day => {
      const total = day.activities.length;
      const completed = day.activities.filter(a => a.completed).length;
      return {
        day: day.day.slice(0, 3),
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  }, [plan]);

  // Generate achievements based on progress
  const achievements: Achievement[] = useMemo(() => {
    const rate = weeklyStats.completionRate;
    const completed = weeklyStats.completedActivities;

    return [
      {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first activity',
        icon: <Star size={20} />,
        unlocked: completed >= 1
      },
      {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Complete 5 activities',
        icon: <CheckCircle2 size={20} />,
        unlocked: completed >= 5
      },
      {
        id: 'consistent',
        name: 'Consistent',
        description: 'Complete 10 activities',
        icon: <Target size={20} />,
        unlocked: completed >= 10
      },
      {
        id: 'half-way',
        name: 'Halfway There',
        description: 'Reach 50% weekly completion',
        icon: <TrendingUp size={20} />,
        unlocked: rate >= 50
      },
      {
        id: 'achiever',
        name: 'Achiever',
        description: 'Reach 75% weekly completion',
        icon: <Award size={20} />,
        unlocked: rate >= 75
      },
      {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: 'Complete all activities in a week',
        icon: <Trophy size={20} />,
        unlocked: rate === 100 && weeklyStats.totalActivities > 0
      },
      {
        id: 'streak-3',
        name: 'On Fire',
        description: 'Maintain a 3-day streak',
        icon: <Flame size={20} />,
        unlocked: streak >= 3
      },
      {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: <Flame size={20} />,
        unlocked: streak >= 7
      }
    ];
  }, [weeklyStats, streak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="progress-dashboard loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!plan) {
    return (
      <motion.div 
        className="progress-dashboard empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Calendar size={48} className="empty-icon" />
        <h3>No Plan Yet</h3>
        <p>Create a wellness plan to track your progress</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="progress-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="dashboard-header">
        <h3>📊 Weekly Progress</h3>
        <span className="week-label">This Week</span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{weeklyStats.completedActivities}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{weeklyStats.completionRate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>

        <div className="stat-card fire">
          <div className="stat-icon">
            <Flame size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{unlockedCount}/{achievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="weekly-chart">
        <h4>Daily Completion</h4>
        <div className="chart-bars">
          {dailyData.map((day) => (
            <div key={day.day} className="chart-bar-container">
              <div className="chart-bar">
                <div 
                  className="chart-bar-fill"
                  style={{ height: `${day.rate}%` }}
                />
              </div>
              <span className="chart-label">{day.day}</span>
              <span className="chart-value">{day.completed}/{day.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Day Highlight */}
      {weeklyStats.bestDay && (
        <div className="best-day-card">
          <Star size={20} />
          <span>Best day: <strong>{weeklyStats.bestDay}</strong> ({weeklyStats.bestDayRate}% completion)</span>
        </div>
      )}

      {/* Achievements */}
      <div className="achievements-section">
        <h4>🏆 Achievements</h4>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.icon}
              </div>
              <div className="achievement-info">
                <span className="achievement-name">{achievement.name}</span>
                <span className="achievement-desc">{achievement.description}</span>
              </div>
              {achievement.unlocked && <CheckCircle2 size={16} className="achievement-check" />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressDashboard;
