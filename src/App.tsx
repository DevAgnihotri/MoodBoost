import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BarChart3, Home, Users, Brain, Music, Shield, Sparkles, Gamepad2 } from 'lucide-react';
import { MoodSelector } from './components/MoodSelector';
import { GameSelector } from './components/GameSelector';
import { BreathingGame } from './components/games/BreathingGame';
import { BubblePopGame } from './components/games/BubblePopGame';
import { DrawingPad } from './components/games/DrawingPad';
import { AngerSmashGame } from './components/games/AngerSmashGame';
import { ColorTherapyGame } from './components/games/ColorTherapyGame';
import { RhythmTapGame } from './components/games/RhythmTapGame';
import { GratitudeTreeGame } from './components/games/GratitudeTreeGame';
import { JoyBurstGame } from './components/games/JoyBurstGame';
import { MeditationGardenGame } from './components/games/MeditationGardenGame';
import { StressSqueezeGame } from './components/games/StressSqueezeGame';
import { ZenGardenGame } from './components/games/ZenGardenGame';
import { WordFlowGame } from './components/games/WordFlowGame';
import { MindfulMazeGame } from './components/games/MindfulMazeGame';
import { VirtualHugGame } from './components/games/VirtualHugGame';
import { DanceTherapyGame } from './components/games/DanceTherapyGame';
import { KindnessCardsGame } from './components/games/KindnessCardsGame';
import { EnergyBounceGame } from './components/games/EnergyBounceGame';
import { SmileMirrorGame } from './components/games/SmileMirrorGame';
import { SessionComplete } from './components/SessionComplete';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AIWellnessCoach } from './components/AIWellnessCoach';
import { CommunityFeatures } from './components/CommunityFeatures';
import { SocialConnection } from './components/SocialConnection';
import { AudioControls } from './components/AudioControls';
import { PrivacySettings } from './components/PrivacySettings';
import { WellnessMascot } from './components/WellnessMascot';
import { MoodAnalysisPanel } from './components/MoodAnalysisPanel';
import { MoodInputInterface } from './components/MoodInputInterface';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Mood, Game, GameSession, UserProgress } from './types';

type AppState = 'home' | 'mood-input' | 'mood-select' | 'game-select' | 'playing' | 'complete';

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'community'>('home');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showSocialConnection, setShowSocialConnection] = useState(false);  const [showAudioControls, setShowAudioControls] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showMascot, setShowMascot] = useState(true);
  const [showMoodAnalysis, setShowMoodAnalysis] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  
  const [sessions, setSessions] = useLocalStorage<GameSession[]>('moodboost-sessions', []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('moodboost-progress', {
    totalSessions: 0,
    favoriteGame: '',
    averageStressReduction: 0,
    streakDays: 0,
    achievements: []
  });

  const sounds = useSoundEffects();

  // Calculate user level based on total sessions and achievements
  const calculateUserLevel = () => {
    const sessionLevel = Math.floor(userProgress.totalSessions / 5) + 1;
    const achievementBonus = userProgress.achievements.length;
    return Math.min(sessionLevel + achievementBonus, 10);
  };

  const userLevel = calculateUserLevel();

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setAppState('game-select');
    sounds.success();
  };

  const handleMoodAnalyzed = (mood: Mood) => {
    setSelectedMood(mood);
    setAppState('game-select');
    sounds.success();
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setAppState('playing');
    sounds.tap();
  };

  const handleGameComplete = (score: number) => {
    setCurrentScore(score);
    
    if (selectedMood && selectedGame) {
      const newSession: GameSession = {
        id: Date.now().toString(),
        mood: selectedMood,
        gameType: selectedGame.name,
        duration: 5, // Default duration
        score,
        timestamp: new Date(),
        effectiveness: score
      };

      setSessions(prev => [...prev, newSession]);
      setUserProgress(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        favoriteGame: selectedGame.name,
        averageStressReduction: Math.round((prev.averageStressReduction + score) / 2)
      }));

      // Show AI coach if stress remains high
      if (selectedMood.intensity >= 7 && score < 60) {
        setTimeout(() => setShowAICoach(true), 2000);
      }
    }
    
    setAppState('complete');
    sounds.achievement();
  };

  const resetToHome = () => {
    setSelectedMood(null);
    setSelectedGame(null);
    setCurrentScore(0);
    setAppState('home');
    setActiveTab('home');
    sounds.tap();
  };

  const handleChallengeComplete = (challengeId: string) => {
    setUserProgress(prev => ({
      ...prev,
      achievements: [...prev.achievements, challengeId]
    }));
  };
  const getCurrentStressLevel = () => {
    if (!selectedMood) return 3;
    return selectedMood.intensity;
  };

  const startActivities = () => {
    setShowActivitiesModal(true);
    sounds.notification();
  };

  const selectActivityDirectly = (gameId: string) => {
    // Create a default mood for direct activity access
    const defaultMood: Mood = {
      id: 'balanced',
      name: 'balanced',
      color: '#6366f1',
      gradient: 'from-indigo-400 to-purple-500',
      icon: '😌',
      intensity: 5,
      description: 'Feeling balanced and ready for wellness activities'
    };
    
    // Find the game by ID
    const games = [
      { id: 'breathing', name: 'Breathing Exercise', category: 'relaxation' },
      { id: 'bubble-pop', name: 'Bubble Pop', category: 'stress-relief' },
      { id: 'draw-pad', name: 'Drawing Pad', category: 'creative' },
      { id: 'anger-smash', name: 'Anger Smash', category: 'stress-relief' },
      { id: 'color-therapy', name: 'Color Therapy', category: 'relaxation' },
      { id: 'rhythm-tap', name: 'Rhythm Tap', category: 'energy' },
      { id: 'gratitude-tree', name: 'Gratitude Tree', category: 'mindfulness' },
      { id: 'joy-burst', name: 'Joy Burst', category: 'energy' },
      { id: 'meditation-garden', name: 'Meditation Garden', category: 'mindfulness' },
      { id: 'stress-squeeze', name: 'Stress Squeeze', category: 'stress-relief' },
      { id: 'zen-garden', name: 'Zen Garden', category: 'relaxation' },
      { id: 'word-flow', name: 'Word Flow', category: 'mindfulness' },
      { id: 'mindful-maze', name: 'Mindful Maze', category: 'mindfulness' },
      { id: 'virtual-hug', name: 'Virtual Hug', category: 'comfort' },
      { id: 'dance-therapy', name: 'Dance Therapy', category: 'energy' },
      { id: 'kindness-cards', name: 'Kindness Cards', category: 'social' },
      { id: 'energy-bounce', name: 'Energy Bounce', category: 'energy' },
      { id: 'smile-mirror', name: 'Smile Mirror', category: 'joy' }
    ];
    
    const selectedGameData = games.find(g => g.id === gameId);
    if (selectedGameData) {
      setSelectedMood(defaultMood);
      setSelectedGame(selectedGameData as Game);
      setShowActivitiesModal(false);
      setAppState('playing');
      sounds.tap();
    }
  };
  const renderGame = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'breathing':
        return <BreathingGame onComplete={handleGameComplete} />;
      case 'bubble-pop':
        return <BubblePopGame onComplete={handleGameComplete} />;
      case 'draw-pad':
        return <DrawingPad onComplete={handleGameComplete} />;
      case 'anger-smash':
        return <AngerSmashGame onComplete={handleGameComplete} />;
      case 'color-therapy':
        return <ColorTherapyGame onComplete={handleGameComplete} />;
      case 'rhythm-tap':
        return <RhythmTapGame onComplete={handleGameComplete} />;
      case 'gratitude-tree':
        return <GratitudeTreeGame onComplete={handleGameComplete} />;
      case 'joy-burst':
        return <JoyBurstGame onComplete={handleGameComplete} />;
      case 'meditation-garden':
        return <MeditationGardenGame onComplete={handleGameComplete} />;
      case 'stress-squeeze':
        return <StressSqueezeGame onComplete={handleGameComplete} />;
      case 'zen-garden':
        return <ZenGardenGame onComplete={handleGameComplete} />;
      case 'word-flow':
        return <WordFlowGame onComplete={handleGameComplete} />;
      case 'mindful-maze':
        return <MindfulMazeGame onComplete={handleGameComplete} />;
      case 'virtual-hug':
        return <VirtualHugGame onComplete={handleGameComplete} />;
      case 'dance-therapy':
        return <DanceTherapyGame onComplete={handleGameComplete} />;
      case 'kindness-cards':
        return <KindnessCardsGame onComplete={handleGameComplete} />;
      case 'energy-bounce':
        return <EnergyBounceGame onComplete={handleGameComplete} />;
      case 'smile-mirror':
        return <SmileMirrorGame onComplete={handleGameComplete} />;
      default:
        return <BreathingGame onComplete={handleGameComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Single Page Application - No Navigation Bar */}
      
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {/* Home Page with Internal Tabs */}
          {appState === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen p-4 sm:p-6"
            >
              {/* Header Section */}
              <div className="text-center mb-8">
                <motion.div
                  className="flex items-center justify-center space-x-2 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="w-8 h-8 lg:w-12 lg:h-12 text-pink-500" />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                    MoodBoost
                  </h1>
                </motion.div>
                <p className="text-lg text-gray-600 mb-6">
                  Your AI-powered stress relief companion
                </p>
              </div>

              {/* Main Action Cards */}
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* AI Coach Card */}
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer"
                  onClick={() => setShowAICoach(true)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-8 h-8" />
                    <h3 className="text-xl font-bold">AI Coach</h3>
                  </div>
                  <p className="text-purple-100 mb-4">
                    Get personalized wellness guidance and mental health support from your AI companion
                  </p>
                  <div className="bg-white/20 rounded-full px-4 py-2 inline-block">
                    <span className="text-sm font-medium">Start Session</span>
                  </div>
                </motion.div>

                {/* Mood AI Card */}
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer"
                  onClick={() => setShowMoodAnalysis(true)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Mood AI</h3>
                  </div>
                  <p className="text-pink-100 mb-4">
                    Advanced mood detection and sentiment analysis to understand your emotional state
                  </p>
                  <div className="bg-white/20 rounded-full px-4 py-2 inline-block">
                    <span className="text-sm font-medium">Analyze Mood</span>
                  </div>
                </motion.div>
              </div>

              {/* Activities Button */}
              <div className="max-w-4xl mx-auto mb-8">
                <motion.button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg"
                  onClick={startActivities}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Gamepad2 className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Wellness Activities</h3>
                  </div>
                  <p className="text-emerald-100">
                    Explore interactive games and exercises designed to reduce stress and boost your mood
                  </p>
                </motion.button>
              </div>

              {/* Internal Tabs Section */}
              <div className="max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
                    <div className="flex space-x-1">
                      <motion.button
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeTab === 'home' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveTab('home')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Home className="w-4 h-4 mr-2 inline" />
                        Dashboard
                      </motion.button>
                      
                      <motion.button
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeTab === 'progress' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveTab('progress')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <BarChart3 className="w-4 h-4 mr-2 inline" />
                        Progress
                      </motion.button>
                      
                      <motion.button
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeTab === 'community' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveTab('community')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Users className="w-4 h-4 mr-2 inline" />
                        Community
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                >
                  {activeTab === 'home' && (
                    <div className="text-center">
                      <motion.div
                        className="text-6xl sm:text-8xl mb-6"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        💝
                      </motion.div>
                      
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                        Welcome to Your Wellness Dashboard
                      </h2>
                      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Track your mental wellness journey with AI-powered insights, personalized recommendations, and interactive stress-relief activities.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <FeatureCard
                          icon="🎯"
                          title="AI Mood Detection"
                          description="Advanced sentiment analysis automatically detects your emotional state"
                        />
                        <FeatureCard
                          icon="🤖"
                          title="Smart Recommendations"
                          description="Personalized activity suggestions based on your mood and progress"
                        />
                        <FeatureCard
                          icon="🐾"
                          title="Wellness Buddy"
                          description="Your cute AI companion that grows with your wellness journey"
                        />
                      </div>

                      {/* Support & Settings Section */}
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Support & Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Social Connection Card */}
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-xl shadow-lg cursor-pointer"
                            onClick={() => setShowSocialConnection(true)}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <Users className="w-8 h-8 mb-3" />
                              <h4 className="font-semibold mb-2">Support Network</h4>
                              <p className="text-xs text-blue-100">Connect with trusted contacts</p>
                            </div>
                          </motion.div>

                          {/* Audio Controls Card */}
                          <motion.div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg cursor-pointer"
                            onClick={() => setShowAudioControls(true)}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <Music className="w-8 h-8 mb-3" />
                              <h4 className="font-semibold mb-2">Audio Controls</h4>
                              <p className="text-xs text-green-100">Manage sounds & music</p>
                            </div>
                          </motion.div>

                          {/* Privacy Settings Card */}
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-pointer"
                            onClick={() => setShowPrivacySettings(true)}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <Shield className="w-8 h-8 mb-3" />
                              <h4 className="font-semibold mb-2">Privacy & Control</h4>
                              <p className="text-xs text-purple-100">Manage data & settings</p>
                            </div>
                          </motion.div>

                          {/* Wellness Mascot Card */}
                          <motion.div
                            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-4 rounded-xl shadow-lg cursor-pointer"
                            onClick={() => setShowMascot(!showMascot)}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <Heart className="w-8 h-8 mb-3" />
                              <h4 className="font-semibold mb-2">Wellness Buddy</h4>
                              <p className="text-xs text-orange-100">
                                {showMascot ? 'Hide buddy' : 'Show buddy'}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'progress' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Progress</h2>
                      <ProgressDashboard sessions={sessions} progress={userProgress} />
                    </div>
                  )}
                  
                  {activeTab === 'community' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Community & Challenges</h2>
                      <CommunityFeatures 
                        sessions={sessions} 
                        progress={userProgress}
                        onChallengeComplete={handleChallengeComplete}
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}          {/* Existing Game States */}
          {appState === 'mood-input' && (
            <motion.div
              key="mood-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MoodInputInterface
                onMoodAnalyzed={handleMoodAnalyzed}
                onBack={resetToHome}
              />
            </motion.div>
          )}

          {appState === 'mood-select' && (
            <motion.div
              key="mood-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-4"
            >
              <MoodSelector 
                selectedMood={selectedMood} 
                onMoodSelect={handleMoodSelect} 
              />
            </motion.div>
          )}

          {appState === 'game-select' && selectedMood && (
            <motion.div
              key="game-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-4"
            >
              <GameSelector 
                selectedMood={selectedMood} 
                onGameSelect={handleGameSelect} 
              />
            </motion.div>
          )}

          {appState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGame()}
            </motion.div>
          )}

          {appState === 'complete' && selectedMood && selectedGame && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <SessionComplete
                mood={selectedMood}
                game={selectedGame}
                score={currentScore}
                onRestart={() => setAppState('playing')}
                onHome={resetToHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wellness Dog Mascot */}
      <WellnessMascot
        userLevel={userLevel}
        currentMood={selectedMood?.name}
        recentScore={currentScore}
        isVisible={showMascot}
        onToggle={() => setShowMascot(!showMascot)}
      />      {/* Modals and Overlays */}      {showActivitiesModal && (
        <ActivitiesModal
          onSelectActivity={selectActivityDirectly}
          onStartAIJourney={() => {
            setShowActivitiesModal(false);
            setAppState('mood-input');
            sounds.notification();
          }}
          onClose={() => setShowActivitiesModal(false)}
        />
      )}

      {showAICoach && (
        <AIWellnessCoach
          sessions={sessions}
          currentMood={selectedMood}
          lastScore={currentScore}
          onClose={() => setShowAICoach(false)}
        />
      )}

      {showSocialConnection && (
        <SocialConnection
          sessions={sessions}
          progress={userProgress}
          currentStressLevel={getCurrentStressLevel()}
          onClose={() => setShowSocialConnection(false)}
        />
      )}

      <AudioControls
        isVisible={showAudioControls}
        onToggleVisibility={() => setShowAudioControls(!showAudioControls)}
      />

      <PrivacySettings
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />

      <MoodAnalysisPanel
        isOpen={showMoodAnalysis}
        onClose={() => setShowMoodAnalysis(false)}
        currentMood={selectedMood?.name}
      />
    </div>
  );
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <motion.div
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const ActivitiesModal: React.FC<{
  onSelectActivity: (gameId: string) => void;
  onStartAIJourney: () => void;
  onClose: () => void;
}> = ({ onSelectActivity, onStartAIJourney, onClose }) => {
  const activities = [
    { id: 'breathing', name: 'Breathing Exercise', icon: '🌬️', category: 'Relaxation', description: 'Guided breathing for stress relief' },
    { id: 'bubble-pop', name: 'Bubble Pop', icon: '🫧', category: 'Stress Relief', description: 'Pop bubbles to release tension' },
    { id: 'draw-pad', name: 'Drawing Pad', icon: '🎨', category: 'Creative', description: 'Express yourself through art' },
    { id: 'anger-smash', name: 'Anger Smash', icon: '💥', category: 'Stress Relief', description: 'Release anger in a healthy way' },
    { id: 'color-therapy', name: 'Color Therapy', icon: '🌈', category: 'Relaxation', description: 'Calm your mind with colors' },
    { id: 'rhythm-tap', name: 'Rhythm Tap', icon: '🥁', category: 'Energy', description: 'Boost energy with rhythmic tapping' },
    { id: 'gratitude-tree', name: 'Gratitude Tree', icon: '🌳', category: 'Mindfulness', description: 'Practice gratitude and appreciation' },
    { id: 'joy-burst', name: 'Joy Burst', icon: '✨', category: 'Energy', description: 'Burst into happiness and joy' },
    { id: 'meditation-garden', name: 'Meditation Garden', icon: '🏡', category: 'Mindfulness', description: 'Find peace in a virtual garden' },
    { id: 'stress-squeeze', name: 'Stress Squeeze', icon: '🤏', category: 'Stress Relief', description: 'Squeeze away your stress' },
    { id: 'zen-garden', name: 'Zen Garden', icon: '🪨', category: 'Relaxation', description: 'Create patterns for inner peace' },
    { id: 'word-flow', name: 'Word Flow', icon: '📝', category: 'Mindfulness', description: 'Express thoughts through words' },
    { id: 'mindful-maze', name: 'Mindful Maze', icon: '🌀', category: 'Mindfulness', description: 'Navigate with mindful awareness' },
    { id: 'virtual-hug', name: 'Virtual Hug', icon: '🤗', category: 'Comfort', description: 'Feel warmth and connection' },
    { id: 'dance-therapy', name: 'Dance Therapy', icon: '💃', category: 'Energy', description: 'Move your body, lift your spirit' },
    { id: 'kindness-cards', name: 'Kindness Cards', icon: '💌', category: 'Social', description: 'Spread kindness and positivity' },
    { id: 'energy-bounce', name: 'Energy Bounce', icon: '⚡', category: 'Energy', description: 'Bounce your way to high energy' },
    { id: 'smile-mirror', name: 'Smile Mirror', icon: '😊', category: 'Joy', description: 'Practice smiling and happiness' }
  ];

  const categories = ['All', 'Relaxation', 'Stress Relief', 'Creative', 'Energy', 'Mindfulness', 'Comfort', 'Social', 'Joy'];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredActivities = activeCategory === 'All' 
    ? activities 
    : activities.filter(activity => activity.category === activeCategory);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Choose Your Wellness Activity</h3>
              <p className="text-gray-600">Select an activity directly or let AI guide your journey</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* AI Journey Button */}
          <motion.button
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-4"
            onClick={onStartAIJourney}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <Brain className="w-6 h-6" />
              <div>
                <h4 className="font-bold">AI-Guided Journey</h4>
                <p className="text-sm text-pink-100">Let AI analyze your mood and recommend the perfect activity</p>
              </div>
            </div>
          </motion.button>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <motion.button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActivities.map(activity => (
              <motion.div
                key={activity.id}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectActivity(activity.id)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{activity.icon}</div>
                  <h4 className="font-semibold text-gray-800 mb-1">{activity.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{activity.category}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default App;