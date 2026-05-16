import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const SplashScreen = ({ navigation }: Props) => {
  // Animation values
  const logoScale    = useRef(new Animated.Value(0.6)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(20)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const tagY         = useRef(new Animated.Value(16)).current;
  const barOpacity   = useRef(new Animated.Value(0)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;
  const dot1         = useRef(new Animated.Value(0)).current;
  const dot2         = useRef(new Animated.Value(0)).current;
  const dot3         = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // 1. Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 4. Loading bar grows
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading bar fill (separate — width can't use native driver)
    setTimeout(() => {
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      }).start();
    }, 900);

    // Dot pulse loop
    const pulseDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    setTimeout(() => {
      pulseDot(dot1, 0);
      pulseDot(dot2, 200);
      pulseDot(dot3, 400);
    }, 900);

    // Navigate after 3s
    const timer = setTimeout(() => {
      navigation.replace('LanguageSelect');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const barInterpolated = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e17" />

      {/* Background dots pattern */}
      <View style={styles.bgPattern}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bgDot,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.06 + Math.random() * 0.08,
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
              },
            ]}
          />
        ))}
      </View>

      {/* Glow behind logo */}
      <View style={styles.glow} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Text style={styles.logoIcon}>📚</Text>
      </Animated.View>

      {/* App name */}
      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        PadhAI
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: tagOpacity, transform: [{ translateY: tagY }] },
        ]}
      >
        पढ़ो बिना इंटरनेट के
      </Animated.Text>

      {/* Offline badge */}
      <Animated.View style={[styles.offlineBadge, { opacity: tagOpacity }]}>
        <View style={styles.offlineDot} />
        <Text style={styles.offlineText}>Offline Ready</Text>
      </Animated.View>

      {/* Loading bar */}
      <Animated.View style={[styles.barWrap, { opacity: barOpacity }]}>
        <Animated.View style={[styles.barFill, { width: barInterpolated }]} />
      </Animated.View>

      {/* Pulsing dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>

      {/* Bottom credit */}
      <Animated.Text style={[styles.credit, { opacity: tagOpacity }]}>
        Powered by Gemma 4 · Built for Bihar
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0e17',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Background decorative dots
  bgPattern: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },


  bgDot: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#f4c430',
  },

  // Soft glow behind logo
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#f4c430',
    opacity: 0.07,
    top: height * 0.5 - 180,
  },

  // Logo box
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#f4c430',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // subtle inner shadow via border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoIcon: {
    fontSize: 42,
  },

  // App title
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  // Hindi tagline
  tagline: {
    fontSize: 16,
    color: '#f4c430',
    letterSpacing: 0.5,
    marginBottom: 16,
    fontWeight: '500',
  },

  // Offline pill badge
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  offlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 7,
  },
  offlineText: {
    color: '#aaa',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // Loading bar
  barWrap: {
    width: '60%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f4c430',
    borderRadius: 4,
  },

  // Pulsing dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 0,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f4c430',
  },

  // Bottom credit line
  credit: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 32,
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;