import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { usePlannerStorage } from '../hooks/usePlannerStorage';
import { useAuth } from '../contexts/AuthContext';
import type { UserContext } from '../types';

interface MindPlannerProps {
  userContext: UserContext;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const OCCUPATIONS = [
  { id: 'student', label: 'Student', icon: '📚' },
  { id: 'employed', label: 'Working', icon: '💼' },
  { id: 'self-employed', label: 'Self-Employed', icon: '🏠' },
  { id: 'other', label: 'Other', icon: '✨' },
];

interface Activity {
  id: string;
  time: string;
  activity: string;
  icon: string;
  duration: string;
  completed?: boolean;
}

interface Schedule {
  occupation: string;
  workDays: string[];
  workStartHour: number;
  workEndHour: number;
  stressByDay: Record<string, number>;
}

interface DayPlan {
  day: string;
  activities: Activity[];
  affirmation: string;
}

const MindPlanner: React.FC<MindPlannerProps> = ({ userContext: _userContext }) => {
  const { user } = useAuth();
  const { savePlan, getCurrentPlan, loading: storageLoading } = usePlannerStorage();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [schedule, setSchedule] = useState<Schedule>({
    occupation: '',
    workDays: [],
    workStartHour: 9,
    workEndHour: 17,
    stressByDay: {
      Monday: 5, Tuesday: 5, Wednesday: 5, Thursday: 5,
      Friday: 5, Saturday: 3, Sunday: 2
    }
  });
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [editingActivity, setEditingActivity] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [editForm, setEditForm] = useState({ time: '', activity: '', duration: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDayIndex, setAddDayIndex] = useState(0);

  // Load existing plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      const savedPlan = await getCurrentPlan();
      if (savedPlan) {
        setSchedule(savedPlan.schedule_data as Schedule);
        setPlan(savedPlan.plan_data as DayPlan[]);
        setStep(4);
      }
    };
    if (user) loadPlan();
  }, [user, getCurrentPlan]);

  // Set current day index to today
  useEffect(() => {
    const today = new Date().getDay();
    // Convert Sunday=0 to Sunday=6 (our array is Monday-Sunday)
    const index = today === 0 ? 6 : today - 1;
    setCurrentDayIndex(index);
  }, []);

  // Get formatted date for a day in the current week
  const getDateForDay = (dayIndex: number): string => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const currentIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const diff = dayIndex - currentIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if a day index is today
  const isToday = (dayIndex: number): boolean => {
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;
    return dayIndex === todayIndex;
  };

  // Get current time for display
  const getCurrentTimeInfo = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleWorkDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  const updateStress = (day: string, level: number) => {
    setSchedule(prev => ({
      ...prev,
      stressByDay: { ...prev.stressByDay, [day]: level }
    }));
  };

  const generatePlan = async () => {
    setLoading(true);
    
    // Generate plan based on schedule
    const generatedPlan: DayPlan[] = DAYS.map(day => {
      const stress = schedule.stressByDay[day];
      const isWorkDay = schedule.workDays.includes(day);
      
      return {
        day,
        activities: [
          { 
            id: generateId(),
            time: '7:00 AM', 
            activity: stress > 6 ? 'Gentle morning stretch' : 'Energizing yoga flow',
            icon: '🧠',
            duration: '15 min'
          },
          { 
            id: generateId(),
            time: isWorkDay ? '12:30 PM' : '10:00 AM', 
            activity: 'Mindful breathing break',
            icon: '🫁',
            duration: '5 min'
          },
          { 
            id: generateId(),
            time: isWorkDay ? '6:00 PM' : '3:00 PM', 
            activity: stress > 7 ? 'Stress-relief walk' : 'Creative activity time',
            icon: stress > 7 ? '🚶' : '🎨',
            duration: '30 min'
          },
          { 
            id: generateId(),
            time: '9:00 PM', 
            activity: 'Gratitude journaling',
            icon: '📝',
            duration: '10 min'
          }
        ],
        affirmation: stress > 6 
          ? "I release what I cannot control and embrace peace."
          : "I am capable, calm, and ready for whatever comes."
      };
    });
    
    setPlan(generatedPlan);
    setStep(4);
    setLoading(false);

    // Save to Supabase
    if (user) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: generatedPlan
      });
    }
  };

  const startEditActivity = (dayIndex: number, actIndex: number) => {
    const activity = plan![dayIndex].activities[actIndex];
    setEditForm({
      time: activity.time,
      activity: activity.activity,
      duration: activity.duration
    });
    setEditingActivity({ dayIndex, actIndex });
  };

  const saveEditActivity = async () => {
    if (!editingActivity || !plan) return;
    
    const newPlan = [...plan];
    const { dayIndex, actIndex } = editingActivity;
    newPlan[dayIndex].activities[actIndex] = {
      ...newPlan[dayIndex].activities[actIndex],
      ...editForm
    };
    
    setPlan(newPlan);
    setEditingActivity(null);
    
    // Save to Supabase
    if (user) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: newPlan
      });
    }
  };

  const deleteActivity = async (dayIndex: number, actIndex: number) => {
    if (!plan) return;
    
    const newPlan = [...plan];
    newPlan[dayIndex].activities.splice(actIndex, 1);
    setPlan(newPlan);
    
    // Save to Supabase
    if (user) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: newPlan
      });
    }
  };

  const addActivity = async () => {
    if (!plan) return;
    
    const newPlan = [...plan];
    newPlan[addDayIndex].activities.push({
      id: generateId(),
      time: editForm.time || '12:00 PM',
      activity: editForm.activity || 'New activity',
      icon: '✨',
      duration: editForm.duration || '15 min'
    });
    
    setPlan(newPlan);
    setShowAddModal(false);
    setEditForm({ time: '', activity: '', duration: '' });
    
    // Save to Supabase
    if (user) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: newPlan
      });
    }
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return '#22c55e';
    if (level <= 6) return '#f59e0b';
    return '#ef4444';
  };

  // Toggle activity completion
  const toggleActivityComplete = async (dayIndex: number, actIndex: number) => {
    if (!plan) return;
    
    const newPlan = [...plan];
    const activity = newPlan[dayIndex].activities[actIndex];
    activity.completed = !activity.completed;
    
    setPlan(newPlan);
    
    // Save to Supabase
    if (user) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      await savePlan({
        week_start: monday.toISOString().split('T')[0],
        schedule_data: schedule,
        plan_data: newPlan
      });
    }
  };

  // Calculate daily progress
  const getDayProgress = (dayIndex: number) => {
    if (!plan || !plan[dayIndex]) return { completed: 0, total: 0, percentage: 0 };
    const activities = plan[dayIndex].activities;
    const completed = activities.filter(a => a.completed).length;
    const total = activities.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDayIndex(prev => {
      if (direction === 'prev') return prev > 0 ? prev - 1 : 6;
      return prev < 6 ? prev + 1 : 0;
    });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateDay('next'),
    onSwipedRight: () => navigateDay('prev'),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <motion.div 
      className="card mind-planner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="planner-header">
        <h2>🗓️ Mind Planner</h2>
        <p className="subtitle">Create your personalized 7-day wellness plan</p>
        <p className="current-date">{getCurrentTimeInfo()}</p>
      </div>

      {/* Progress Steps */}
      <div className="planner-steps">
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`step-indicator ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}
          >
            {s === 4 ? '✨' : s}
          </div>
        ))}
      </div>

      {/* Step 1: Occupation */}
      {step === 1 && (
        <motion.div 
          className="planner-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>What best describes you?</h3>
          <div className="occupation-grid" role="radiogroup" aria-label="Occupation selection">
            {OCCUPATIONS.map(occ => (
              <button
                key={occ.id}
                className={`occupation-btn ${schedule.occupation === occ.id ? 'selected' : ''}`}
                onClick={() => setSchedule(prev => ({ ...prev, occupation: occ.id }))}
                role="radio"
                aria-checked={schedule.occupation === occ.id}
                aria-label={`${occ.label} occupation`}
              >
                <span className="occ-icon">{occ.icon}</span>
                <span>{occ.label}</span>
              </button>
            ))}
          </div>
          <button 
            className="primary-btn"
            disabled={!schedule.occupation}
            onClick={() => setStep(2)}
          >
            Continue →
          </button>
        </motion.div>
      )}

      {/* Step 2: Work Days */}
      {step === 2 && (
        <motion.div 
          className="planner-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Which days are you typically busy?</h3>
          <p className="step-hint">Select your work/study days</p>
          <div className="days-grid" role="group" aria-label="Work days selection">
            {DAYS.map(day => (
              <button
                key={day}
                className={`day-btn ${schedule.workDays.includes(day) ? 'selected' : ''}`}
                onClick={() => toggleWorkDay(day)}
                role="checkbox"
                aria-checked={schedule.workDays.includes(day)}
                aria-label={`${day} ${schedule.workDays.includes(day) ? 'selected' : 'not selected'}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          
          {schedule.workDays.length > 0 && (
            <div className="hours-section">
              <h4>Typical hours</h4>
              <div className="hours-inputs">
                <label>
                  Start
                  <select 
                    value={schedule.workStartHour}
                    onChange={(e) => setSchedule(prev => ({ ...prev, workStartHour: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 6).map(h => (
                      <option key={h} value={h}>{h}:00</option>
                    ))}
                  </select>
                </label>
                <span>to</span>
                <label>
                  End
                  <select 
                    value={schedule.workEndHour}
                    onChange={(e) => setSchedule(prev => ({ ...prev, workEndHour: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 12).map(h => (
                      <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          <div className="step-buttons">
            <button className="secondary-btn" onClick={() => setStep(1)}>← Back</button>
            <button className="primary-btn" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Stress Levels */}
      {step === 3 && (
        <motion.div 
          className="planner-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Rate your typical stress level by day</h3>
          <p className="step-hint">This helps us tailor your wellness activities</p>
          
          <div className="stress-sliders" role="group" aria-label="Stress level ratings by day">
            {DAYS.map(day => (
              <div key={day} className="stress-row">
                <span className="day-label">{day.slice(0, 3)}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={schedule.stressByDay[day]}
                  onChange={(e) => updateStress(day, parseInt(e.target.value))}
                  style={{ '--stress-color': getStressColor(schedule.stressByDay[day]) } as React.CSSProperties}
                  aria-label={`Stress level for ${day}`}
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={schedule.stressByDay[day]}
                  aria-valuetext={`Level ${schedule.stressByDay[day]} out of 10`}
                />
                <span 
                  className="stress-value"
                  style={{ color: getStressColor(schedule.stressByDay[day]) }}
                  aria-live="polite"
                >
                  {schedule.stressByDay[day]}
                </span>
              </div>
            ))}
          </div>

          <div className="step-buttons">
            <button className="secondary-btn" onClick={() => setStep(2)}>← Back</button>
            <button 
              className="primary-btn generate-btn"
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? '✨ Creating Your Plan...' : '✨ Generate My Wellness Plan'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Horizontal Carousel Plan View */}
      {step === 4 && plan && (
        <motion.div 
          className="planner-step plan-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3>Your 7-Day Wellness Plan</h3>
          
          {/* Carousel Container */}
          <div 
            className="plan-carousel" 
            {...swipeHandlers}
            role="region"
            aria-label="Weekly wellness plan carousel"
            aria-live="polite"
          >
            <button 
              className="carousel-arrow carousel-prev" 
              onClick={() => navigateDay('prev')}
              aria-label="Previous day"
            >
              ◀
            </button>
            
            <div className="carousel-content">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentDayIndex}
                  className="carousel-day-card"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="day-header">
                    <div className="day-title-row">
                      <h4>{plan[currentDayIndex].day}, {getDateForDay(currentDayIndex)}</h4>
                      {isToday(currentDayIndex) && <span className="today-badge">Today</span>}
                    </div>
                    <div className="day-header-badges">
                      <span 
                        className="stress-badge"
                        style={{ background: getStressColor(schedule.stressByDay[plan[currentDayIndex].day]) }}
                      >
                        Stress: {schedule.stressByDay[plan[currentDayIndex].day]}/10
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="day-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${getDayProgress(currentDayIndex).percentage}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {getDayProgress(currentDayIndex).completed}/{getDayProgress(currentDayIndex).total} completed
                    </span>
                  </div>
                  
                  <div className="day-activities">
                    {plan[currentDayIndex].activities.map((act, j) => (
                      <div key={act.id} className={`activity-item editable ${act.completed ? 'completed' : ''}`}>
                        <button 
                          className={`activity-checkbox ${act.completed ? 'checked' : ''}`}
                          onClick={() => toggleActivityComplete(currentDayIndex, j)}
                          aria-label={act.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {act.completed ? '✓' : ''}
                        </button>
                        <span className="act-icon">{act.icon}</span>
                        <div className="act-details">
                          <span className="act-time">{act.time}</span>
                          <span className="act-name">{act.activity}</span>
                          <span className="act-duration">{act.duration}</span>
                        </div>
                        <div className="activity-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => startEditActivity(currentDayIndex, j)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteActivity(currentDayIndex, j)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      className="add-activity-btn"
                      onClick={() => { setAddDayIndex(currentDayIndex); setShowAddModal(true); }}
                    >
                      + Add Activity
                    </button>
                  </div>
                  
                  <div className="day-affirmation">
                    <span>💜</span> {plan[currentDayIndex].affirmation}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <button 
              className="carousel-arrow carousel-next" 
              onClick={() => navigateDay('next')}
              aria-label="Next day"
            >
              ▶
            </button>
          </div>

          {/* Day Indicator Dots */}
          <div className="carousel-dots" role="tablist" aria-label="Day navigation">
            {plan.map((dayPlan, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === currentDayIndex ? 'active' : ''}`}
                onClick={() => setCurrentDayIndex(i)}
                title={dayPlan.day}
                role="tab"
                aria-selected={i === currentDayIndex}
                aria-label={`Go to ${dayPlan.day}`}
              >
                {dayPlan.day.slice(0, 1)}
              </button>
            ))}
          </div>

          <button className="secondary-btn" onClick={() => setStep(1)} style={{ marginTop: 'var(--space-4)' }}>
            🔄 Create New Plan
          </button>
        </motion.div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="modal-overlay" onClick={() => setEditingActivity(null)} role="presentation">
          <motion.div 
            className="edit-modal"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <h3 id="edit-modal-title">Edit Activity</h3>
            <div className="edit-form">
              <label>
                Time
                <input 
                  type="text" 
                  value={editForm.time}
                  onChange={e => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 7:00 AM"
                />
              </label>
              <label>
                Activity
                <input 
                  type="text" 
                  value={editForm.activity}
                  onChange={e => setEditForm(prev => ({ ...prev, activity: e.target.value }))}
                  placeholder="e.g., Morning yoga"
                />
              </label>
              <label>
                Duration
                <input 
                  type="text" 
                  value={editForm.duration}
                  onChange={e => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 15 min"
                />
              </label>
            </div>
            <div className="modal-buttons">
              <button className="secondary-btn" onClick={() => setEditingActivity(null)}>Cancel</button>
              <button className="primary-btn" onClick={saveEditActivity}>Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} role="presentation">
          <motion.div 
            className="edit-modal"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-modal-title"
          >
            <h3 id="add-modal-title">Add Activity to {plan?.[addDayIndex]?.day}</h3>
            <div className="edit-form">
              <label>
                Time
                <input 
                  type="text" 
                  value={editForm.time}
                  onChange={e => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 2:00 PM"
                />
              </label>
              <label>
                Activity
                <input 
                  type="text" 
                  value={editForm.activity}
                  onChange={e => setEditForm(prev => ({ ...prev, activity: e.target.value }))}
                  placeholder="e.g., Meditation session"
                />
              </label>
              <label>
                Duration
                <input 
                  type="text" 
                  value={editForm.duration}
                  onChange={e => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 20 min"
                />
              </label>
            </div>
            <div className="modal-buttons">
              <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={addActivity}>Add Activity</button>
            </div>
          </motion.div>
        </div>
      )}

      {storageLoading && (
        <div className="saving-indicator">Saving...</div>
      )}
    </motion.div>
  );
};

export default MindPlanner;
