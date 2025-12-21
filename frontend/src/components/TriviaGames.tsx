import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStorage } from '../hooks/usePlannerStorage';
import { useGamification } from '../hooks/useGamification';
import { Brain, Zap, Trophy, Star, RefreshCw, ArrowRight, Lock } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  fact: string;
  difficulty: Difficulty;
}

// Expanded question bank with difficulty levels
const ALL_QUESTIONS: Question[] = [
  // EASY Questions
  {
    id: 1,
    question: "What hormone is often called the 'love hormone'?",
    options: ["Cortisol", "Oxytocin", "Adrenaline", "Insulin"],
    correctIndex: 1,
    fact: "Oxytocin promotes bonding, trust, and reduces anxiety. A 20-second hug triggers its release!",
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "Which color is most associated with calmness?",
    options: ["Red", "Yellow", "Blue", "Orange"],
    correctIndex: 2,
    fact: "Blue is universally calming and can lower blood pressure and heart rate.",
    difficulty: 'easy'
  },
  {
    id: 3,
    question: "How long does it take for deep breathing to start calming you?",
    options: ["30 seconds", "5 minutes", "15 minutes", "1 hour"],
    correctIndex: 0,
    fact: "Just 30 seconds of deep belly breathing activates your parasympathetic 'rest and digest' mode.",
    difficulty: 'easy'
  },
  {
    id: 4,
    question: "What is the recommended sleep for adults?",
    options: ["4-5 hours", "6-7 hours", "7-9 hours", "10+ hours"],
    correctIndex: 2,
    fact: "7-9 hours of quality sleep is essential for optimal mental health.",
    difficulty: 'easy'
  },
  {
    id: 5,
    question: "Which activity helps reduce stress hormones?",
    options: ["Watching TV", "Social media", "Walking in nature", "Online shopping"],
    correctIndex: 2,
    fact: "Spending 20 minutes in nature significantly lowers cortisol levels - 'forest bathing'!",
    difficulty: 'easy'
  },
  {
    id: 6,
    question: "What simple practice can increase happiness by 25%?",
    options: ["Gratitude journaling", "Speed reading", "Multitasking", "News watching"],
    correctIndex: 0,
    fact: "Writing 3 gratitudes daily for 21 days can increase happiness levels for up to 6 months!",
    difficulty: 'easy'
  },
  {
    id: 7,
    question: "Which drink can help improve mood?",
    options: ["Energy drinks", "Green tea", "Soda", "Alcohol"],
    correctIndex: 1,
    fact: "Green tea contains L-theanine, which promotes calm alertness without jitters.",
    difficulty: 'easy'
  },
  {
    id: 8,
    question: "What simple action can boost your mood instantly?",
    options: ["Frowning", "Crossing arms", "Smiling", "Looking down"],
    correctIndex: 2,
    fact: "Smiling, even forced, triggers endorphin release and reduces stress hormones!",
    difficulty: 'easy'
  },

  // MEDIUM Questions
  {
    id: 9,
    question: "How many minutes of daily meditation shows brain changes?",
    options: ["60 minutes", "30 minutes", "10 minutes", "5 minutes"],
    correctIndex: 2,
    fact: "Just 10 minutes of daily meditation for 8 weeks can change brain structure!",
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "What percentage of your thoughts are repetitive?",
    options: ["25%", "50%", "75%", "95%"],
    correctIndex: 3,
    fact: "Up to 95% of our thoughts are repetitive! Mindfulness helps break this cycle.",
    difficulty: 'medium'
  },
  {
    id: 11,
    question: "What is 'emotional regulation' best described as?",
    options: ["Suppressing emotions", "Managing emotional responses", "Ignoring feelings", "Always being happy"],
    correctIndex: 1,
    fact: "Emotional regulation is about understanding and managing your emotional responses, not suppression.",
    difficulty: 'medium'
  },
  {
    id: 12,
    question: "What part of the brain controls the 'fight or flight' response?",
    options: ["Prefrontal cortex", "Amygdala", "Hippocampus", "Cerebellum"],
    correctIndex: 1,
    fact: "The amygdala processes emotions and triggers stress responses. Meditation helps regulate it.",
    difficulty: 'medium'
  },
  {
    id: 13,
    question: "How much does regular exercise reduce depression risk?",
    options: ["10%", "26%", "50%", "75%"],
    correctIndex: 1,
    fact: "Regular exercise reduces depression risk by 26%. Even walking counts!",
    difficulty: 'medium'
  },
  {
    id: 14,
    question: "What is 'neuroplasticity'?",
    options: ["Brain surgery", "Brain's ability to change", "Memory loss", "Brain disease"],
    correctIndex: 1,
    fact: "Neuroplasticity means your brain can form new connections at any age through learning and experience.",
    difficulty: 'medium'
  },
  {
    id: 15,
    question: "What breathing technique is used in Navy SEAL training?",
    options: ["Box breathing", "Mouth breathing", "Fast breathing", "No technique"],
    correctIndex: 0,
    fact: "Box breathing (4-4-4-4) is used by Navy SEALs to stay calm under extreme pressure.",
    difficulty: 'medium'
  },
  {
    id: 16,
    question: "How many habits can you realistically form at once?",
    options: ["5-7", "1-2", "10+", "Unlimited"],
    correctIndex: 1,
    fact: "Focus on 1-2 habits at a time. Trying too many leads to failure in all.",
    difficulty: 'medium'
  },

  // HARD Questions
  {
    id: 17,
    question: "What is the 'Default Mode Network' in the brain?",
    options: ["Sleep mode", "Mind wandering network", "Pain processing", "Vision processing"],
    correctIndex: 1,
    fact: "The DMN activates during daydreaming and self-reflection. Meditation reduces its overactivity.",
    difficulty: 'hard'
  },
  {
    id: 18,
    question: "What neurotransmitter is most associated with motivation?",
    options: ["Serotonin", "Dopamine", "GABA", "Acetylcholine"],
    correctIndex: 1,
    fact: "Dopamine drives motivation and reward-seeking behavior. It's released in anticipation of rewards.",
    difficulty: 'hard'
  },
  {
    id: 19,
    question: "What is 'interoception'?",
    options: ["Seeing colors", "Sensing internal body states", "Hearing sounds", "Tasting food"],
    correctIndex: 1,
    fact: "Interoception is sensing your heartbeat, hunger, etc. Better interoception = better emotional awareness.",
    difficulty: 'hard'
  },
  {
    id: 20,
    question: "What does the vagus nerve regulate?",
    options: ["Only digestion", "Only heart rate", "Parasympathetic system", "Muscle movement"],
    correctIndex: 2,
    fact: "The vagus nerve controls the 'rest and digest' system. Stimulating it reduces anxiety.",
    difficulty: 'hard'
  },
  {
    id: 21,
    question: "What is 'cognitive reframing'?",
    options: ["Ignoring problems", "Changing thought perspective", "Positive thinking only", "Memory technique"],
    correctIndex: 1,
    fact: "Cognitive reframing means viewing situations from different angles to reduce negative emotions.",
    difficulty: 'hard'
  },
  {
    id: 22,
    question: "How long does it typically take to form a new habit?",
    options: ["7 days", "21 days", "66 days", "1 year"],
    correctIndex: 2,
    fact: "Research shows habits take an average of 66 days to form, not the popular '21 days' myth.",
    difficulty: 'hard'
  },
  {
    id: 23,
    question: "What is 'allostatic load'?",
    options: ["Exercise fatigue", "Cumulative stress burden", "Sleep debt", "Hunger signal"],
    correctIndex: 1,
    fact: "Allostatic load is the wear and tear on the body from chronic stress. Recovery is essential.",
    difficulty: 'hard'
  },
  {
    id: 24,
    question: "What brainwave state is associated with deep meditation?",
    options: ["Beta", "Gamma", "Theta", "Delta"],
    correctIndex: 2,
    fact: "Theta waves (4-8 Hz) occur during deep meditation, creativity, and light sleep.",
    difficulty: 'hard'
  }
];

const QUESTIONS_PER_GAME = 8;

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TriviaGames: React.FC = () => {
  const { saveScore, getHighScore } = useGameStorage();
  const { awardPoints } = useGamification();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [highScores, setHighScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null
  });
  const [unlockedLevels, setUnlockedLevels] = useState<Record<Difficulty, boolean>>({
    easy: true,
    medium: false,
    hard: false
  });

  // Load high scores and unlocked levels on mount
  useEffect(() => {
    const loadData = async () => {
      const easyScore = await getHighScore('trivia_easy');
      const mediumScore = await getHighScore('trivia_medium');
      const hardScore = await getHighScore('trivia_hard');
      
      const scores = {
        easy: easyScore?.score ?? null,
        medium: mediumScore?.score ?? null,
        hard: hardScore?.score ?? null
      };
      
      // Also check localStorage for guest user scores
      const localScores = localStorage.getItem('serenity_game_scores');
      if (localScores) {
        const parsed = JSON.parse(localScores);
        if (parsed.easy && (!scores.easy || parsed.easy > scores.easy)) scores.easy = parsed.easy;
        if (parsed.medium && (!scores.medium || parsed.medium > scores.medium)) scores.medium = parsed.medium;
        if (parsed.hard && (!scores.hard || parsed.hard > scores.hard)) scores.hard = parsed.hard;
      }
      
      setHighScores(scores);
      
      // Unlock levels based on performance (70%+ unlocks next level)
      const unlocked = {
        easy: true,
        medium: (scores.easy ?? 0) >= Math.ceil(QUESTIONS_PER_GAME * 0.7),
        hard: (scores.medium ?? 0) >= Math.ceil(QUESTIONS_PER_GAME * 0.7)
      };
      setUnlockedLevels(unlocked);
    };
    loadData();
  }, [getHighScore]);

  // Initialize game with shuffled questions for selected difficulty
  const startGame = useCallback((level: Difficulty) => {
    const levelQuestions = ALL_QUESTIONS.filter(q => q.difficulty === level);
    const shuffled = shuffleArray(levelQuestions);
    const gameQuestions = shuffled.slice(0, QUESTIONS_PER_GAME);
    
    // Also shuffle the options for each question
    const shuffledWithOptions = gameQuestions.map(q => {
      const optionIndices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(optionIndices);
      const newCorrectIndex = shuffledIndices.indexOf(q.correctIndex);
      return {
        ...q,
        options: shuffledIndices.map(i => q.options[i]),
        correctIndex: newCorrectIndex
      };
    });
    
    setQuestions(shuffledWithOptions);
    setDifficulty(level);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
  }, []);

  const question = questions[currentQuestion];

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correctIndex) {
      setScore(prev => prev + 1);
      // Award points for correct answer
      await awardPoints('TRIVIA_CORRECT');
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
      const finalScore = score + (selectedAnswer === question.correctIndex ? 1 : 0);
      
      // Save score
      if (difficulty) {
        await saveScore(`trivia_${difficulty}`, finalScore, QUESTIONS_PER_GAME);
        
        // Update high score
        if (!highScores[difficulty] || finalScore > highScores[difficulty]!) {
          setHighScores(prev => ({ ...prev, [difficulty]: finalScore }));
          
          // Save to localStorage for guest users
          const localScores = JSON.parse(localStorage.getItem('serenity_game_scores') || '{}');
          localScores[difficulty] = finalScore;
          localStorage.setItem('serenity_game_scores', JSON.stringify(localScores));
          
          // Check if next level should be unlocked
          if (finalScore >= Math.ceil(QUESTIONS_PER_GAME * 0.7)) {
            if (difficulty === 'easy') {
              setUnlockedLevels(prev => ({ ...prev, medium: true }));
            } else if (difficulty === 'medium') {
              setUnlockedLevels(prev => ({ ...prev, hard: true }));
            }
          }
        }
      }
    }
  };

  const backToLevels = () => {
    setDifficulty(null);
    setGameComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / QUESTIONS_PER_GAME) * 100;
    if (percentage === 100) return "🌟 Perfect! You're a mindfulness master!";
    if (percentage >= 87.5) return "🎉 Outstanding! Almost perfect!";
    if (percentage >= 70) return "🔓 Great job! Next level unlocked!";
    if (percentage >= 50) return "👍 Good effort! Keep practicing!";
    return "💪 Keep exploring! Every fact helps!";
  };

  const getDifficultyColor = (level: Difficulty) => {
    switch (level) {
      case 'easy': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      case 'hard': return 'var(--error)';
    }
  };

  const getDifficultyIcon = (level: Difficulty) => {
    switch (level) {
      case 'easy': return <Star size={24} />;
      case 'medium': return <Zap size={24} />;
      case 'hard': return <Brain size={24} />;
    }
  };

  // Level Selection Screen
  if (!difficulty) {
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

        <div className="level-selection">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <motion.button
              key={level}
              className={`level-card ${level} ${!unlockedLevels[level] ? 'locked' : ''}`}
              onClick={() => unlockedLevels[level] && startGame(level)}
              disabled={!unlockedLevels[level]}
              whileHover={unlockedLevels[level] ? { scale: 1.02 } : {}}
              whileTap={unlockedLevels[level] ? { scale: 0.98 } : {}}
            >
              <div className="level-icon" style={{ color: getDifficultyColor(level) }}>
                {unlockedLevels[level] ? getDifficultyIcon(level) : <Lock size={24} />}
              </div>
              <div className="level-info">
                <span className="level-name">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                {highScores[level] !== null && (
                  <span className="level-score">Best: {highScores[level]}/{QUESTIONS_PER_GAME}</span>
                )}
                {!unlockedLevels[level] && (
                  <span className="level-locked">Score 70%+ on previous level</span>
                )}
              </div>
              <ArrowRight size={20} className="level-arrow" />
            </motion.button>
          ))}
        </div>

        <div className="game-stats">
          <div className="stat">
            <Trophy size={16} />
            <span>Total Questions: {ALL_QUESTIONS.length}</span>
          </div>
          <div className="stat">
            <RefreshCw size={16} />
            <span>Questions shuffle every game!</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    const finalScore = score;
    const percentage = (finalScore / QUESTIONS_PER_GAME) * 100;
    const unlockedNext = percentage >= 70 && difficulty !== 'hard';

    return (
      <motion.div 
        className="card trivia-games"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="game-complete"
        >
          <div className="complete-emoji">🎊</div>
          <h3>Quiz Complete!</h3>
          <div className="complete-score" style={{ color: getDifficultyColor(difficulty) }}>
            {finalScore} / {QUESTIONS_PER_GAME}
          </div>
          <p className="complete-message">{getScoreMessage()}</p>
          
          {unlockedNext && (
            <div className="unlock-banner">
              🔓 Next difficulty unlocked!
            </div>
          )}
          
          <div className="complete-actions">
            <button className="secondary-btn" onClick={backToLevels}>
              ← Back to Levels
            </button>
            <button className="primary-btn" onClick={() => startGame(difficulty)}>
              🔄 Play Again
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Active Game Screen
  return (
    <motion.div 
      className="card trivia-games"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="trivia-header">
        <div className="header-left">
          <button className="back-btn" onClick={backToLevels}>←</button>
          <span className="difficulty-badge" style={{ background: getDifficultyColor(difficulty) }}>
            {difficulty.toUpperCase()}
          </span>
        </div>
        <div className="score-display">
          <span>{score}</span> / <span>{currentQuestion + (showResult ? 1 : 0)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="trivia-progress">
        {questions.map((_, i) => (
          <div 
            key={i}
            className={`progress-dot ${i < currentQuestion ? 'done' : i === currentQuestion ? 'current' : ''}`}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="trivia-question-card"
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="question-number">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="question-text">{question?.question}</h3>
        </motion.div>
      </AnimatePresence>

      {/* Answer Options */}
      <div className="answer-options">
        {question?.options.map((option, i) => (
          <motion.button
            key={`${currentQuestion}-${i}`}
            className={`answer-btn ${
              showResult && i === question.correctIndex ? 'correct' : ''
            } ${
              showResult && selectedAnswer === i && i !== question.correctIndex ? 'wrong' : ''
            }`}
            onClick={() => handleAnswer(i)}
            disabled={showResult}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {/* Result & Fact */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="result-section"
          >
            <div className={`result-card ${selectedAnswer === question?.correctIndex ? 'correct' : 'wrong'}`}>
              <p className="result-title">
                {selectedAnswer === question?.correctIndex ? '✅ Correct!' : '❌ Not quite!'}
              </p>
              <p className="result-fact">💡 {question?.fact}</p>
            </div>
            
            <button className="primary-btn next-btn" onClick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TriviaGames;
