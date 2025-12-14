import React, { useState } from "react";
import MoodWheel from "./components/MoodWheel";
import JournalEntry from "./components/JournalEntry";
import EmotionGraph from "./components/EmotionGraph";
import InsightsTimeline from "./components/InsightsTimeline";
import TipsPanel from "./components/TipsPanel";
import About from "./components/About";
import Footer from "./components/Footer";
import type { UserContext, Emotion } from "./types";
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"log" | "journal" | "insights" | "about">("log");
  const [userContext] = useState<UserContext>({ userId: "demo-user-1" });
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryData[]>([]);

  const handleMoodLogged = (entry: MoodEntry) => {
    setMoodHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleJournalSaved = (entry: JournalEntryData) => {
    setJournalEntries((prev) => [entry, ...prev].slice(0, 50));
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <header className="app-header">
          <div className="logo-container">
            <img src="/logo.png" alt="SerenityAI" className="logo" />
            <h1>SerenityAI</h1>
          </div>
          <nav>
            <button
              className={activeTab === "log" ? "active" : ""}
              onClick={() => setActiveTab("log")}
            >
              🏠 Check-in
            </button>
            <button
              className={activeTab === "journal" ? "active" : ""}
              onClick={() => setActiveTab("journal")}
            >
              📝 Journal {journalEntries.length > 0 && <span className="badge">{journalEntries.length}</span>}
            </button>
            <button
              className={activeTab === "insights" ? "active" : ""}
              onClick={() => setActiveTab("insights")}
            >
              📊 Insights
            </button>
            <button
              className={activeTab === "about" ? "active" : ""}
              onClick={() => setActiveTab("about")}
            >
              ℹ️ About
            </button>
          </nav>
        </header>

        <main className="app-content">
          {activeTab === "log" && (
            <div className="dashboard-grid">
              <MoodWheel
                userContext={userContext}
                onMoodSelect={setSelectedMood}
                onMoodLogged={handleMoodLogged}
                moodHistory={moodHistory}
              />
              <TipsPanel userContext={userContext} currentMood={selectedMood} />
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
            <div className="insights-grid">
              <EmotionGraph userContext={userContext} moodHistory={moodHistory} />
              <InsightsTimeline userContext={userContext} moodHistory={moodHistory} />
            </div>
          )}

          {activeTab === "about" && <About />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
