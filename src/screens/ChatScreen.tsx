import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from "react-native-image-picker";
import { askGemma, askGemmaWithImage } from "../api/gemma";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { useAppStore } from "../store/useAppStore";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  route: RouteProp<RootStackParamList, "Chat">;
};

type Role = "user" | "ai";

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  imageUri?: string; // ← for showing image in bubble
}

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a14",
  surface: "#111120",
  surface2: "#181828",
  border: "rgba(255,255,255,0.06)",
  gold: "#f4c430",
  goldDim: "rgba(244,196,48,0.12)",
  goldBorder: "rgba(244,196,48,0.22)",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.38)",
  muted2: "rgba(255,255,255,0.18)",
  green: "#22c55e",
  userBubble: "rgba(244,196,48,0.14)",
  aiBubble: "rgba(255,255,255,0.055)",
};

// ── Suggested questions ──────────────────────────────────────────────────────
const SUGGESTIONS: Record<
  string,
  { hindi: { icon: string; text: string }[]; english: { icon: string; text: string }[] }
> = {
  history: {
    hindi: [
      { icon: "🏰", text: "मुगल साम्राज्य का संस्थापक कौन था?" },
      { icon: "⚔️", text: "1857 की क्रांति कहाँ से शुरू हुई?" },
      { icon: "📅", text: "पानीपत की प्रथम लड़ाई कब हुई?" },
    ],
    english: [
      { icon: "🏰", text: "Who founded the Mughal Empire?" },
      { icon: "⚔️", text: "Where did the 1857 revolt begin?" },
      { icon: "📅", text: "When was the first Battle of Panipat?" },
    ],
  },
  geography: {
    hindi: [
      { icon: "🌊", text: "भारत की सबसे लंबी नदी कौन सी है?" },
      { icon: "🏙️", text: "बिहार की राजधानी क्या है?" },
      { icon: "🏔️", text: "हिमालय पर्वत किस दिशा में है?" },
    ],
    english: [
      { icon: "🌊", text: "What is the longest river in India?" },
      { icon: "🏙️", text: "What is the capital of Bihar?" },
      { icon: "🏔️", text: "In which direction is the Himalayan range?" },
    ],
  },
  maths: {
    hindi: [
      { icon: "🔢", text: "π का मान क्या है?" },
      { icon: "📐", text: "त्रिभुज का क्षेत्रफल कैसे निकालें?" },
      { icon: "➗", text: "LCM और HCF में क्या अंतर है?" },
    ],
    english: [
      { icon: "🔢", text: "What is the value of π?" },
      { icon: "📐", text: "How to find the area of a triangle?" },
      { icon: "➗", text: "What is the difference between LCM and HCF?" },
    ],
  },
  gk: {
    hindi: [
      { icon: "🇮🇳", text: "भारत के राष्ट्रपति कौन हैं?" },
      { icon: "📋", text: "UPSC का पूरा नाम क्या है?" },
      { icon: "🗺️", text: "भारत में कितने राज्य हैं?" },
    ],
    english: [
      { icon: "🇮🇳", text: "Who is the President of India?" },
      { icon: "📋", text: "What is the full form of UPSC?" },
      { icon: "🗺️", text: "How many states are there in India?" },
    ],
  },
  science: {
    hindi: [
      { icon: "💡", text: "प्रकाश की गति कितनी है?" },
      { icon: "🧬", text: "DNA का पूरा नाम क्या है?" },
      { icon: "💧", text: "पानी का रासायनिक सूत्र क्या है?" },
    ],
    english: [
      { icon: "💡", text: "What is the speed of light?" },
      { icon: "🧬", text: "What is the full form of DNA?" },
      { icon: "💧", text: "What is the chemical formula of water?" },
    ],
  },
  polity: {
    hindi: [
      { icon: "📜", text: "भारतीय संविधान कब लागू हुआ?" },
      { icon: "🏛️", text: "लोकसभा में कितनी सीटें हैं?" },
      { icon: "⚖️", text: "मौलिक अधिकार कितने हैं?" },
    ],
    english: [
      { icon: "📜", text: "When was the Indian Constitution enacted?" },
      { icon: "🏛️", text: "How many seats are in Lok Sabha?" },
      { icon: "⚖️", text: "How many Fundamental Rights are there?" },
    ],
  },
  economy: {
    hindi: [
      { icon: "📊", text: "GDP का पूरा नाम क्या है?" },
      { icon: "🏦", text: "भारत का केंद्रीय बैंक कौन सा है?" },
      { icon: "💰", text: "GST क्या है?" },
    ],
    english: [
      { icon: "📊", text: "What is the full form of GDP?" },
      { icon: "🏦", text: "Which is the central bank of India?" },
      { icon: "💰", text: "What is GST?" },
    ],
  },
  free: {
    hindi: [
      { icon: "📖", text: "बिहार का इतिहास क्या है?" },
      { icon: "🎯", text: "सरकारी नौकरी की तैयारी कैसे करें?" },
      { icon: "📷", text: "किताब की फोटो लेकर पूछें" },
    ],
    english: [
      { icon: "📖", text: "What is the history of Bihar?" },
      { icon: "🎯", text: "How to prepare for government jobs?" },
      { icon: "📷", text: "Photo a textbook page and ask" },
    ],
  },
};

// ── AI Avatar ─────────────────────────────────────────────────────────────────
function AIOrb() {
  const glow = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1,   duration: 1800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={orb.wrap}>
      <Animated.View style={[orb.glow, { opacity: glow }]} />
      <View style={orb.core}><Text style={orb.icon}>✦</Text></View>
    </View>
  );
}

const orb = StyleSheet.create({
  wrap: { width: 32, height: 32, alignItems: "center", justifyContent: "center", marginRight: 10, marginBottom: 4 },
  glow: { position: "absolute", width: 32, height: 32, borderRadius: 16, backgroundColor: C.gold, opacity: 0.15 },
  core: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.goldBorder, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 13, color: C.gold },
});

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  // ✅ Fixed — individual refs, not inside array
  const d1 = useRef(new Animated.Value(0.25)).current;
  const d2 = useRef(new Animated.Value(0.25)).current;
  const d3 = useRef(new Animated.Value(0.25)).current;
  const dots = [d1, d2, d3];

  useEffect(() => {
    dots.forEach((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1,    duration: 340, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.25, duration: 340, useNativeDriver: true }),
        ])
      ).start()
    );
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 5, paddingVertical: 2 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold, opacity: d }} />
      ))}
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  const isUser = message.role === "user";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.bubbleRow,
        isUser ? s.bubbleRowUser : s.bubbleRowAI,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {!isUser && <AIOrb />}
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI]}>
        {/* Show image if attached */}
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            style={s.messageImage}
            resizeMode="cover"
          />
        )}
        {message.text ? (
          <Text style={[s.bubbleText, isUser ? s.textUser : s.textAI]}>
            {message.text}
          </Text>
        ) : null}
        <Text style={[s.timestamp, isUser ? s.tsUser : s.tsAI]}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Welcome card ──────────────────────────────────────────────────────────────
function WelcomeCard({
  subjectName, language, onSuggestion, suggestions,
}: {
  subjectName: string;
  language: "hindi" | "english";
  onSuggestion: (t: string) => void;
  suggestions: { icon: string; text: string }[];
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const greeting  = language === "hindi" ? "नमस्ते! 👋" : "Hello! 👋";
  const subtitle  = language === "hindi" ? `मैं ${subjectName} में आपकी मदद करूँगा।` : `I'll help you with ${subjectName}.`;
  const popLabel  = language === "hindi" ? "लोकप्रिय प्रश्न" : "Popular Questions";
  const photoHint = language === "hindi" ? "📷 किताब की फोटो भेजें" : "📷 Send a textbook photo";

  return (
    <Animated.View style={[s.welcomeCard, { opacity: fadeAnim }]}>
      <View style={s.welcomeTop}>
        <View style={s.welcomeOrbWrap}>
          <View style={s.welcomeOrbGlow} />
          <View style={s.welcomeOrb}><Text style={s.welcomeOrbIcon}>✦</Text></View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.welcomeGreeting}>{greeting}</Text>
          <Text style={s.welcomeSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Photo hint banner */}
      <View style={s.photoHint}>
        <Text style={s.photoHintText}>{photoHint}</Text>
      </View>

      <View style={s.welcomeDivider} />
      <Text style={s.suggLabel}>{popLabel}</Text>
      <View style={s.suggList}>
        {suggestions.map((item, i) => (
          <TouchableOpacity key={i} style={s.suggItem} onPress={() => onSuggestion(item.text)} activeOpacity={0.7}>
            <Text style={s.suggIcon}>{item.icon}</Text>
            <Text style={s.suggText} numberOfLines={2}>{item.text}</Text>
            <Text style={s.suggArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ChatScreen({ navigation, route }: Props) {
  const { subjectId, subjectName } = route.params;
  const { language, setLanguage } = useAppStore();

  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showWelcome,   setShowWelcome]   = useState(true);
  const [inputFocused,  setInputFocused]  = useState(false);
  const [pendingImage,  setPendingImage]  = useState<{ uri: string; base64: string } | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const headerOp    = useRef(new Animated.Value(0)).current;
  const sugg        = (SUGGESTIONS[subjectId] ?? SUGGESTIONS.free)[language];

  useEffect(() => {
    Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  // ── Pick from gallery ──────────────────────────────────────────────────────
  const pickFromGallery = () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: true, quality: 0.6 },
      (res: ImagePickerResponse) => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (asset?.uri && asset?.base64) {
          setPendingImage({ uri: asset.uri, base64: asset.base64 });
        }
      }
    );
  };

  // ── Take photo with camera ─────────────────────────────────────────────────
  const takePhoto = () => {
    launchCamera(
      { mediaType: "photo", includeBase64: true, quality: 0.6, saveToPhotos: false },
      (res: ImagePickerResponse) => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (asset?.uri && asset?.base64) {
          setPendingImage({ uri: asset.uri, base64: asset.base64 });
        }
      }
    );
  };

  // ── Show camera/gallery options ────────────────────────────────────────────
  const handleImagePress = () => {
    Alert.alert(
      language === "hindi" ? "फोटो चुनें" : "Choose Photo",
      "",
      [
        {
          text: language === "hindi" ? "📷 कैमरा" : "📷 Camera",
          onPress: takePhoto,
        },
        {
          text: language === "hindi" ? "🖼️ गैलरी" : "🖼️ Gallery",
          onPress: pickFromGallery,
        },
        {
          text: language === "hindi" ? "रद्द करें" : "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) return;
    if (loading) return;

    setInput("");
    setShowWelcome(false);
    Keyboard.dismiss();

    const imageToSend = pendingImage;
    setPendingImage(null);

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      text:      trimmed || (language === "hindi" ? "इस image को समझाएं" : "Explain this image"),
      timestamp: new Date(),
      imageUri:  imageToSend?.uri,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    scrollToBottom();

    try {
      let answer: string;

      if (imageToSend?.base64) {
        // ← vision call
        answer = await askGemmaWithImage(
          trimmed || (language === "hindi" ? "इस image को समझाएं" : "Explain this image"),
          language,
          subjectId,
          imageToSend.base64
        );
      } else {
        // ← text only call
        answer = await askGemma(trimmed, language, subjectId);
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: answer, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id:        (Date.now() + 1).toString(),
          role:      "ai",
          text:      language === "hindi"
            ? "माफ करें, कुछ गड़बड़ हो गई। दोबारा कोशिश करें।"
            : "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const placeholder = language === "hindi" ? "PadhAI से पूछें..." : "Ask PadhAI anything...";

  return (
    // ✅ Fixed — SafeAreaView outside KeyboardAvoidingView
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <StatusBar barStyle="light-content" backgroundColor={C.bg} translucent={false} />

        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerOp }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={s.headerMid}>
            <Text style={s.headerTitle} numberOfLines={1}>{subjectName}</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineText}>
                {language === "hindi" ? "ऑफलाइन · Gemma 4" : "Offline · Gemma 4"}
              </Text>
            </View>
          </View>

          <View style={s.langSegment}>
            <TouchableOpacity
              style={[s.langOption, language === "hindi" && s.langOptionActive]}
              onPress={() => setLanguage("hindi")}
            >
              <Text style={[s.langOptionText, language === "hindi" && s.langOptionTextActive]}>HI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.langOption, language === "english" && s.langOptionActive]}
              onPress={() => setLanguage("english")}
            >
              <Text style={[s.langOptionText, language === "english" && s.langOptionTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Messages / Welcome ── */}
        {showWelcome && messages.length === 0 ? (
          <View style={s.welcomeWrap}>
            <WelcomeCard
              subjectName={subjectName}
              language={language}
              onSuggestion={sendMessage}
              suggestions={sugg}
            />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={s.messageList}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading ? (
                <View style={s.typingRow}>
                  <AIOrb />
                  <View style={s.typingBubble}><TypingDots /></View>
                </View>
              ) : null
            }
          />
        )}

        {/* ── Pending image preview ── */}
        {pendingImage && (
          <View style={s.previewWrap}>
            <Image source={{ uri: pendingImage.uri }} style={s.previewImage} resizeMode="cover" />
            <TouchableOpacity style={s.previewRemove} onPress={() => setPendingImage(null)}>
              <Text style={s.previewRemoveText}>✕</Text>
            </TouchableOpacity>
            <Text style={s.previewLabel}>
              {language === "hindi" ? "फोटो तैयार है" : "Image ready"}
            </Text>
          </View>
        )}

        {/* ── Input bar ── */}
        <View style={[s.inputWrap, inputFocused && s.inputWrapFocused]}>
          {/* Camera button */}
          <TouchableOpacity style={s.cameraBtn} onPress={handleImagePress} activeOpacity={0.7}>
            <Text style={s.cameraIcon}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={pendingImage
              ? (language === "hindi" ? "फोटो के बारे में पूछें..." : "Ask about the image...")
              : placeholder
            }
            placeholderTextColor={C.muted}
            multiline
            maxLength={500}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onSubmitEditing={() => sendMessage(input)}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() && !pendingImage || loading) && s.sendBtnOff]}
            onPress={() => sendMessage(input)}
            disabled={(!input.trim() && !pendingImage) || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color={C.bg} />
              : <Text style={s.sendIcon}>↑</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 18, color: C.gold },
  headerMid: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: C.white, letterSpacing: 0.2 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green },
  onlineText: { fontSize: 11, color: C.muted },
  langSegment: { flexDirection: "row", backgroundColor: C.surface2, borderRadius: 10, padding: 2, borderWidth: 1, borderColor: C.border },
  langOption: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  langOptionActive: { backgroundColor: C.gold },
  langOptionText: { fontSize: 11, fontWeight: "700", color: C.muted, letterSpacing: 0.5 },
  langOptionTextActive: { color: C.bg },

  welcomeWrap: { flex: 1, padding: 16 },
  welcomeCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  welcomeTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  welcomeOrbWrap: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  welcomeOrbGlow: { position: "absolute", width: 44, height: 44, borderRadius: 22, backgroundColor: C.gold, opacity: 0.1 },
  welcomeOrb: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.goldBorder, alignItems: "center", justifyContent: "center" },
  welcomeOrbIcon: { fontSize: 18, color: C.gold },
  welcomeGreeting: { fontSize: 18, fontWeight: "700", color: C.white, marginBottom: 3 },
  welcomeSubtitle: { fontSize: 13, color: C.muted, lineHeight: 18 },
  photoHint: { backgroundColor: "rgba(244,196,48,0.07)", borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: C.goldBorder },
  photoHintText: { fontSize: 13, color: C.gold, fontWeight: "600", textAlign: "center" },
  welcomeDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  suggLabel: { fontSize: 10, fontWeight: "700", color: C.muted2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  suggList: { gap: 6 },
  suggItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface2, borderRadius: 12, padding: 12 },
  suggIcon: { fontSize: 16, width: 24, textAlign: "center" },
  suggText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  suggArrow: { fontSize: 18, color: C.muted2, fontWeight: "300" },

  messageList: { padding: 16, gap: 16, paddingBottom: 8 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", maxWidth: width * 0.82 },
  bubbleRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  bubbleRowAI: { alignSelf: "flex-start" },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: C.userBubble, borderWidth: 1, borderColor: C.goldBorder, borderBottomRightRadius: 5 },
  bubbleAI: { backgroundColor: C.aiBubble, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 5 },
  bubbleText: { fontSize: 15, lineHeight: 23 },
  textUser: { color: "#fff8e1" },
  textAI: { color: "rgba(255,255,255,0.88)" },
  timestamp: { fontSize: 10, marginTop: 5 },
  tsUser: { color: "rgba(244,196,48,0.4)", textAlign: "right" },
  tsAI: { color: C.muted2 },

  // Image in bubble
  messageImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },

  typingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 4 },
  typingBubble: { backgroundColor: C.aiBubble, borderRadius: 18, borderBottomLeftRadius: 5, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border },

  // Pending image preview above input
  previewWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 12, marginBottom: 6,
    backgroundColor: C.surface2, borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  previewImage:      { width: 48, height: 48, borderRadius: 8 },
  previewRemove:     { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  previewRemoveText: { fontSize: 10, color: C.white, fontWeight: "700" },
  previewLabel:      { flex: 1, fontSize: 12, color: C.gold, fontWeight: "600" },

  // Input bar
  inputWrap: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    margin: 12, backgroundColor: C.surface, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  inputWrapFocused: { borderColor: C.goldBorder },
  cameraBtn:  { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  cameraIcon: { fontSize: 18 },
  input:      { flex: 1, fontSize: 15, color: C.white, maxHeight: 110, lineHeight: 22, paddingTop: 6, paddingBottom: 6 },
  sendBtn:    { width: 36, height: 36, borderRadius: 11, backgroundColor: C.gold, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  sendBtnOff: { backgroundColor: C.surface2 },
  sendIcon:   { fontSize: 18, color: C.bg, fontWeight: "800" },
});