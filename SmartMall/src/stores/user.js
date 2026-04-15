import { computed, ref } from "vue";
import { defineStore } from "pinia";

const USER_STORAGE_KEY = "smart_user_profile";
const SCAN_HISTORY_PREFIX = "scanHistory_";

export const useUserStore = defineStore("user", () => {
  const userId = ref(null);
  const username = ref("");
  const phone = ref("");
  const allergies = ref([]);
  const dietPreferences = ref([]);
  const scanHistory = ref([]);

  const scanHistoryKey = computed(() =>
    userId.value ? `${SCAN_HISTORY_PREFIX}${userId.value}` : "",
  );

  const persistUserProfile = () => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        userId: userId.value,
        username: username.value,
        phone: phone.value,
        allergies: allergies.value,
        dietPreferences: dietPreferences.value,
      }),
    );
  };

  const loadScanHistory = () => {
    if (!scanHistoryKey.value) {
      scanHistory.value = [];
      return;
    }
    const stored = localStorage.getItem(scanHistoryKey.value);
    if (!stored) {
      scanHistory.value = [];
      return;
    }
    try {
      scanHistory.value = JSON.parse(stored);
    } catch {
      scanHistory.value = [];
    }
  };

  const persistScanHistory = () => {
    if (!scanHistoryKey.value) return;
    localStorage.setItem(scanHistoryKey.value, JSON.stringify(scanHistory.value));
  };

  const hydrateFromStorage = () => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      userId.value = parsed.userId ?? null;
      username.value = parsed.username ?? "";
      phone.value = parsed.phone ?? "";
      allergies.value = Array.isArray(parsed.allergies) ? parsed.allergies : [];
      dietPreferences.value = Array.isArray(parsed.dietPreferences)
        ? parsed.dietPreferences
        : [];
    } catch {
      userId.value = null;
      username.value = "";
      phone.value = "";
      allergies.value = [];
      dietPreferences.value = [];
    }
    loadScanHistory();
  };

  const setUser = ({ id, name, phoneNumber }) => {
    userId.value = id;
    username.value = name || "";
    phone.value = phoneNumber || "";
    persistUserProfile();
    loadScanHistory();
  };

  const clearUser = () => {
    const currentHistoryKey = scanHistoryKey.value;
    userId.value = null;
    username.value = "";
    phone.value = "";
    allergies.value = [];
    dietPreferences.value = [];
    scanHistory.value = [];
    if (currentHistoryKey) {
      localStorage.removeItem(currentHistoryKey);
    }
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const setAllergies = (list) => {
    allergies.value = Array.isArray(list) ? [...list] : [];
    persistUserProfile();
  };

  const setDietPreferences = (list) => {
    dietPreferences.value = Array.isArray(list) ? [...list] : [];
    persistUserProfile();
  };

  const addScanHistoryItem = ({ barcode, name }) => {
    if (!scanHistoryKey.value) return;
    scanHistory.value = scanHistory.value.filter((item) => item.barcode !== barcode);
    scanHistory.value.unshift({
      id: Date.now(),
      barcode,
      name,
      time: new Date().toLocaleString(),
    });
    if (scanHistory.value.length > 10) {
      scanHistory.value = scanHistory.value.slice(0, 10);
    }
    persistScanHistory();
  };

  const clearScanHistory = () => {
    scanHistory.value = [];
    if (scanHistoryKey.value) {
      localStorage.removeItem(scanHistoryKey.value);
    }
  };

  return {
    userId,
    username,
    phone,
    allergies,
    dietPreferences,
    scanHistory,
    scanHistoryKey,
    hydrateFromStorage,
    setUser,
    clearUser,
    setAllergies,
    setDietPreferences,
    addScanHistoryItem,
    clearScanHistory,
    loadScanHistory,
  };
});