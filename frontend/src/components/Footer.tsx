import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🧘</span>
          <span>SerenityAI</span>
        </div>
        
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('about'); }}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('contact'); }}>Contact</a>
          <a href="https://github.com/rayklanderman/Serenity-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        
        <div className="footer-social">
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="X (Twitter)">𝕏</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="LinkedIn">in</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">📷</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Facebook">f</a>
        </div>
        
        <div className="footer-powered">
          <p>Built with 💜 using</p>
          <div className="powered-logos">
            <span className="powered-item">🔮 JacLang</span>
            <span className="powered-separator">•</span>
            <span className="powered-item">⚡ Jaseci</span>
          </div>
        </div>
        
        <p className="footer-copy">
          SerenityAI © 2025 | Jaseci AI Hackathon
        </p>
      </div>
    </footer>
  );
};

export default Footer;

