import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  clearWeek,
  countLabel,
  dayAfter,
  dayBefore,
  dayLine,
  dayName,
  hasProgress,
  isMarked,
  isoDate,
  markLabel,
  noteFor,
  toggleWalk,
  type WalkState,
} from "./src/walk";
import { loadWalk, saveWalk } from "./src/store";

export default function App() {
  const [state, setState] = useState<WalkState>(() => ({
    today: isoDate(new Date()),
    view: isoDate(new Date()),
    marks: [],
  }));
  const [note, setNote] = useState("Not yet.");
  const [ready, setReady] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let alive = true;
    loadWalk()
      .then((loaded) => {
        if (!alive) return;
        setState(loaded);
        setNote(hasProgress(loaded) ? "Saved walk loaded." : noteFor(loaded));
        setReady(true);
      })
      .catch(() => {
        if (alive) setNote("Could not read the walk.");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveWalk(state).catch(() => setNote("Could not save the walk."));
  }, [ready, state]);

  if (!ready && note === "Not yet.") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the walk</Text>
        </View>
      </SafeAreaView>
    );
  }

  function onToggle() {
    const result = toggleWalk(state);
    setState(result.state);
    setConfirmClear(false);
    setNote(result.note);
  }

  function onBefore() {
    const result = dayBefore(state);
    setState(result.state);
    setConfirmClear(false);
    setNote(result.note);
  }

  function onAfter() {
    const result = dayAfter(state);
    setState(result.state);
    setConfirmClear(false);
    setNote(result.note);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.title}>We Walked</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.pose}>{dayName(state.view)}</Text>
        <Text style={styles.line}>{dayLine(state.view)}</Text>
        <Text style={styles.status}>{countLabel(state)}</Text>
        <Text style={styles.status}>{markLabel(state)}</Text>
        <BigButton label="We walked" filled={isMarked(state)} onPress={onToggle} />
        <View style={styles.row}>
          <BigButton label="Day before" inRow onPress={onBefore} />
          <BigButton label="Day after" inRow onPress={onAfter} />
        </View>
        {confirmClear ? (
          <View style={styles.row}>
            <BigButton label="Confirm clear" filled inRow onPress={onConfirmClear} />
            <BigButton label="Cancel clear" inRow onPress={onCancelClear} />
          </View>
        ) : (
          <BigButton label="Clear week" onPress={() => setConfirmClear(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmClear() {
    const result = clearWeek(state);
    setState(result.state);
    setConfirmClear(false);
    setNote(result.note);
  }

  function onCancelClear() {
    setConfirmClear(false);
    setNote("Clear canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F3EA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#2C2416" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 6 },
  title: { fontSize: 32, fontWeight: "800", color: "#2C2416" },
  note: { fontSize: 18, color: "#5C4A32", minHeight: 24 },
  pose: { fontSize: 22, fontWeight: "700", color: "#2C2416" },
  line: { fontSize: 40, fontWeight: "800", color: "#B45309", lineHeight: 46 },
  status: { fontSize: 22, fontWeight: "800", color: "#2C2416", textAlign: "center" },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2C2416",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#2C2416" },
  buttonText: { fontSize: 20, fontWeight: "800", color: "#2C2416", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
