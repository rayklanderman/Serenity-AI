import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingPage from "./components/LandingPage";
import MoodWheel from "./components/MoodWheel";
import JournalEntry from "./components/JournalEntry";
import EmotionGraph from "./components/EmotionGraph";
import InsightsTimeline from "./components/InsightsTimeline";
import TipsPanel from "./components/TipsPanel";
import MindPlanner from "./components/MindPlanner";
import TodayWidget from "./components/TodayWidget";
import TriviaGames from "./components/TriviaGames";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import NotificationCenter from "./components/NotificationCenter";
import NotificationPermissionPrompt from "./components/NotificationPermissionPrompt";
import ProgressDashboard from "./components/ProgressDashboard";
import PointsDisplay from "./components/PointsDisplay";
import type { UserContext, Emotion } from "./types";
import { useMoodStorage, useJournalStorage } from "./hooks/useStorage";
import "./styles/index.css";

export interface MoodEntry {
  emotion: Emotion;
  timestamp: Date;
  note: string;
  aiResponse?: string;
}

export interface JournalEntryData {
  content: string;
  timestamp: Date;
  aiInsight: string;
  moodChange: number;
}

type Page = "landing" | "console" | "about" | "contact";
type ConsoleTab = "log" | "journal" | "insights" | "planner" | "games";

const AppContent: React.FC = () => {
  const { user, signOut, loading: authLoading, isConfigured } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [activeTab, setActiveTab] = useState<ConsoleTab>(() => {
    const saved = sessionStorage.getItem('serenity-active-tab');
    return (saved === 'log' || saved === 'journal' || saved === 'insights') ? saved : 'log';
  });

  // Persist active tab to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('serenity-active-tab', activeTab);
  }, [activeTab]);
  const [userContext] = useState<UserContext>({ userId: user?.id || "demo-user-1" });
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryData[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

// Auto-hide header/footer on scroll (only active on console page)
  useEffect(() => {
    const handleScroll = () => {
      if (currentPage !== "console") {
        setHeaderVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setHeaderVisible(false);
      } else {
        // Scrolling up
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, currentPage]);

  // Storage hooks for persisting and loading data
  const { getMoods } = useMoodStorage();
  const { getEntries } = useJournalStorage();

  // Load saved moods and journals from Supabase on user login
  const loadSavedData = useCallback(async () => {
    if (!user || dataLoaded) return;
    
    console.log('[App] Loading saved data for user:', user.email);
    try {
      // Load moods
      const savedMoods = await getMoods(20);
      if (savedMoods.length > 0) {
        const formattedMoods: MoodEntry[] = savedMoods.map((m: any) => ({
          emotion: {
            name: m.mood_name,
            emoji: m.emoji,
            color: '#818cf8' // Default color
          },
          timestamp: new Date(m.created_at),
          note: m.note || '',
          aiResponse: m.ai_response || ''
        }));
        setMoodHistory(formattedMoods);
        console.log('[App] Loaded', formattedMoods.length, 'moods');
      }

      // Load journal entries
      const savedJournals = await getEntries(50);
      if (savedJournals.length > 0) {
        const formattedJournals: JournalEntryData[] = savedJournals.map((j: any) => ({
          content: j.content,
          timestamp: new Date(j.created_at),
          aiInsight: j.ai_insight || '',
          moodChange: j.mood_change || 0
        }));
        setJournalEntries(formattedJournals);
        console.log('[App] Loaded', formattedJournals.length, 'journal entries');
      }

      setDataLoaded(true);
    } catch (err) {
      console.error('[App] Error loading saved data:', err);
    }
  }, [user, dataLoaded, getMoods, getEntries]);

  // Trigger data loading when user is authenticated
  useEffect(() => {
    if (user && !dataLoaded) {
      loadSavedData();
    }
  }, [user, dataLoaded, loadSavedData]);

  const handleMoodLogged = (entry: MoodEntry) => {
    setMoodHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleJournalSaved = (entry: JournalEntryData) => {
    setJournalEntries((prev) => [entry, ...prev].slice(0, 50));
  };

  const navigateToJournal = () => {
    setActiveTab("journal");
  };

  const handleGetStarted = () => {
    setCurrentPage("console");
  };

  const handleNavigate = (page: string) => {
    if (page === "landing" || page === "console" || page === "about" || page === "contact") {
      setCurrentPage(page as Page);
    }
  };

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading SerenityAI...</p>
      </div>
    );
  }

  // Header visibility class - only apply autohide on console page
  const shouldAutohide = currentPage === "console";
  const headerClass = (headerVisible || !shouldAutohide) ? "" : "header-hidden";
  const footerClass = (headerVisible || !shouldAutohide) ? "" : "footer-hidden";

  // Landing Page
  if (currentPage === "landing") {
    return (
      <div className="app-wrapper landing">
        <div className="aurora-background" />
        <header className={`landing-header ${headerClass}`}>
          <div className="logo-container" onClick={() => setCurrentPage("landing")}>
            <img src="/logo.png" alt="SerenityAI" className="header-logo" />
            <span className="logo-text">SerenityAI</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="landing-nav desktop-nav">
            <button onClick={() => setCurrentPage("console")}>Console</button>
            <button onClick={() => setCurrentPage("about")}>About</button>
            <button onClick={() => setCurrentPage("contact")}>Contact</button>
          </nav>
          
          {/* Mobile Hamburger Button */}
          <button 
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          {/* Notification Bell - only for signed in users */}
          {user && <NotificationCenter />}
          
          <div className="auth-section desktop-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button className="auth-btn" onClick={() => signOut()}>Sign Out</button>
              </div>
            ) : (
              <button className="auth-btn primary" onClick={() => setShowAuthModal(true)}>
                {isConfigured ? '🔐 Sign In' : '👤 Guest Mode'}
              </button>
            )}
          </div>
        </header>
        
        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <div className="mobile-nav-brand">
                  <img src="/logo.png" alt="SerenityAI" className="mobile-logo" />
                  <span>SerenityAI</span>
                </div>
                <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>×</button>
              </div>
              <div className="mobile-nav-links">
                <button 
                  className={activeTab === "log" ? "active" : ""} 
                  onClick={() => { setCurrentPage("landing"); setMobileMenuOpen(false); }}
                >
                  🏠 Home
                </button>
                <button onClick={() => { setCurrentPage("console"); setMobileMenuOpen(false); }}>🚀 Console</button>
                <button onClick={() => { setCurrentPage("about"); setMobileMenuOpen(false); }}>ℹ️ About</button>
                <button onClick={() => { setCurrentPage("contact"); setMobileMenuOpen(false); }}>📞 Contact</button>
              </div>
              <div className="mobile-auth">
                {user ? (
                  <>
                    <span className="user-email">{user.email}</span>
                    <button className="auth-btn-mobile" onClick={() => { signOut(); setMobileMenuOpen(false); }}>Sign Out</button>
                  </>
                ) : (
                  <button className="auth-btn-mobile primary" onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}>
                    {isConfigured ? 'Sign In' : 'Continue as Guest'}
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
        
        <LandingPage onGetStarted={handleGetStarted} />
        <Footer onNavigate={handleNavigate} className={footerClass} />
        
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // About Page
  if (currentPage === "about") {
    return (
      <div className="app-wrapper">
        <div className="aurora-background" />
        <header className={`app-header ${headerClass}`}>
          <div className="logo-container" onClick={() => setCurrentPage("landing")} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="SerenityAI" className="header-logo" />
            <h1>SerenityAI</h1>
          </div>
          <nav>
            <button onClick={() => setCurrentPage("landing")}>Home</button>
            <button onClick={() => setCurrentPage("console")}>Console</button>
            <button className="active">About</button>
            <button onClick={() => setCurrentPage("contact")}>Contact</button>
          </nav>
          
          <button 
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* Notification Bell - only for signed in users */}
          {user && <NotificationCenter />}

          <div className="auth-section desktop-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button className="auth-btn" onClick={() => signOut()}>Sign Out</button>
              </div>
            ) : (
              <button className="auth-btn primary" onClick={() => setShowAuthModal(true)}>
                {isConfigured ? 'Sign In' : 'Guest Mode'}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Nav Overlay for Generic Pages */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <div className="mobile-nav-brand">
                  <img src="/logo.png" alt="SerenityAI" className="mobile-logo" />
                  <span>SerenityAI</span>
                </div>
                <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>×</button>
              </div>
              <div className="mobile-nav-links">
                <button onClick={() => { setCurrentPage("landing"); setMobileMenuOpen(false); }}>🏠 Home</button>
                <button onClick={() => { setCurrentPage("console"); setMobileMenuOpen(false); }}>🚀 Console</button>
                <button className="active" onClick={() => setMobileMenuOpen(false)}>ℹ️ About</button>
                <button onClick={() => { setCurrentPage("contact"); setMobileMenuOpen(false); }}>📞 Contact</button>
              </div>
            </nav>
          </div>
        )}

        <main className="app-content">
          <About />
        </main>
        <Footer onNavigate={handleNavigate} className={footerClass} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // Contact Page
  if (currentPage === "contact") {
    return (
      <div className="app-wrapper">
        <div className="aurora-background" />
        <header className={`app-header ${headerClass}`}>
          <div className="logo-container" onClick={() => setCurrentPage("landing")} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="SerenityAI" className="header-logo" />
            <h1>SerenityAI</h1>
          </div>
          <nav>
            <button onClick={() => setCurrentPage("landing")}>Home</button>
            <button onClick={() => setCurrentPage("console")}>Console</button>
            <button onClick={() => setCurrentPage("about")}>About</button>
            <button className="active">Contact</button>
          </nav>

          <button 
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* Notification Bell - only for signed in users */}
          {user && <NotificationCenter />}

          <div className="auth-section desktop-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button className="auth-btn" onClick={() => signOut()}>Sign Out</button>
              </div>
            ) : (
              <button className="auth-btn primary" onClick={() => setShowAuthModal(true)}>
                {isConfigured ? 'Sign In' : 'Guest Mode'}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Nav Overlay for Generic Pages */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <div className="mobile-nav-brand">
                  <img src="/logo.png" alt="SerenityAI" className="mobile-logo" />
                  <span>SerenityAI</span>
                </div>
                <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>×</button>
              </div>
              <div className="mobile-nav-links">
                <button onClick={() => { setCurrentPage("landing"); setMobileMenuOpen(false); }}>🏠 Home</button>
                <button onClick={() => { setCurrentPage("console"); setMobileMenuOpen(false); }}>🚀 Console</button>
                <button onClick={() => { setCurrentPage("about"); setMobileMenuOpen(false); }}>ℹ️ About</button>
                <button className="active" onClick={() => setMobileMenuOpen(false)}>📞 Contact</button>
              </div>
            </nav>
          </div>
        )}

        <main className="app-content">
          <Contact />
        </main>
        <Footer onNavigate={handleNavigate} className={footerClass} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // Console (Main App)
  return (
    <div className="app-wrapper" role="application" aria-label="SerenityAI Wellness Console">
      <div className="aurora-background" />
      
      {/* Full-width header - outside container for consistent layout */}
      <header className={`landing-header ${headerClass}`} role="banner">
        <div className="logo-container" onClick={() => setCurrentPage("landing")} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="SerenityAI" className="header-logo" />
          <span className="logo-text">SerenityAI</span>
          <span className="console-badge">Console</span>
        </div>
        <nav className="landing-nav desktop-nav" role="navigation" aria-label="Main navigation">
          <button onClick={() => setCurrentPage("landing")}>Home</button>
          <button
            className={activeTab === "log" ? "active" : ""}
            onClick={() => setActiveTab("log")}
            aria-current={activeTab === "log" ? "page" : undefined}
          >
            Check-in
          </button>
          <button
            className={activeTab === "journal" ? "active" : ""}
            onClick={() => setActiveTab("journal")}
            aria-current={activeTab === "journal" ? "page" : undefined}
          >
            Journal {journalEntries.length > 0 && <span className="badge" aria-label={`${journalEntries.length} entries`}>{journalEntries.length}</span>}
          </button>
          <button
            className={activeTab === "insights" ? "active" : ""}
            onClick={() => setActiveTab("insights")}
            aria-current={activeTab === "insights" ? "page" : undefined}
          >
            Insights
          </button>
          <button
            className={activeTab === "planner" ? "active" : ""}
            onClick={() => setActiveTab("planner")}
            aria-current={activeTab === "planner" ? "page" : undefined}
          >
            Planner
          </button>
          <button
            className={activeTab === "games" ? "active" : ""}
            onClick={() => setActiveTab("games")}
            aria-current={activeTab === "games" ? "page" : undefined}
          >
            Games
          </button>
        </nav>
        
        {/* Notification Bell - between nav and auth */}
        <NotificationCenter />
        
        {/* Mobile Hamburger */}
        <button 
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <div className="desktop-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button className="auth-btn" onClick={() => signOut()}>Sign Out</button>
            </div>
          ) : (
            <button className="auth-btn primary" onClick={() => setShowAuthModal(true)}>
              {isConfigured ? 'Sign In' : 'Guest Mode'}
            </button>
          )}
        </div>
      </header>
      
      {/* Mobile Nav for Console */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-nav-brand">
                <img src="/logo.png" alt="SerenityAI" className="mobile-logo" />
                <span>SerenityAI</span>
              </div>
              <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>×</button>
            </div>
            <div className="mobile-nav-links">
              <button 
                className={activeTab === "log" ? "active" : ""} 
                onClick={() => { setActiveTab("log"); setMobileMenuOpen(false); }}
              >
                📝 Check-in
              </button>
              <button 
                className={activeTab === "journal" ? "active" : ""} 
                onClick={() => { setActiveTab("journal"); setMobileMenuOpen(false); }}
              >
                📓 Journal
              </button>
              <button 
                className={activeTab === "insights" ? "active" : ""} 
                onClick={() => { setActiveTab("insights"); setMobileMenuOpen(false); }}
              >
                📊 Insights
              </button>
              <button 
                className={activeTab === "planner" ? "active" : ""} 
                onClick={() => { setActiveTab("planner"); setMobileMenuOpen(false); }}
              >
                🗓️ Planner
              </button>
              <button 
                className={activeTab === "games" ? "active" : ""} 
                onClick={() => { setActiveTab("games"); setMobileMenuOpen(false); }}
              >
                🎮 Games
              </button>
              
              {/* Contextual Back Button */}
              <button 
                className="back-btn" 
                onClick={() => { setCurrentPage("landing"); setMobileMenuOpen(false); }}
              >
                ⬅️ Back to Home
              </button>
            </div>
            <div className="mobile-auth">
              {user ? (
                <>
                  <span className="user-email">{user.email}</span>
                  <button className="auth-btn-mobile" onClick={() => { signOut(); setMobileMenuOpen(false); }}>Sign Out</button>
                </>
              ) : (
                <button className="auth-btn-mobile primary" onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}>
                  {isConfigured ? 'Sign In' : 'Continue as Guest'}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Content container with proper spacing */}
      <div className="console-content">
        {/* Loading state for initial data load */}
        {user && !dataLoaded && (
          <div className="data-loading" role="status" aria-live="polite">
            <div className="loading-spinner" />
            <p>Loading your wellness data...</p>
          </div>
        )}

        <main className="app-content" role="main" aria-label={`${activeTab} section`}>
          {activeTab === "log" && (
            <div className="checkin-layout">
              <MoodWheel
                userContext={userContext}
                onMoodSelect={setSelectedMood}
                onMoodLogged={handleMoodLogged}
                moodHistory={moodHistory}
                onNavigateToJournal={navigateToJournal}
              />
              <div className="checkin-sidebar">
                <PointsDisplay />
                <TodayWidget onNavigateToPlanner={() => setActiveTab('planner')} />
                <TipsPanel userContext={userContext} currentMood={selectedMood} />
              </div>
            </div>
          )}

          {activeTab === "journal" && (
            <JournalEntry 
              userContext={userContext} 
              currentMood={selectedMood}
              entries={journalEntries}
              onEntrySaved={handleJournalSaved}
            />
          )}

          {activeTab === "insights" && (
            <div className="insights-layout">
              <div className="insights-grid">
                <EmotionGraph userContext={userContext} moodHistory={moodHistory} />
                <InsightsTimeline userContext={userContext} moodHistory={moodHistory} />
              </div>
              <ProgressDashboard />
            </div>
          )}

          {activeTab === "planner" && (
            <MindPlanner userContext={userContext} />
          )}

          {activeTab === "games" && (
            <TriviaGames />
          )}
        </main>
      </div>

      {/* Minimal footer for console */}
      <footer className={`console-footer ${footerClass}`}>
        <div className="console-footer-content">
          <p className="console-footer-text">© 2025 SerenityAI</p>
          <div className="console-footer-links">
            <a href="https://github.com/rayklanderman/Serenity-AI" target="_blank" rel="noopener noreferrer" aria-label="View source code">
              <span aria-hidden="true">⚡</span> GitHub
            </a>
          </div>
        </div>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;