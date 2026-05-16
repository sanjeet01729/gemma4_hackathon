import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput, // Added TextInput
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useAppStore } from "../store/useAppStore";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const SUBJECTS = [
  {
    id: "polity",
    icon: "⚖️",
    hindi: "भारतीय राजनीति",
    english: "Indian Polity",
    topics: "42 Topics",
    color: "#ffb74d",
  },
  {
    id: "history",
    icon: "📜",
    hindi: "इतिहास",
    english: "History",
    topics: "85 Topics",
    color: "#f4c430",
  },
  {
    id: "geography",
    icon: "🗺️",
    hindi: "भूगोल",
    english: "Geography",
    topics: "64 Topics",
    color: "#4fc3f7",
  },
  {
    id: "science",
    icon: "🔬",
    hindi: "विज्ञान",
    english: "Science",
    topics: "92 Topics",
    color: "#80cbc4",
  },
  {
    id: "maths",
    icon: "🔢",
    hindi: "गणित",
    english: "Maths",
    topics: "110 Topics",
    color: "#81c784",
  },
  {
    id: "gk",
    icon: "🏛️",
    hindi: "सामान्य ज्ञान",
    english: "General Knowledge",
    topics: "200+ MCQs",
    color: "#ce93d8",
  },
];

export default function HomeScreen({ navigation }: Props) {
  const { language, setLanguage } = useAppStore();
  const [searchInput, setSearchInput] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOp, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOp, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const t = {
    greeting: language === "hindi" ? "नमस्ते, अभ्यर्थी" : "Welcome back, Aspirant",
    ready:
      language === "hindi"
        ? "आज क्या पढ़ना चाहेंगे?"
        : "Ready for your next lesson?",
    continue: language === "hindi" ? "पढ़ना जारी रखें" : "Continue Learning",
    lastLesson:
      language === "hindi"
        ? "भारतीय संविधान - भाग १"
        : "Indian Constitution - Pt. 1",
    progress: language === "hindi" ? "१२/४० अध्याय" : "12/40 Chapters",
    search:
      language === "hindi"
        ? "PadhAI से कुछ भी पूछें..."
        : "Ask PadhAI anything...",
    subjects: language === "hindi" ? "विषय" : "Subjects",
    offline: language === "hindi" ? "ऑफलाइन" : "Offline Mode",
  };

  // Triggered as soon as the user types
  const handleSearchIntent = (text: string) => {
    if (text.length > 0) {
      navigation.navigate("Chat", {
        subjectId: "general",
        initialQuery: text, // Passing the text to the next screen
        subjectName: "PadhAI Assistant",
      });
      // Clear input so it's fresh when they return to home
      setSearchInput("");
    }
  };

  const handleSubject = (sub: any) => {
    navigation.navigate("Chat", {
      subjectId: sub.id,
      subjectName: language === "hindi" ? sub.hindi : sub.english,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Fixed Premium Header ── */}
      <View style={styles.topNav}>
        <View style={styles.offlineStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t.offline}</Text>
        </View>

        <View style={styles.langToggle}>
          <TouchableOpacity
            onPress={() => setLanguage("english")}
            style={[
              styles.langTab,
              language === "english" && styles.langTabActive,
            ]}
          >
            <Text
              style={[
                styles.langTabText,
                language === "english" && styles.langTabTextActive,
              ]}
            >
              EN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage("hindi")}
            style={[
              styles.langTab,
              language === "hindi" && styles.langTabActive,
            ]}
          >
            <Text
              style={[
                styles.langTabText,
                language === "hindi" && styles.langTabTextActive,
              ]}
            >
              हिन्दी
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
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

          {/* ── REFACTORED AI Search Bar (Functional) ── */}
          <View style={styles.aiSearchBar}>
            <View style={styles.searchInner}>
              <Text style={{ fontSize: 18 }}>🪄</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t.search}
                placeholderTextColor="#64748B"
                value={searchInput}
                onChangeText={handleSearchIntent}
                autoCorrect={false}
              />
              {searchInput.length === 0 && (
                <Animated.View style={[styles.cursor, { opacity: cursorOp }]} />
              )}
            </View>
            <TouchableOpacity style={styles.micBtn}>
              <Text style={{ fontSize: 16 }}>🎙️</Text>
            </TouchableOpacity>
          </View>

          {/* ── Subject Grid ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.subjects}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {SUBJECTS.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.subCard}
                onPress={() => handleSubject(sub)}
              >
                <View
                  style={[
                    styles.subIconBg,
                    { backgroundColor: sub.color + "15" },
                  ]}
                >
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
  container: { flex: 1, backgroundColor: "#05060B" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 110 },
  topNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 100,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "rgba(5, 6, 11, 0.9)",
  },
  offlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16171D",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "#16171D",
    padding: 4,
    borderRadius: 14,
  },
  langTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  langTabActive: { backgroundColor: "#FFB800" },
  langTabText: { color: "#64748B", fontSize: 12, fontWeight: "800" },
  langTabTextActive: { color: "#000" },
  header: { marginBottom: 24 },
  greetingText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  readyText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroCard: {
    height: 160,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#16171D",
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.15)",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,184,0,0.03)",
  },
  heroContent: { flex: 1, padding: 24, justifyContent: "center" },
  heroBadge: {
    backgroundColor: "rgba(255,184,0,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: "#FFB800",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#2D2E35",
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 3,
  },
  progressText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },

  // Search Bar Refactored
  aiSearchBar: {
    height: 60,
    backgroundColor: "#1A1B23",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.2)",
    marginBottom: 32,
  },
  searchInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    height: "100%",
  },
  cursor: { width: 2, height: 20, backgroundColor: "#FFB800", marginLeft: -24 }, // Adjusted to overlap input start
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#2D2E35",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  seeAll: { color: "#FFB800", fontSize: 13, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  subCard: {
    width: (width - 54) / 2,
    backgroundColor: "#16171D",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  subIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  subIcon: { fontSize: 22 },
  subName: { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  subMeta: { color: "#64748B", fontSize: 11, fontWeight: "600" },
});
