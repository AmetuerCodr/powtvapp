import AsyncStorage from "@react-native-async-storage/async-storage";

// Dev-only fetch cache: first call hits network, everything after (hot
// reloads, full reloads) reads disk until TTL expires or clearDevCache().
// No-op in production builds.
const TTL = 1000 * 60 * 60 * 12; // ponytail: 12h TTL, call clearDevCache() for fresh data

export async function devCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (!__DEV__) return fetcher();
  console.log("running in dev mode")
  const raw = await AsyncStorage.getItem(`devcache:${key}`);
  if (raw) {
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t < TTL) {
      console.log(`[devCache] hit: ${key}`);
      return v as T;
    }
  }
  const v = await fetcher();
  await AsyncStorage.setItem(`devcache:${key}`, JSON.stringify({ t: Date.now(), v }));
  console.log(`[devCache] stored: ${key}`);
  return v;
}

export async function clearDevCache() {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith("devcache:"));
  await AsyncStorage.multiRemove(keys);
  console.log(`[devCache] cleared ${keys.length} entries`);
}
