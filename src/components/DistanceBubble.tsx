import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface DistanceBubbleProps {
  primaryDistanceYards: number;
  secondaryLabel?: string;
  position: { x: number; y: number } | null;
  align?: "left" | "right";
}

const DistanceBubble: React.FC<DistanceBubbleProps> = ({
  primaryDistanceYards,
  secondaryLabel,
  position,
  align = "left",
}) => {
  if (!position) {
    return null;
  }

  const transformX = align === "left" ? -80 : -20;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: position.x + transformX,
          top: position.y - 70,
          alignItems: align === "left" ? "flex-start" : "flex-end",
        },
      ]}
    >
      <Text style={styles.primaryText}>{`${Math.round(primaryDistanceYards)}y`}</Text>
      {secondaryLabel ? (
        <Text style={styles.secondaryText}>{secondaryLabel}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    minWidth: 120,
    maxWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(20,20,20,0.8)",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 4,
  },
});

export default DistanceBubble;
