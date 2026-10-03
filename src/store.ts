import AsyncStorage from "@react-native-async-storage/async-storage";
import { isoDate, parseWalk, type WalkState } from "./walk";

const KEY = "we-walked-v1";

export async function loadWalk(): Promise<WalkState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseWalk(raw, isoDate(new Date()));
}

export async function saveWalk(state: WalkState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
