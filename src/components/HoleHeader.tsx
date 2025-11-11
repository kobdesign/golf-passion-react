import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface HoleHeaderProps {
  holeNumber: number;
  par: number;
  handicap: number;
  teeColor: "White" | "Blue" | "Red";
  yardage: number;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const HoleHeader: React.FC<HoleHeaderProps> = ({
  holeNumber,
  par,
  handicap,
  teeColor,
  yardage,
  onBackPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={onBackPress} style={styles.backButton}>
        <Text style={styles.backText}>{"<"}</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.holeTitle}>{`Hole ${holeNumber}`}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{`${teeColor} ${yardage}y`}</Text>
          <View style={styles.dot} />
          <Text style={styles.label}>{`Par ${par}`}</Text>
          <View style={styles.dot} />
          <Text style={styles.label}>{`Handicap ${handicap}`}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  holeTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});

export default HoleHeader;
