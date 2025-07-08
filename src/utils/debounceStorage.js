// src/utils/debounceStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debounceStorage = (() => {
    const timers = {};

    return (key, value, delay = 500) => {
        if (timers[key]) {
            clearTimeout(timers[key]);
        }
        timers[key] = setTimeout(async () => {
            try {
                await AsyncStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(`Failed to save ${key} to AsyncStorage:`, error);
            }
        }, delay);
    };
})();