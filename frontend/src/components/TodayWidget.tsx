import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerStorage } from '../hooks/usePlannerStorage';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react';

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

interface TodayWidgetProps {
  onNavigateToPlanner?: () => void;
}

const TodayWidget: React.FC<TodayWidgetProps> = ({ onNavigateToPlanner }) => {
  const { user } = useAuth();
  const { getCurrentPlan, savePlan } = usePlannerStorage();
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [fullPlan, setFullPlan] = useState<DayPlan[] | null>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const loadTodayPlan = async () => {
      setLoading(true);
      const savedPlan = await getCurrentPlan();
      if (savedPlan && savedPlan.plan_data) {
        const planData = savedPlan.plan_data as DayPlan[];
        setFullPlan(planData);
        setSchedule(savedPlan.schedule_data);
        
        // Get today's plan
        const today = new Date().getDay();
        const dayName = DAYS[today];
        const todayData = planData.find(d => d.day === dayName);
        setTodayPlan(todayData || null);
      }
      setLoading(false);
    };

    if (user) {
      loadTodayPlan();
    } else {
      setLoading(false);
    }
  }, [user, getCurrentPlan]);

  const toggleComplete = async (actIndex: number) => {
    if (!todayPlan || !fullPlan) return;

    const today = new Date().getDay();
    const dayName = DAYS[today];
    const dayIndex = fullPlan.findIndex(d => d.day === dayName);
    
    if (dayIndex === -1) return;

    const newPlan = [...fullPlan];
    newPlan[dayIndex].activities[actIndex].completed = 
      !newPlan[dayIndex].activities[actIndex].completed;
    
    setFullPlan(newPlan);
    setTodayPlan(newPlan[dayIndex]);

    // Save to Supabase
    if (user && schedule) {
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const monday = new Date(todayDate);
      monday.setDate(todayDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: newPlan
      });
    }
  };

  const completedCount = todayPlan?.activities.filter(a => a.completed).length || 0;
  const totalCount = todayPlan?.activities.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="today-widget loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!todayPlan) {
    return (
      <motion.div 
        className="today-widget empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Calendar size={32} className="widget-icon" />
        <h3>No Plan for Today</h3>
        <p>Create a wellness plan to see your activities here</p>
        {onNavigateToPlanner && (
          <button className="create-plan-btn" onClick={onNavigateToPlanner}>
            Create Plan <ChevronRight size={16} />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="today-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="widget-header">
        <div className="widget-title">
          <Calendar size={20} />
          <h3>Today's Wellness</h3>
        </div>
        <span className="today-day">{todayPlan.day}</span>
      </div>

      {/* Progress */}
      <div className="widget-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-label">
          {completedCount}/{totalCount} done ({progressPercent}%)
        </span>
      </div>

      {/* Activities List */}
      <div className="widget-activities">
        {todayPlan.activities.slice(0, 4).map((act, i) => (
          <div 
            key={act.id} 
            className={`widget-activity ${act.completed ? 'completed' : ''}`}
            onClick={() => toggleComplete(i)}
          >
            <button 
              className={`widget-checkbox ${act.completed ? 'checked' : ''}`}
              aria-label={act.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {act.completed && <CheckCircle size={14} />}
            </button>
            <span className="widget-act-icon">{act.icon}</span>
            <div className="widget-act-info">
              <span className="widget-act-name">{act.activity}</span>
              <span className="widget-act-time">
                <Clock size={12} /> {act.time}
              </span>
            </div>
          </div>
        ))}
        {todayPlan.activities.length > 4 && (
          <button className="see-more-btn" onClick={onNavigateToPlanner}>
            +{todayPlan.activities.length - 4} more activities
          </button>
        )}
      </div>

      {/* Affirmation */}
      <div className="widget-affirmation">
        <span>💜</span> {todayPlan.affirmation}
      </div>
    </motion.div>
  );
};

export default TodayWidget;
