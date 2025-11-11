import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ToolsPanelProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

interface ToolButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onPress }) => (
  <View style={styles.toolWrapper}>
    <Pressable style={styles.toolButton} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#FFFFFF" />
    </Pressable>
    {label ? <Text style={styles.toolLabel}>{label}</Text> : null}
  </View>
);

const ToolsPanel: React.FC<ToolsPanelProps> = ({ onZoomIn, onZoomOut }) => (
  <View style={styles.container}>
    <ToolButton icon="add" onPress={onZoomIn} />
    <ToolButton icon="remove" onPress={onZoomOut} />
    <ToolButton icon="cloud-outline" label="Wind" />
    <ToolButton icon="stats-chart-outline" />
    <ToolButton icon="compass-outline" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(20,20,20,0.75)",
    borderRadius: 20,
    padding: 12,
    gap: 16,
    alignItems: "center",
  },
  toolWrapper: {
    alignItems: "center",
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default ToolsPanel;
