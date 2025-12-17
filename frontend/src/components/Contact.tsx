import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const socialLinks = [
    { name: 'X', icon: '𝕏', url: 'https://x.com' },
    { name: 'LinkedIn', icon: 'in', url: 'https://linkedin.com' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
    { name: 'Facebook', icon: 'f', url: 'https://facebook.com' }
  ];

  return (
    <div className="contact-page">
      <motion.div 
        className="contact-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="contact-header">
          <h1>Get in Touch</h1>
          <p>Have questions about SerenityAI? We'd love to hear from you.</p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <motion.div 
            className="contact-form-card card"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>📬 Send a Message</h2>
            
            {submitted ? (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="success-icon">✅</span>
                <p>Thank you for reaching out! We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="primary-btn submit-btn">
                  Send Message 🚀
                </button>
              </form>
            )}
          </motion.div>

          {/* Connect Section */}
          <motion.div 
            className="connect-card card"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2>🌐 Connect With Us</h2>
            <p className="connect-intro">
              Follow us on social media for updates, wellness tips, and community support.
            </p>

            <div className="social-links">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-link ${social.name.toLowerCase()}`}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="social-icon">{social.icon}</span>
                  <span className="social-name">{social.name}</span>
                </motion.a>
              ))}
            </div>

            <div className="contact-info">
              <div className="info-item">
                <span className="info-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>support@serenityai.app</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🌍</span>
                <div>
                  <strong>Location</strong>
                  <p>Global - Remote First</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
