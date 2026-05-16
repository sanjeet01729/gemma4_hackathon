import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useAppStore } from "../store/useAppStore";

const { width, height } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "LanguageSelect">;
};

type Language = "hindi" | "english";

const LanguageSelectScreen = ({ navigation }: Props) => {
  const { setLanguage } = useAppStore();
  const [selected, setSelected] = useState<Language | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loadingText, setLoadingText] = useState("आगे बढ़ें");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(0.95)).current;
  const btnOp = useRef(new Animated.Value(0)).current;

  // AI Background Particles
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        duration: 3000 + Math.random() * 4000,
      })),
    []
  );

  useEffect(() => {
    // Entrance Sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle Breathing Background
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.timing(btnOp, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(btnScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selected]);

  const handleConfirm = async () => {
    if (!selected || confirming) return;
    setConfirming(true);

    // Smooth transitions for loading states
    const steps = [
      "Initializing Gemma 4...",
      "Loading Offline Modules...",
      "Success",
    ];
    steps.forEach((text, i) => {
      setTimeout(() => setLoadingText(text), i * 600);
    });

    setTimeout(async () => {
      await setLanguage(selected);
      navigation.replace("Home");
    }, 2000);
  };

  const renderLanguageCard = (
    id: Language,
    title: string,
    sub: string,
    icon: string
  ) => {
    const isSelected = selected === id;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelected(id)}
        style={[styles.card, isSelected && styles.cardActive]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <View style={styles.textColumn}>
            <Text
              style={[styles.cardTitle, isSelected && styles.cardTitleActive]}
            >
              {title}
            </Text>
            <Text style={styles.cardSub}>{sub}</Text>
          </View>
        </View>
        <View
          style={[styles.outerRadio, isSelected && styles.outerRadioActive]}
        >
          {isSelected && <View style={styles.innerRadio} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0)" />

      {/* Dynamic AI Particle Background */}
      <View style={StyleSheet.absoluteFill}>
        {particles.map((p) => (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.1, 0.4],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.inner,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Branding Area */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.appName}>PadhAI</Text>
          <View style={styles.madhubaniLine} />
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          <Text style={styles.mainHeading}>पढ़ाई की भाषा चुनें</Text>
          <Text style={styles.subHeading}>
            Choose your medium of instruction
          </Text>

          <View style={styles.cardStack}>
            {renderLanguageCard(
              "hindi",
              "हिन्दी",
              "SSC, Railway, Bihar Police",
              "अ"
            )}
            {renderLanguageCard(
              "english",
              "English",
              "UPSC, Banking, Technical",
              "A"
            )}
          </View>

          <Text style={styles.legalNotice}>
            Safe. Offline. AI-Powered for Bihar.
          </Text>
        </View>

        {/* Action Button */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: btnOp, transform: [{ scale: btnScale }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryBtn, confirming && styles.btnLoading]}
            onPress={handleConfirm}
            disabled={confirming}
          >
            <Text style={styles.btnLabel}>{loadingText}</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            You can change this anytime in settings
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05060B" },
  particle: {
    position: "absolute",
    backgroundColor: "#FFD700",
    borderRadius: 10,
  },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: height * 0.08 },

  // Branding
  brandContainer: { alignItems: "center", marginBottom: 40 },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1A1C26",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  logoInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFB800",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#000", fontSize: 24, fontWeight: "900" },
  logoGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFB800",
    opacity: 0.1,
    borderRadius: 16,
    transform: [{ scale: 1.4 }],
  },
  appName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    letterSpacing: 1,
  },
  madhubaniLine: {
    height: 2,
    width: 40,
    backgroundColor: "#FFB800",
    marginTop: 8,
    borderRadius: 10,
    opacity: 0.6,
  },

  // Typography
  mainHeading: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "left",
  },
  subHeading: {
    color: "#94A3B8",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  
// In your StyleSheet.create() object, add:
mainContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginVertical: 20,
},
  // Cards
  cardStack: { gap: 16 },
  card: {
    backgroundColor: "rgba(26, 28, 38, 0.6)",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardActive: {
    backgroundColor: "rgba(255, 184, 0, 0.08)",
    borderColor: "#FFB800",
  },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2D303E",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: { backgroundColor: "#FFB800" },
  iconText: { fontSize: 20, color: "#FFF", fontWeight: "700" },
  textColumn: { gap: 2 },
  cardTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  cardTitleActive: { color: "#FFB800" },
  cardSub: { color: "#64748B", fontSize: 13 },

  // Radio UI
  outerRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  outerRadioActive: { borderColor: "#FFB800" },
  innerRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFB800",
  },

  legalNotice: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 40,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Action
  footer: { marginTop: "auto", marginBottom: 40 },
  primaryBtn: {
    backgroundColor: "#FFB800",
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnLoading: { opacity: 0.8 },
  btnLabel: { color: "#000", fontSize: 18, fontWeight: "800" },
  footerNote: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});

export default LanguageSelectScreen;
