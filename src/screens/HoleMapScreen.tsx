import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutRectangle,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  Region,
  LatLng as MapLatLng,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DistanceBubble from "../components/DistanceBubble";
import HoleHeader from "../components/HoleHeader";
import ToolsPanel from "../components/ToolsPanel";
import {
  getHoleInfo,
  getHoleState,
  saveTargetPosition,
  type HoleInfo,
  type LatLng,
} from "../services/golfDataService";
import { distanceInYards } from "../utils/distance";

interface HoleMapScreenProps {
  navigation?: {
    goBack?: () => void;
  };
  route: {
    params: {
      courseId: string;
      roundId: string;
      holeNumber: number;
    };
  };
}

const toMapCoordinate = (coord: LatLng): MapLatLng => ({
  latitude: coord.lat,
  longitude: coord.lng,
});

const computeInitialRegion = (tee: LatLng, green: LatLng): Region => {
  const latitude = (tee.lat + green.lat) / 2;
  const longitude = (tee.lng + green.lng) / 2;
  const latDelta = Math.max(Math.abs(tee.lat - green.lat) * 1.6, 0.002);
  const lngDelta = Math.max(Math.abs(tee.lng - green.lng) * 1.6, 0.002);

  return {
    latitude,
    longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};

const HoleMapScreen: React.FC<HoleMapScreenProps> = ({ route, navigation }) => {
  const { courseId, roundId, holeNumber } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const hasFitToCoords = useRef(false);

  const [activeHole, setActiveHole] = useState(holeNumber);
  const [holeInfo, setHoleInfo] = useState<HoleInfo | null>(null);
  const [targetPosition, setTargetPosition] = useState<LatLng | null>(null);
  const [mapLayout, setMapLayout] = useState<LayoutRectangle | null>(null);
  const [targetBubblePosition, setTargetBubblePosition] = useState<
    { x: number; y: number } | null
  >(null);
  const [greenBubblePosition, setGreenBubblePosition] = useState<
    { x: number; y: number } | null
  >(null);

  const initialRegion = useMemo(() => {
    if (!holeInfo) {
      return null;
    }

    return computeInitialRegion(holeInfo.teePosition, holeInfo.greenPosition);
  }, [holeInfo]);

  const lineCoordinates = useMemo(() => {
    if (!holeInfo) {
      return [];
    }

    const points: MapLatLng[] = [toMapCoordinate(holeInfo.teePosition)];

    if (targetPosition) {
      points.push(toMapCoordinate(targetPosition));
    }

    points.push(toMapCoordinate(holeInfo.greenPosition));

    return points;
  }, [holeInfo, targetPosition]);

  const targetDistance = useMemo(() => {
    if (!holeInfo || !targetPosition) {
      return null;
    }

    return distanceInYards(holeInfo.teePosition, targetPosition);
  }, [holeInfo, targetPosition]);

  const approachDistance = useMemo(() => {
    if (!holeInfo) {
      return null;
    }

    if (targetPosition) {
      return distanceInYards(targetPosition, holeInfo.greenPosition);
    }

    return distanceInYards(holeInfo.teePosition, holeInfo.greenPosition);
  }, [holeInfo, targetPosition]);

  const loadHole = useCallback(
    async (hole: number) => {
      const info = await getHoleInfo(courseId, hole);
      const state = await getHoleState(roundId, hole);

      setHoleInfo(info);
      setTargetPosition(state.targetPosition);
      setActiveHole(hole);
      hasFitToCoords.current = false;
    },
    [courseId, roundId],
  );

  useEffect(() => {
    void loadHole(holeNumber);
  }, [holeNumber, loadHole]);

  useEffect(() => {
    if (!targetPosition) {
      return;
    }

    void saveTargetPosition(roundId, activeHole, targetPosition);
  }, [targetPosition, roundId, activeHole]);

  const handleFitToCoordinates = useCallback(() => {
    if (!mapRef.current || !holeInfo) {
      return;
    }

    const coords = [holeInfo.teePosition, holeInfo.greenPosition];
    if (targetPosition) {
      coords.splice(1, 0, targetPosition);
    }

    if (coords.length < 2) {
      return;
    }

    mapRef.current.fitToCoordinates(coords.map(toMapCoordinate), {
      edgePadding: { top: 120, bottom: 220, left: 80, right: 80 },
      animated: true,
    });
  }, [holeInfo, targetPosition]);

  useEffect(() => {
    if (!holeInfo || !mapLayout || hasFitToCoords.current) {
      return;
    }
    handleFitToCoordinates();
    hasFitToCoords.current = true;
  }, [holeInfo, mapLayout, handleFitToCoordinates]);

  useEffect(() => {
    if (!mapRef.current || !holeInfo) {
      return;
    }

    handleFitToCoordinates();
  }, [handleFitToCoordinates, holeInfo, targetPosition]);

  const updateBubblePositions = useCallback(async () => {
    if (!mapRef.current || !holeInfo) {
      return;
    }

    try {
      const teeToTargetPosition = targetPosition
        ? await mapRef.current.pointForCoordinate?.(toMapCoordinate(targetPosition))
        : null;
      const greenPositionPoint = await mapRef.current.pointForCoordinate?.(
        toMapCoordinate(holeInfo.greenPosition),
      );

      setTargetBubblePosition(teeToTargetPosition ?? null);
      setGreenBubblePosition(greenPositionPoint ?? null);
    } catch (error) {
      console.warn("Failed to calculate bubble positions", error);
    }
  }, [holeInfo, targetPosition]);

  useEffect(() => {
    if (!mapLayout) {
      return;
    }

    void updateBubblePositions();
  }, [mapLayout, updateBubblePositions]);

  useEffect(() => {
    void updateBubblePositions();
  }, [updateBubblePositions]);

  const handleLongPress = useCallback(
    (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      const nextTarget: LatLng = { lat: latitude, lng: longitude };
      setTargetPosition(nextTarget);
    },
    [],
  );

  const adjustZoom = useCallback((delta: number) => {
    if (!mapRef.current?.getCamera || !mapRef.current?.animateCamera) {
      return;
    }

    mapRef.current
      .getCamera()
      .then((camera) => {
        if (!camera) {
          return;
        }
        const nextZoom = (camera.zoom ?? 16) + delta;
        mapRef.current?.animateCamera({ ...camera, zoom: nextZoom }, { duration: 250 });
      })
      .catch(() => undefined);
  }, []);

  const handleZoomIn = useCallback(() => adjustZoom(1), [adjustZoom]);
  const handleZoomOut = useCallback(() => adjustZoom(-1), [adjustZoom]);

  const handleMapLayout = useCallback(({ nativeEvent }: { nativeEvent: { layout: LayoutRectangle } }) => {
    setMapLayout(nativeEvent.layout);
    hasFitToCoords.current = false;
  }, []);

  const handleHoleChange = useCallback(
    (direction: -1 | 1) => {
      const nextHole = Math.max(1, activeHole + direction);
      if (nextHole === activeHole) {
        return;
      }
      void loadHole(nextHole);
    },
    [activeHole, loadHole],
  );

  const handleStartRound = useCallback(() => {
    console.log("Start round tapped");
  }, []);

  const targetSecondaryLabel = useMemo(() => {
    if (targetDistance == null) {
      return "Long press to set a target";
    }

    const playsLike = Math.round(targetDistance * 0.95);
    return `Plays like ${playsLike}y 2W`;
  }, [targetDistance]);

  return (
    <View style={styles.container}>
      {initialRegion ? (
        <MapView
          ref={(ref) => {
            mapRef.current = ref;
          }}
          style={StyleSheet.absoluteFill}
          mapType="satellite"
          initialRegion={initialRegion}
          onLayout={handleMapLayout}
          onLongPress={handleLongPress}
        >
          {holeInfo ? (
            <>
              <Marker
                coordinate={toMapCoordinate(holeInfo.teePosition)}
                title="Tee"
                pinColor="#4FC3F7"
              />
              <Marker
                coordinate={toMapCoordinate(holeInfo.greenPosition)}
                title="Green"
                pinColor="#7CFC00"
              />
            </>
          ) : null}
          {targetPosition ? (
            <Marker
              coordinate={toMapCoordinate(targetPosition)}
              draggable
              onDragEnd={(event) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                const nextTarget: LatLng = { lat: latitude, lng: longitude };
                setTargetPosition(nextTarget);
              }}
              title="Target"
              pinColor="#FFFFFF"
            />
          ) : null}
          {lineCoordinates.length >= 2 ? (
            <Polyline
              coordinates={lineCoordinates}
              strokeColor="#FFFFFF"
              strokeWidth={2}
              lineDashPattern={[1]}
            />
          ) : null}
        </MapView>
      ) : null}

      {holeInfo ? (
        <HoleHeader
          style={[styles.header, { marginTop: insets.top + 12 }]}
          holeNumber={activeHole}
          par={holeInfo.par}
          handicap={holeInfo.handicap}
          teeColor={holeInfo.teeColor}
          yardage={holeInfo.yardage}
          onBackPress={navigation?.goBack}
        />
      ) : null}

      <View style={[styles.toolsPanel, { top: insets.top + 120 }]}>
        <ToolsPanel onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </View>

      <DistanceBubble
        primaryDistanceYards={targetDistance ?? 0}
        secondaryLabel={targetSecondaryLabel}
        position={targetBubblePosition}
        align="left"
      />

      <DistanceBubble
        primaryDistanceYards={approachDistance ?? 0}
        secondaryLabel={targetPosition ? "To green" : "Tee to green"}
        position={greenBubblePosition}
        align="right"
      />

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.holeSelector}>
          <TouchableOpacity onPress={() => handleHoleChange(-1)} style={styles.holeChevron}>
            <Text style={styles.holeChevronText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.holeSelectorText}>{`Hole ${activeHole}`}</Text>
          <TouchableOpacity onPress={() => handleHoleChange(1)} style={styles.holeChevron}>
            <Text style={styles.holeChevronText}>{">"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleStartRound}>
          <Text style={styles.startButtonText}>Start a Round</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
  },
  toolsPanel: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  holeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.8)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  holeSelectorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  holeChevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  holeChevronText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  startButton: {
    width: "100%",
    backgroundColor: "#1E88E5",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

export default HoleMapScreen;
