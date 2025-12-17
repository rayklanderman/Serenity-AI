import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">🧘</span>
            <div>
              <span className="brand-name">SerenityAI</span>
              <span className="brand-tagline">Your Mental Wellness Companion</span>
            </div>
          </div>
          
          <div className="footer-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('landing'); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('console'); }}>Console</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('about'); }}>About</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('contact'); }}>Contact</a>
            <a href="https://github.com/rayklanderman/Serenity-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>

          <div className="footer-social">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" title="X">𝕏</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">in</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">📷</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">f</a>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 SerenityAI. All rights reserved.</p>
          <div className="footer-powered">
            <span>Built with</span>
            <span className="tech-badge">🔮 JacLang</span>
            <span className="tech-badge">⚡ Jaseci</span>
          </div>
          <p className="hackathon-text">Jaseci AI Hackathon 2025</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


