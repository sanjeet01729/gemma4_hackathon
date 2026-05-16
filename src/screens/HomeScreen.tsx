import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useAppStore } from "../store/useAppStore";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const SUBJECTS = [
  { id: "polity",    icon: "⚖️", hindi: "भारतीय राजनीति", english: "Indian Polity",     topics: "42 Topics",  color: "#ffb74d" },
  { id: "history",   icon: "📜", hindi: "इतिहास",          english: "History",           topics: "85 Topics",  color: "#f4c430" },
  { id: "geography", icon: "🗺️", hindi: "भूगोल",           english: "Geography",         topics: "64 Topics",  color: "#4fc3f7" },
  { id: "science",   icon: "🔬", hindi: "विज्ञान",          english: "Science",           topics: "92 Topics",  color: "#80cbc4" },
  { id: "maths",     icon: "🔢", hindi: "गणित",             english: "Maths",             topics: "110 Topics", color: "#81c784" },
  { id: "gk",        icon: "🏛️", hindi: "सामान्य ज्ञान",   english: "General Knowledge", topics: "200+ MCQs",  color: "#ce93d8" },
  { id: "economy",   icon: "💰", hindi: "अर्थशास्त्र",     english: "Economy",           topics: "38 Topics",  color: "#4db6ac" },
  { id: "current",   icon: "📰", hindi: "करंट अफेयर्स",    english: "Current Affairs",   topics: "Weekly",     color: "#ef9a9a" },
  { id: "free",      icon: "💬", hindi: "कुछ भी पूछें",    english: "Ask Anything",      topics: "Open Chat",  color: "#f4c430" },
];

const DAILY_QUESTIONS = {
  hindi:   ["बिहार का राजकीय पशु क्या है?", "पाटलिपुत्र किस नदी के किनारे बसा है?", "भारत का संविधान कब लागू हुआ?", "नालंदा विश्वविद्यालय किस राज्य में है?", "भारत की प्रथम महिला प्रधानमंत्री कौन थीं?", "चंपारण सत्याग्रह किस वर्ष हुआ था?", "गंगा नदी का उद्गम स्थल कहाँ है?"],
  english: ["What is the state animal of Bihar?", "On which river bank is Pataliputra situated?", "When did the Indian Constitution come into effect?", "In which state is Nalanda University located?", "Who was the first female Prime Minister of India?", "In which year did the Champaran Satyagraha happen?", "Where is the source of the Ganga river?"],
};

export default function HomeScreen({ navigation }: Props) {
  const { language, setLanguage } = useAppStore();
  const [searchInput, setSearchInput] = useState("");
  const [dailyQ, setDailyQ] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOp, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const questions = language === "hindi" ? DAILY_QUESTIONS.hindi : DAILY_QUESTIONS.english;
    setDailyQ(questions[dayOfYear % questions.length]);
  }, [language]);

  const t = {
    greeting:   language === "hindi" ? "नमस्ते, अभ्यर्थी"          : "Welcome, Aspirant",
    ready:      language === "hindi" ? "आज क्या पढ़ना चाहेंगे?"    : "Ready for your next lesson?",
    continue:   language === "hindi" ? "पढ़ना जारी रखें"            : "Continue Learning",
    lastLesson: language === "hindi" ? "भारतीय संविधान - भाग १"    : "Indian Constitution - Pt. 1",
    progress:   language === "hindi" ? "१२/४० अध्याय"               : "12/40 Chapters",
    search:     language === "hindi" ? "PadhAI से कुछ भी पूछें..." : "Ask PadhAI anything...",
    subjects:   language === "hindi" ? "विषय"                       : "Subjects",
    seeAll:     language === "hindi" ? "सभी देखें"                  : "See All",
    offline:    language === "hindi" ? "ऑफलाइन"                     : "Offline Mode",
    dailyLabel: language === "hindi" ? "आज का प्रश्न"               : "Today's Question",
    askBtn:     language === "hindi" ? "पूछें →"                    : "Ask →",
  };

  // Navigate only on submit — not every keystroke
  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    setSearchInput("");
    navigation.navigate("Chat", {
      subjectId:   "free",
      subjectName: language === "hindi" ? "PadhAI असिस्टेंट" : "PadhAI Assistant",
    });
  };

  const handleSubject = (sub: typeof SUBJECTS[0]) => {
    navigation.navigate("Chat", {
      subjectId:   sub.id,
      subjectName: language === "hindi" ? sub.hindi : sub.english,
    });
  };

  const handleDailyQ = () => {
    navigation.navigate("Chat", {
      subjectId:   "gk",
      subjectName: language === "hindi" ? "सामान्य ज्ञान" : "General Knowledge",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Fixed Top Nav ── */}
      <View style={styles.topNav}>
        <View style={styles.offlineStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t.offline}</Text>
        </View>
        <View style={styles.langToggle}>
          <TouchableOpacity
            onPress={() => setLanguage("english")}
            style={[styles.langTab, language === "english" && styles.langTabActive]}
          >
            <Text style={[styles.langTabText, language === "english" && styles.langTabTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage("hindi")}
            style={[styles.langTab, language === "hindi" && styles.langTabActive]}
          >
            <Text style={[styles.langTabText, language === "hindi" && styles.langTabTextActive]}>हिन्दी</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.greetingText}>{t.greeting}</Text>
            <Text style={styles.readyText}>{t.ready}</Text>
          </View>

          {/* ── Hero Card ── */}
          <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{t.continue}</Text>
              </View>
              <Text style={styles.heroTitle}>{t.lastLesson}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: "30%" }]} />
                </View>
                <Text style={styles.progressText}>{t.progress}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── AI Search Bar ── */}
          <View style={styles.aiSearchBar}>
            <View style={styles.searchInner}>
              <Text style={{ fontSize: 18 }}>🪄</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t.search}
                placeholderTextColor="#64748B"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="send"
                autoCorrect={false}
              />
              {searchInput.length === 0 && (
                <Animated.View style={[styles.cursor, { opacity: cursorOp }]} />
              )}
            </View>
            <TouchableOpacity
              style={[styles.micBtn, searchInput.trim().length > 0 && styles.micBtnActive]}
              onPress={handleSearchSubmit}
            >
              <Text style={{ fontSize: 16 }}>
                {searchInput.trim().length > 0 ? "→" : "🎙️"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Daily Question Card ── */}
          <View style={styles.dailyCard}>
            <View style={styles.dailyTop}>
              <Text style={styles.dailyLabel}>{t.dailyLabel}</Text>
              <View style={styles.dailyDot} />
            </View>
            <Text style={styles.dailyQ}>{dailyQ}</Text>
            <TouchableOpacity style={styles.dailyBtn} onPress={handleDailyQ}>
              <Text style={styles.dailyBtnText}>{t.askBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Subject Grid ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.subjects}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t.seeAll}</Text></TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {SUBJECTS.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.subCard, sub.id === "free" && styles.subCardFull]}
                onPress={() => handleSubject(sub)}
              >
                <View style={[styles.subIconBg, { backgroundColor: sub.color + "15" }]}>
                  <Text style={styles.subIcon}>{sub.icon}</Text>
                </View>
                <Text style={styles.subName}>
                  {language === "hindi" ? sub.hindi : sub.english}
                </Text>
                <Text style={styles.subMeta}>{sub.topics}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#05060B" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 110 },
  topNav: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    height: 100, flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: "rgba(5, 6, 11, 0.9)",
  },
  offlineStatus: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#16171D",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  statusDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginRight: 8 },
  statusText:         { color: "#94A3B8", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  langToggle:         { flexDirection: "row", backgroundColor: "#16171D", padding: 4, borderRadius: 14 },
  langTab:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  langTabActive:      { backgroundColor: "#FFB800" },
  langTabText:        { color: "#64748B", fontSize: 12, fontWeight: "800" },
  langTabTextActive:  { color: "#000" },
  header:             { marginBottom: 24 },
  greetingText:       { color: "#94A3B8", fontSize: 14, fontWeight: "600", letterSpacing: 0.5, marginBottom: 4 },
  readyText:          { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  heroCard: {
    height: 160, borderRadius: 28, overflow: "hidden", marginBottom: 24,
    backgroundColor: "#16171D", borderWidth: 1, borderColor: "rgba(255,184,0,0.15)",
  },
  heroOverlay:      { ...StyleSheet.absoluteFill, backgroundColor: "rgba(255,184,0,0.03)" },
  heroContent:      { flex: 1, padding: 24, justifyContent: "center" },
  heroBadge:        { backgroundColor: "rgba(255,184,0,0.1)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  heroBadgeText:    { color: "#FFB800", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  heroTitle:        { color: "#FFF", fontSize: 20, fontWeight: "700", marginBottom: 16 },
  progressRow:      { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBarBg:    { flex: 1, height: 6, backgroundColor: "#2D2E35", borderRadius: 3 },
  progressBarFill:  { height: "100%", backgroundColor: "#FFB800", borderRadius: 3 },
  progressText:     { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  aiSearchBar: {
    height: 60, backgroundColor: "#1A1B23", borderRadius: 20,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    borderWidth: 1, borderColor: "rgba(255,184,0,0.2)", marginBottom: 24,
  },
  searchInner:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  textInput:    { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "500", height: "100%" },
  cursor:       { width: 2, height: 20, backgroundColor: "#FFB800", marginLeft: -24 },
  micBtn:       { width: 36, height: 36, borderRadius: 12, backgroundColor: "#2D2E35", alignItems: "center", justifyContent: "center" },
  micBtnActive: { backgroundColor: "#FFB800" },
  dailyCard: {
    backgroundColor: "rgba(255,184,0,0.06)", borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,184,0,0.15)", marginBottom: 32,
  },
  dailyTop:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  dailyLabel:   { fontSize: 11, color: "#FFB800", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  dailyDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FFB800", opacity: 0.7 },
  dailyQ:       { fontSize: 16, color: "#ffffff", fontWeight: "500", lineHeight: 24, marginBottom: 16 },
  dailyBtn:     { alignSelf: "flex-start", backgroundColor: "#FFB800", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 },
  dailyBtnText: { fontSize: 13, fontWeight: "700", color: "#05060B" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "center" },
  sectionTitle:  { color: "#FFF", fontSize: 18, fontWeight: "700" },
  seeAll:        { color: "#FFB800", fontSize: 13, fontWeight: "700" },
  grid:          { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  subCard: {
    width: (width - 54) / 2, backgroundColor: "#16171D",
    borderRadius: 22, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.03)",
  },
  subCardFull: {
    width: width - 40,
    flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14,
  },
  subIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  subIcon:   { fontSize: 22 },
  subName:   { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  subMeta:   { color: "#64748B", fontSize: 11, fontWeight: "600" },
});