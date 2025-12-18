import { ReactNode } from 'react';

interface HeaderProps {
  variant: 'landing' | 'console' | 'standard';
  currentPage: string;
  activeTab?: string;
  journalCount?: number;
  user: { email: string } | null;
  isConfigured: boolean;
  onNavigate: (page: string) => void;
  onTabChange?: (tab: string) => void;
  onSignOut: () => void;
  onShowAuth: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  variant,
  currentPage,
  activeTab,
  journalCount = 0,
  user,
  isConfigured,
  onNavigate,
  onTabChange,
  onSignOut,
  onShowAuth,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const headerClass = variant === 'landing' ? 'landing-header' : 'app-header';

  const handleNavClick = (page: string) => {
    onNavigate(page);
    onToggleMobileMenu();
  };

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
      onToggleMobileMenu();
    }
  };

  return (
    <>
      <header className={headerClass}>
        <div className="logo-container" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="SerenityAI" className="header-logo" />
          {variant === 'landing' ? (
            <span className="logo-text">SerenityAI</span>
          ) : (
            <h1>SerenityAI {variant === 'console' && <span className="console-badge">Console</span>}</h1>
          )}
        </div>

        {/* Desktop Navigation */}
        {variant === 'landing' && (
          <nav className="landing-nav desktop-nav">
            <button onClick={() => onNavigate('console')}>Console</button>
            <button onClick={() => onNavigate('about')}>About</button>
            <button onClick={() => onNavigate('contact')}>Contact</button>
          </nav>
        )}

        {variant === 'console' && (
          <nav>
            <button onClick={() => onNavigate('landing')}>Home</button>
            <button
              className={activeTab === 'log' ? 'active' : ''}
              onClick={() => onTabChange?.('log')}
            >
              Check-in
            </button>
            <button
              className={activeTab === 'journal' ? 'active' : ''}
              onClick={() => onTabChange?.('journal')}
            >
              Journal {journalCount > 0 && <span className="badge">{journalCount}</span>}
            </button>
            <button
              className={activeTab === 'insights' ? 'active' : ''}
              onClick={() => onTabChange?.('insights')}
            >
              Insights
            </button>
          </nav>
        )}

        {variant === 'standard' && (
          <nav>
            <button onClick={() => onNavigate('landing')}>Home</button>
            <button onClick={() => onNavigate('console')}>Console</button>
            <button className={currentPage === 'about' ? 'active' : ''} onClick={() => onNavigate('about')}>About</button>
            <button className={currentPage === 'contact' ? 'active' : ''} onClick={() => onNavigate('contact')}>Contact</button>
          </nav>
        )}

        {/* Mobile Hamburger */}
        <button
          className="hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Desktop Auth */}
        <div className={`auth-section ${variant === 'landing' ? 'desktop-auth' : ''}`}>
          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button className="auth-btn" onClick={onSignOut}>Sign Out</button>
            </div>
          ) : (
            <button className="auth-btn primary" onClick={onShowAuth}>
              {isConfigured ? '🔐 Sign In' : '👤 Guest Mode'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={onToggleMobileMenu}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-nav-brand">
                <img src="/logo.png" alt="SerenityAI" className="mobile-logo" />
                <span>SerenityAI</span>
              </div>
              <button className="close-btn" onClick={onToggleMobileMenu}>×</button>
            </div>
            <div className="mobile-nav-links">
              <button onClick={() => handleNavClick('landing')}>Home</button>
              {variant === 'console' ? (
                <>
                  <button onClick={() => handleTabClick('log')}>Check-in</button>
                  <button onClick={() => handleTabClick('journal')}>Journal</button>
                  <button onClick={() => handleTabClick('insights')}>Insights</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNavClick('console')}>Console</button>
                  <button onClick={() => handleNavClick('about')}>About</button>
                  <button onClick={() => handleNavClick('contact')}>Contact</button>
                </>
              )}
            </div>
            <div className="mobile-auth">
              {user ? (
                <>
                  <span className="user-email">{user.email}</span>
                  <button className="auth-btn-mobile" onClick={() => { onSignOut(); onToggleMobileMenu(); }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <button className="auth-btn-mobile primary" onClick={() => { onShowAuth(); onToggleMobileMenu(); }}>
                  {isConfigured ? 'Sign In' : 'Continue as Guest'}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
