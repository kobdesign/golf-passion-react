export type LatLng = { lat: number; lng: number };

export interface HoleInfo {
  holeNumber: number;
  par: number;
  handicap: number;
  teeColor: "White" | "Blue" | "Red";
  yardage: number;
  teePosition: LatLng;
  greenPosition: LatLng;
}

export interface HoleState {
  targetPosition: LatLng | null;
}

const mockCourse: Record<number, HoleInfo> = {
  1: {
    holeNumber: 1,
    par: 5,
    handicap: 7,
    teeColor: "Blue",
    yardage: 540,
    teePosition: { lat: 37.4219983, lng: -122.084 },
    greenPosition: { lat: 37.4235, lng: -122.0798 },
  },
  2: {
    holeNumber: 2,
    par: 4,
    handicap: 11,
    teeColor: "White",
    yardage: 410,
    teePosition: { lat: 37.4245, lng: -122.0815 },
    greenPosition: { lat: 37.426, lng: -122.0775 },
  },
};

export async function getHoleInfo(
  courseId: string,
  holeNumber: number,
): Promise<HoleInfo> {
  void courseId; // placeholder for future backend integration

  const holeInfo = mockCourse[holeNumber];
  if (!holeInfo) {
    return Promise.resolve(mockCourse[1]);
  }

  return Promise.resolve(holeInfo);
}

export async function getHoleState(
  roundId: string,
  holeNumber: number,
): Promise<HoleState> {
  void roundId;
  void holeNumber;

  return Promise.resolve({ targetPosition: null });
}

export async function saveTargetPosition(
  roundId: string,
  holeNumber: number,
  target: LatLng,
): Promise<void> {
  void roundId;
  void holeNumber;
  void target;

  return Promise.resolve();
}
