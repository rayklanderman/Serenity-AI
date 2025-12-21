import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: '😊',
      title: 'Mood Check-in',
      description: 'Track your emotions with our intuitive emoji wheel and receive personalized AI responses.'
    },
    {
      icon: '🧠',
      title: 'Mind Coach',
      description: 'Get productivity tips that respect your mental state - because wellness comes first.'
    },
    {
      icon: '📝',
      title: 'Smart Journal',
      description: 'Write freely and receive AI-powered insights that help you understand your thoughts.'
    },
    {
      icon: '📊',
      title: 'Pattern Analysis',
      description: 'Discover trends in your emotional wellbeing with weekly insights and recommendations.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          <h1 className="hero-title">
            Your AI-Powered
            <span className="gradient-text"> Mental Wellness </span>
            Companion
          </h1>
          
          <p className="hero-subtitle">
            SerenityAI uses intelligent agents to provide personalized emotional support, 
            track your moods, and help you understand your mental wellbeing patterns.
          </p>

          <div className="hero-cta">
            <motion.button 
              className="cta-primary"
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Your Journey ✨
            </motion.button>
            <a href="#features" className="cta-secondary">
              Learn More →
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">6</span>
              <span className="stat-label">AI Agents</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Private</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="floating-emojis">
            <motion.span 
              className="float-emoji e1"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
            >😊</motion.span>
            <motion.span 
              className="float-emoji e2"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >😌</motion.span>
            <motion.span 
              className="float-emoji e3"
              animate={{ y: [-5, 15, -5] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >💜</motion.span>
            <motion.span 
              className="float-emoji e4"
              animate={{ y: [5, -15, 5] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >💜</motion.span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2>Powered by 6 Intelligent Agents</h2>
          <p>Built with JacLang's byLLM architecture for personalized, empathetic support</p>
        </motion.div>

        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              variants={itemVariants}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tech Section */}
      <section className="tech-section">
        <motion.div 
          className="tech-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Built with Cutting-Edge AI</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <span className="tech-icon">🔮</span>
              <div>
                <strong>JacLang</strong>
                <p>OSP Graph Architecture</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🤖</span>
              <div>
                <strong>6 byLLM Agents</strong>
                <p>Generative & Analytical</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">⚡</span>
              <div>
                <strong>Groq API</strong>
                <p>Ultra-fast Inference</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🎨</span>
              <div>
                <strong>React + TypeScript</strong>
                <p>Modern Frontend</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Begin Your Wellness Journey?</h2>
          <p>Join SerenityAI and experience the future of mental wellness support.</p>
          <motion.button 
            className="cta-primary large"
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Free 🚀
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
