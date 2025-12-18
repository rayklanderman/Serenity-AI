import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  fact: string;
}

const TRIVIA_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What hormone is often called the 'love hormone' and is released during hugs?",
    options: ["Cortisol", "Oxytocin", "Adrenaline", "Dopamine"],
    correctIndex: 1,
    fact: "Oxytocin promotes bonding, trust, and reduces anxiety. A 20-second hug triggers its release!"
  },
  {
    id: 2,
    question: "How many minutes of daily meditation can start showing brain changes?",
    options: ["60 minutes", "30 minutes", "10 minutes", "5 minutes"],
    correctIndex: 2,
    fact: "Just 10 minutes of daily meditation for 8 weeks can change brain structure, improving focus and reducing stress."
  },
  {
    id: 3,
    question: "Which activity has been shown to reduce cortisol (stress hormone) levels the most?",
    options: ["Watching TV", "Scrolling social media", "Walking in nature", "Online shopping"],
    correctIndex: 2,
    fact: "Spending 20 minutes in nature can significantly lower cortisol levels. It's called 'forest bathing' in Japan!"
  },
  {
    id: 4,
    question: "What percentage of your thoughts are estimated to be repetitive?",
    options: ["25%", "50%", "75%", "95%"],
    correctIndex: 3,
    fact: "Up to 95% of our thoughts are repetitive! Mindfulness helps break this cycle and create new neural pathways."
  },
  {
    id: 5,
    question: "How long does it take for deep breathing to start calming your nervous system?",
    options: ["30 seconds", "5 minutes", "15 minutes", "1 hour"],
    correctIndex: 0,
    fact: "Just 30 seconds of deep belly breathing activates your parasympathetic nervous system, the 'rest and digest' mode."
  },
  {
    id: 6,
    question: "What is the recommended amount of sleep for optimal mental health in adults?",
    options: ["4-5 hours", "6-7 hours", "7-9 hours", "10+ hours"],
    correctIndex: 2,
    fact: "7-9 hours of quality sleep is essential. Poor sleep is linked to increased anxiety and depression symptoms."
  },
  {
    id: 7,
    question: "Which color is most associated with calmness and reduced anxiety?",
    options: ["Red", "Yellow", "Blue", "Orange"],
    correctIndex: 2,
    fact: "Blue is universally calming and can lower blood pressure and heart rate. That's why many spas use blue tones!"
  },
  {
    id: 8,
    question: "What practice involves noting 3 good things daily and has proven mental health benefits?",
    options: ["Gratitude journaling", "Speed reading", "Multitasking", "News watching"],
    correctIndex: 0,
    fact: "Writing 3 gratitudes daily for 21 days can increase happiness levels by 25% for up to 6 months!"
  }
];

const TriviaGames: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const question = TRIVIA_QUESTIONS[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / TRIVIA_QUESTIONS.length) * 100;
    if (percentage === 100) return "🌟 Perfect! You're a mindfulness master!";
    if (percentage >= 75) return "🎉 Amazing! You know your wellness facts!";
    if (percentage >= 50) return "👍 Good job! Keep learning!";
    return "💪 Keep exploring! Every fact helps!";
  };

  return (
    <motion.div 
      className="card trivia-games"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="trivia-header">
        <h2>🧠 Mind Games</h2>
        <p className="subtitle">Test your wellness knowledge</p>
      </div>

      {!gameComplete ? (
        <>
          {/* Progress */}
          <div className="trivia-progress" style={{ 
            display: 'flex', 
            gap: '4px', 
            marginBottom: 'var(--space-4)' 
          }}>
            {TRIVIA_QUESTIONS.map((_, i) => (
              <div 
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: i < currentQuestion ? 'var(--success)' : 
                             i === currentQuestion ? 'var(--primary)' : 'var(--gray-200)'
                }}
              />
            ))}
          </div>

          {/* Question Card */}
          <motion.div 
            className="trivia-question-card"
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="question-number">
              Question {currentQuestion + 1} of {TRIVIA_QUESTIONS.length}
            </p>
            <h3 className="question-text">{question.question}</h3>
          </motion.div>

          {/* Answer Options */}
          <div className="answer-options">
            {question.options.map((option, i) => (
              <motion.button
                key={i}
                className={`answer-btn ${
                  showResult && i === question.correctIndex ? 'correct' : ''
                } ${
                  showResult && selectedAnswer === i && i !== question.correctIndex ? 'wrong' : ''
                }`}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {/* Result & Fact */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 'var(--space-4)' }}
            >
              <div style={{
                padding: 'var(--space-4)',
                background: selectedAnswer === question.correctIndex ? 'var(--success-light)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)'
              }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedAnswer === question.correctIndex ? '✅ Correct!' : '❌ Not quite!'}
                </p>
                <p style={{ margin: 'var(--space-2) 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                  💡 {question.fact}
                </p>
              </div>
              
              <button className="primary-btn" onClick={nextQuestion} style={{ width: '100%' }}>
                {currentQuestion < TRIVIA_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results 🎉'}
              </button>
            </motion.div>
          )}

          {/* Score Tracker */}
          <div className="trivia-score" style={{ marginTop: 'var(--space-4)' }}>
            <div className="score-item">
              <div className="score-value">{score}</div>
              <div className="score-label">Correct</div>
            </div>
            <div className="score-item">
              <div className="score-value">{currentQuestion + (showResult ? 1 : 0)}</div>
              <div className="score-label">Answered</div>
            </div>
          </div>
        </>
      ) : (
        /* Game Complete */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
            🎊
          </div>
          <h3 style={{ margin: '0 0 var(--space-2) 0' }}>Quiz Complete!</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {score} / {TRIVIA_QUESTIONS.length}
          </p>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
            {getScoreMessage()}
          </p>
          
          <button className="primary-btn" onClick={restartGame}>
            🔄 Play Again
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TriviaGames;
