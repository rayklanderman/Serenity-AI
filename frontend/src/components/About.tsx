import React from 'react';

const About: React.FC = () => {
  const benefits = [
    { icon: '🎯', title: 'Track Your Mood', desc: 'Log emotions daily and see patterns emerge' },
    { icon: '🤖', title: 'AI Companion', desc: 'Get personalized, empathetic support' },
    { icon: '📈', title: 'See Progress', desc: 'Weekly insights show your emotional growth' },
    { icon: '🧠', title: 'Mindfulness', desc: 'Breathing exercises and calming tips' },
    { icon: '📝', title: 'Journal', desc: 'Write freely with AI-powered insights' },
    { icon: '💪', title: 'Mind Coach', desc: 'Productivity tips that respect your mental state' },
  ];

  return (
    <section className="about-section" id="about" style={{ marginBottom: 'var(--space-10)' }}>
      <h2>✨ How SerenityAI Helps You</h2>
      <p className="about-intro">
        Your personal AI companion for mental wellness and productivity
      </p>
      <div className="benefits-grid">
        {benefits.map((b, i) => (
          <div key={i} className="benefit-card">
            <span className="benefit-icon">{b.icon}</span>
            <h3>{b.title}</h3>
            <p>{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
