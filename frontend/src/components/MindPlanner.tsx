import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

interface Schedule {
  occupation: string;
  workDays: string[];
  workStartHour: number;
  workEndHour: number;
  stressByDay: Record<string, number>;
}

interface WellnessPlan {
  day: string;
  activities: Array<{
    time: string;
    activity: string;
    icon: string;
    duration: string;
  }>;
  affirmation: string;
}

const MindPlanner: React.FC<MindPlannerProps> = ({ userContext: _userContext }) => {
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
  const [plan, setPlan] = useState<WellnessPlan[] | null>(null);
  const [loading, setLoading] = useState(false);

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
    // For MVP, generate a sample plan
    // In full version, this would call /walker/WellnessPlanner
    setTimeout(() => {
      const samplePlan: WellnessPlan[] = DAYS.map(day => {
        const stress = schedule.stressByDay[day];
        const isWorkDay = schedule.workDays.includes(day);
        
        return {
          day,
          activities: [
            { 
              time: '7:00 AM', 
              activity: stress > 6 ? 'Gentle morning stretch' : 'Energizing yoga flow',
              icon: '🧘',
              duration: '15 min'
            },
            { 
              time: isWorkDay ? '12:30 PM' : '10:00 AM', 
              activity: 'Mindful breathing break',
              icon: '🫁',
              duration: '5 min'
            },
            { 
              time: isWorkDay ? '6:00 PM' : '3:00 PM', 
              activity: stress > 7 ? 'Stress-relief walk' : 'Creative activity time',
              icon: stress > 7 ? '🚶' : '🎨',
              duration: '30 min'
            },
            { 
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
      setPlan(samplePlan);
      setStep(4);
      setLoading(false);
    }, 2000);
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return '#22c55e';
    if (level <= 6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div 
      className="card mind-planner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="planner-header">
        <h2>🗓️ Mind Planner</h2>
        <p className="subtitle">Create your personalized 7-day wellness plan</p>
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
          <div className="occupation-grid">
            {OCCUPATIONS.map(occ => (
              <button
                key={occ.id}
                className={`occupation-btn ${schedule.occupation === occ.id ? 'selected' : ''}`}
                onClick={() => setSchedule(prev => ({ ...prev, occupation: occ.id }))}
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
          <div className="days-grid">
            {DAYS.map(day => (
              <button
                key={day}
                className={`day-btn ${schedule.workDays.includes(day) ? 'selected' : ''}`}
                onClick={() => toggleWorkDay(day)}
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
          
          <div className="stress-sliders">
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
                />
                <span 
                  className="stress-value"
                  style={{ color: getStressColor(schedule.stressByDay[day]) }}
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

      {/* Step 4: Generated Plan */}
      {step === 4 && plan && (
        <motion.div 
          className="planner-step plan-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3>Your 7-Day Wellness Plan</h3>
          
          <div className="plan-days">
            {plan.map((dayPlan, i) => (
              <motion.div 
                key={dayPlan.day}
                className="plan-day-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="day-header">
                  <h4>{dayPlan.day}</h4>
                  <span 
                    className="stress-badge"
                    style={{ background: getStressColor(schedule.stressByDay[dayPlan.day]) }}
                  >
                    Stress: {schedule.stressByDay[dayPlan.day]}/10
                  </span>
                </div>
                
                <div className="day-activities">
                  {dayPlan.activities.map((act, j) => (
                    <div key={j} className="activity-item">
                      <span className="act-icon">{act.icon}</span>
                      <div className="act-details">
                        <span className="act-time">{act.time}</span>
                        <span className="act-name">{act.activity}</span>
                        <span className="act-duration">{act.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="day-affirmation">
                  <span>💜</span> {dayPlan.affirmation}
                </div>
              </motion.div>
            ))}
          </div>

          <button className="secondary-btn" onClick={() => setStep(1)}>
            🔄 Create New Plan
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MindPlanner;
