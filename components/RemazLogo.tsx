import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: number;
}

export default function RemazLogo({ size = 48 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize: size * 0.85 }]}>REMAZ</Text>
      <View style={styles.subContainer}>
        <View style={styles.lines}>
          <View style={styles.line} />
          <View style={[styles.line, styles.lineShort]} />
          <View style={[styles.line, styles.lineShorter]} />
        </View>
        <View style={styles.pharmContainer}>
          <Text style={[styles.pharmText, { fontSize: size * 0.65 }]}>P</Text>
          <Text style={[styles.plus, { fontSize: size * 0.6 }]}>+</Text>
          <Text style={[styles.pharmText, { fontSize: size * 0.65 }]}>HARM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: '#006C8C',
    letterSpacing: 1,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  lines: {
    justifyContent: 'center',
    gap: 2,
    marginRight: 4,
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: '#006C8C',
  },
  lineShort: {
    width: 16,
  },
  lineShorter: {
    width: 8,
  },
  pharmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmText: {
    fontWeight: '600',
    color: '#006C8C',
    letterSpacing: 0.5,
  },
  plus: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
});
