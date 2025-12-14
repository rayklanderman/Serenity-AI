import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🧘</span>
          <span>SerenityAI</span>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="https://github.com/rayklanderman/Serenity-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="footer-copy">
          SerenityAI © 2025
        </p>
      </div>
    </footer>
  );
};

export default Footer;
