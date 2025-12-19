import React from 'react';
import { Github, Twitter, Linkedin, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`app-footer ${className || ''}`}>
      <div className="footer-inner">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <Sparkles className="footer-logo-icon" size={32} strokeWidth={1.5} />
            <div>
              <span className="brand-name">SerenityAI</span>
              <span className="brand-tagline">Your Mental Wellness Companion</span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="footer-nav-section">
            <h4 className="footer-heading">Navigation</h4>
            <nav className="footer-nav">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('landing'); }}>Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('console'); }}>Console</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('about'); }}>About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('contact'); }}>Contact</a>
            </nav>
          </div>

          {/* Connect Section */}
          <div className="footer-connect">
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-social">
              <a 
                href="https://github.com/rayklanderman/Serenity-AI" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="View source code on GitHub"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Follow us on X"
              >
                <Twitter size={16} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-meta">
            <p className="footer-copyright">
              © {currentYear} SerenityAI. Made with <Heart size={12} className="heart-icon" /> for mental wellness.
            </p>
            <div className="footer-badges">
              <span className="tech-badge" title="Built with Jac">
                <Sparkles size={12} /> Jac
              </span>
              <span className="tech-badge" title="Powered by Jaseci">
                ⚡ Jaseci
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
