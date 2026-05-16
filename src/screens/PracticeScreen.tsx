import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store/useAppStore';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Practice'>;
  route:      RouteProp<RootStackParamList, 'Practice'>;
};

interface Option {
  key:  'A' | 'B' | 'C' | 'D';
  text: string;
}

interface Question {
  question:    string;
  options:     Option[];
  correctKey:  'A' | 'B' | 'C' | 'D';
  explanation: string;
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

const API_BASE = 'https://drone-mooing-civil.ngrok-free.dev/ask-llm';

// ── Subject filter chips ──────────────────────────────────────────────────────
const SUBJECT_CHIPS = [
  { id: 'history',   hindi: 'इतिहास',        english: 'History'     },
  { id: 'geography', hindi: 'भूगोल',          english: 'Geography'   },
  { id: 'maths',     hindi: 'गणित',           english: 'Maths'       },
  { id: 'gk',        hindi: 'सामान्य ज्ञान',  english: 'GK'          },
  { id: 'science',   hindi: 'विज्ञान',        english: 'Science'     },
  { id: 'polity',    hindi: 'राजनीति',        english: 'Polity'      },
];

// ── Fallback questions if backend fails ──────────────────────────────────────
const FALLBACK: Record<string, Question[]> = {
  history: [
    {
      question:    'मुगल साम्राज्य की स्थापना किसने की थी?',
      options:     [{ key: 'A', text: 'अकबर' }, { key: 'B', text: 'बाबर' }, { key: 'C', text: 'हुमायूँ' }, { key: 'D', text: 'औरंगज़ेब' }],
      correctKey:  'B',
      explanation: 'बाबर ने 1526 में पानीपत की पहली लड़ाई जीतकर मुगल साम्राज्य की स्थापना की।',
    },
    {
      question:    '1857 की क्रांति का प्रारंभ कहाँ से हुआ?',
      options:     [{ key: 'A', text: 'दिल्ली' }, { key: 'B', text: 'लखनऊ' }, { key: 'C', text: 'मेरठ' }, { key: 'D', text: 'कानपुर' }],
      correctKey:  'C',
      explanation: '1857 की क्रांति 10 मई को मेरठ से शुरू हुई जब सैनिकों ने विद्रोह किया।',
    },
    {
      question:    'चंपारण सत्याग्रह किस वर्ष हुआ?',
      options:     [{ key: 'A', text: '1915' }, { key: 'B', text: '1917' }, { key: 'C', text: '1919' }, { key: 'D', text: '1920' }],
      correctKey:  'B',
      explanation: 'गांधीजी ने 1917 में बिहार के चंपारण में नील किसानों के लिए सत्याग्रह किया।',
    },
  ],
  gk: [
    {
      question:    'भारत का राष्ट्रीय पशु कौन सा है?',
      options:     [{ key: 'A', text: 'शेर' }, { key: 'B', text: 'हाथी' }, { key: 'C', text: 'बाघ' }, { key: 'D', text: 'मोर' }],
      correctKey:  'C',
      explanation: 'बाघ (Royal Bengal Tiger) भारत का राष्ट्रीय पशु है।',
    },
    {
      question:    'भारत में कितने राज्य हैं?',
      options:     [{ key: 'A', text: '27' }, { key: 'B', text: '28' }, { key: 'C', text: '29' }, { key: 'D', text: '30' }],
      correctKey:  'B',
      explanation: 'वर्तमान में भारत में 28 राज्य और 8 केंद्र शासित प्रदेश हैं।',
    },
  ],
};

// ── Score card shown at end ───────────────────────────────────────────────────
function ScoreCard({
  score, total, language, onRestart, onBack,
}: {
  score: number; total: number; language: 'hindi' | 'english';
  onRestart: () => void; onBack: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opAnim    = useRef(new Animated.Value(0)).current;
  const pct = Math.round((score / total) * 100);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(opAnim,    { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const emoji   = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
  const msgH    = pct >= 80 ? 'शानदार! बहुत अच्छा!' : pct >= 60 ? 'अच्छा प्रयास!' : 'और पढ़ाई करें!';
  const msgE    = pct >= 80 ? 'Excellent work!'     : pct >= 60 ? 'Good effort!'   : 'Keep studying!';

  return (
    <Animated.View style={[scoreStyles.wrap, { opacity: opAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={scoreStyles.emoji}>{emoji}</Text>
      <Text style={scoreStyles.msg}>{language === 'hindi' ? msgH : msgE}</Text>
      <View style={scoreStyles.scoreBox}>
        <Text style={scoreStyles.scoreNum}>{score}/{total}</Text>
        <Text style={scoreStyles.scorePct}>{pct}%</Text>
      </View>
      <TouchableOpacity style={scoreStyles.primaryBtn} onPress={onRestart}>
        <Text style={scoreStyles.primaryBtnText}>
          {language === 'hindi' ? 'फिर से खेलें' : 'Play Again'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={scoreStyles.secondaryBtn} onPress={onBack}>
        <Text style={scoreStyles.secondaryBtnText}>
          {language === 'hindi' ? 'होम पर जाएं' : 'Go Home'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const scoreStyles = StyleSheet.create({
  wrap:           { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emoji:          { fontSize: 64, marginBottom: 16 },
  msg:            { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 24 },
  scoreBox:       { backgroundColor: 'rgba(244,196,48,0.1)', borderRadius: 20, paddingHorizontal: 40, paddingVertical: 20, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(244,196,48,0.25)' },
  scoreNum:       { fontSize: 44, fontWeight: '700', color: '#f4c430' },
  scorePct:       { fontSize: 18, color: 'rgba(244,196,48,0.6)', marginTop: 4 },
  primaryBtn:     { backgroundColor: '#f4c430', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, marginBottom: 12 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#0f0e17' },
  secondaryBtn:   { paddingVertical: 10 },
  secondaryBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PracticeScreen({ navigation, route }: Props) {
  const { subjectId } = route.params;

  const { language, setLanguage } = useAppStore();
  const [activeSubject,  setActiveSubject]  = useState(subjectId);
  const [questions,      setQuestions]      = useState<Question[]>([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedKey,    setSelectedKey]    = useState<string | null>(null);
  const [answerState,    setAnswerState]    = useState<AnswerState>('unanswered');
  const [score,          setScore]          = useState(0);
  const [finished,       setFinished]       = useState(false);
  const [loadingQ,       setLoadingQ]       = useState(true);

  // Animations
  const headerOp   = useRef(new Animated.Value(0)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const cardX      = useRef(new Animated.Value(30)).current;
  const progressW  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOp, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    fetchQuestions(activeSubject);
  }, []);

  useEffect(() => {
    if (questions.length > 0) animateCard();
  }, [currentIndex, questions]);

  useEffect(() => {
    if (questions.length > 0) {
      Animated.timing(progressW, {
        toValue: currentIndex / questions.length,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, questions.length]);

  const animateCard = () => {
    cardOp.setValue(0);
    cardX.setValue(30);
    Animated.parallel([
      Animated.timing(cardOp, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(cardX,  { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  };

  const fetchQuestions = async (subject: string) => {
    setLoadingQ(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedKey(null);
    setAnswerState('unanswered');

    try {
      const res = await fetch(`${API_BASE}/practice`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, language, count: 5 }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      // Use fallback questions
      const fallback = FALLBACK[subject] ?? FALLBACK.gk;
      setQuestions(fallback);
    } finally {
      setLoadingQ(false);
    }
  };

  const handleAnswer = (key: string) => {
    if (answerState !== 'unanswered') return;
    setSelectedKey(key);
    const correct = key === questions[currentIndex].correctKey;
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedKey(null);
    setAnswerState('unanswered');
  };

  const handleRestart = () => {
    fetchQuestions(activeSubject);
  };

  const handleChipPress = (id: string) => {
    setActiveSubject(id);
    fetchQuestions(id);
  };

  const q = questions[currentIndex];

  const t = {
    practice:  language === 'hindi' ? 'अभ्यास'         : 'Practice',
    question:  language === 'hindi' ? 'प्रश्न'          : 'Question',
    correct:   language === 'hindi' ? '✓ सही!'          : '✓ Correct!',
    wrong:     language === 'hindi' ? '✗ गलत'           : '✗ Wrong',
    explain:   language === 'hindi' ? 'व्याख्या'         : 'Explanation',
    next:      language === 'hindi' ? 'अगला प्रश्न →'   : 'Next →',
    finish:    language === 'hindi' ? 'परिणाम देखें →'  : 'See Result →',
    loading:   language === 'hindi' ? 'प्रश्न तैयार हो रहे हैं...' : 'Loading questions...',
  };

  const optionStyle = (key: string) => {
    if (answerState === 'unanswered') return styles.optionDefault;
    if (key === questions[currentIndex]?.correctKey) return styles.optionCorrect;
    if (key === selectedKey) return styles.optionWrong;
    return styles.optionDimmed;
  };

  const optionTextStyle = (key: string) => {
    if (answerState === 'unanswered') return styles.optionTextDefault;
    if (key === questions[currentIndex]?.correctKey) return styles.optionTextCorrect;
    if (key === selectedKey) return styles.optionTextWrong;
    return styles.optionTextDimmed;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e17" />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerOp }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.practice}</Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage(language === 'hindi' ? 'english' : 'hindi')}
        >
          <Text style={styles.langBtnText}>{language === 'hindi' ? 'EN' : 'HI'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Subject chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {SUBJECT_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, activeSubject === chip.id && styles.chipActive]}
              onPress={() => handleChipPress(chip.id)}
            >
              <Text style={[styles.chipText, activeSubject === chip.id && styles.chipTextActive]}>
                {language === 'hindi' ? chip.hindi : chip.english}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Progress bar ── */}
        {!finished && !loadingQ && questions.length > 0 && (
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              {t.question} {currentIndex + 1}/{questions.length}
            </Text>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>
            <Text style={styles.scoreLabel}>
              {language === 'hindi' ? 'स्कोर' : 'Score'}: {score}
            </Text>
          </View>
        )}

        {/* ── Loading ── */}
        {loadingQ && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#f4c430" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        )}

        {/* ── Finished: score card ── */}
        {finished && (
          <ScoreCard
            score={score}
            total={questions.length}
            language={language}
            onRestart={handleRestart}
            onBack={() => navigation.goBack()}
          />
        )}

        {/* ── Question card ── */}
        {!loadingQ && !finished && q && (
          <Animated.View
            style={[styles.questionCard, { opacity: cardOp, transform: [{ translateX: cardX }] }]}
          >
            <Text style={styles.questionText}>{q.question}</Text>

            {/* Options */}
            <View style={styles.options}>
              {q.options.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.option, optionStyle(opt.key)]}
                  onPress={() => handleAnswer(opt.key)}
                  activeOpacity={answerState === 'unanswered' ? 0.7 : 1}
                >
                  <View style={[styles.optionKey, optionStyle(opt.key)]}>
                    <Text style={[styles.optionKeyText, optionTextStyle(opt.key)]}>
                      {opt.key}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, optionTextStyle(opt.key)]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Result + explanation */}
            {answerState !== 'unanswered' && (
              <Animated.View style={[
                styles.resultBox,
                answerState === 'correct' ? styles.resultCorrect : styles.resultWrong,
              ]}>
                <Text style={[
                  styles.resultTitle,
                  answerState === 'correct' ? styles.resultTitleCorrect : styles.resultTitleWrong,
                ]}>
                  {answerState === 'correct' ? t.correct : t.wrong}
                </Text>
                <Text style={styles.resultExplainLabel}>{t.explain}:</Text>
                <Text style={styles.resultExplain}>{q.explanation}</Text>

                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextBtnText}>
                    {currentIndex + 1 >= questions.length ? t.finish : t.next}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0e17',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingTop:       Platform.OS === 'ios' ? 56 : 44,
    paddingBottom:    14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow:   { fontSize: 18, color: '#ffffff', marginTop: -1 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#ffffff' },
  langBtn: {
    backgroundColor: 'rgba(244,196,48,0.12)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(244,196,48,0.3)',
  },
  langBtnText: { fontSize: 12, fontWeight: '700', color: '#f4c430', letterSpacing: 1 },

  // Subject chips
  chipsScroll: { marginTop: 16, marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive:     { backgroundColor: 'rgba(244,196,48,0.12)', borderColor: '#f4c430' },
  chipText:       { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  chipTextActive: { color: '#f4c430' },

  // Progress
  progressWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 20, marginBottom: 4,
  },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', minWidth: 72 },
  progressTrack: {
    flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill:  { height: '100%', backgroundColor: '#f4c430', borderRadius: 2 },
  scoreLabel:    { fontSize: 12, color: '#f4c430', fontWeight: '700', minWidth: 56, textAlign: 'right' },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  loadingText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },

  // Question card
  questionCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    gap: 20,
  },
  questionText: {
    fontSize: 18, fontWeight: '600', color: '#ffffff',
    lineHeight: 28,
  },

  // Options
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, padding: 14,
    borderWidth: 1,
  },
  optionDefault: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  optionCorrect: { backgroundColor: 'rgba(76,175,80,0.12)',   borderColor: 'rgba(76,175,80,0.5)' },
  optionWrong:   { backgroundColor: 'rgba(244,67,54,0.12)',   borderColor: 'rgba(244,67,54,0.5)' },
  optionDimmed:  { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', opacity: 0.5 },
  optionKey: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  optionKeyText:        { fontSize: 13, fontWeight: '700' },
  optionText:           { flex: 1, fontSize: 15, lineHeight: 22 },
  optionTextDefault:    { color: 'rgba(255,255,255,0.8)' },
  optionTextCorrect:    { color: '#81c784' },
  optionTextWrong:      { color: '#ef9a9a' },
  optionTextDimmed:     { color: 'rgba(255,255,255,0.3)' },

  // Result box
  resultBox: {
    borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1,
  },
  resultCorrect:      { backgroundColor: 'rgba(76,175,80,0.08)',  borderColor: 'rgba(76,175,80,0.25)' },
  resultWrong:        { backgroundColor: 'rgba(244,67,54,0.08)',  borderColor: 'rgba(244,67,54,0.25)' },
  resultTitle:        { fontSize: 16, fontWeight: '700' },
  resultTitleCorrect: { color: '#81c784' },
  resultTitleWrong:   { color: '#ef9a9a' },
  resultExplainLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1 },
  resultExplain:      { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 },
  nextBtn: {
    marginTop: 4, backgroundColor: '#f4c430',
    borderRadius: 10, paddingVertical: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#0f0e17' },
});