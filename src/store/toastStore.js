import { create } from 'zustand';
import { playCoinSound, playClickSound, vibrate } from '../utils/sfx';

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: ({
    id = crypto.randomUUID(),
    title,
    message,
    icon = '✨',
    type = 'info', // 'coin' | 'level' | 'equip' | 'streak' | 'quest' | 'success' | 'info'
    accent = 'purple', // 'purple' | 'emerald' | 'amber'
    duration = 3000,
  }) => {
    // Sound & haptic triggers according to type
    if (type === 'coin' || type === 'streak' || type === 'quest' || type === 'level') {
      playCoinSound();
      vibrate(50);
    } else if (type === 'equip') {
      playClickSound();
      vibrate(50);
    } else {
      vibrate(30);
    }

    const newToast = { id, title, message, icon, type, accent };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast], // limit to max 4 concurrent toasts
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

/**
 * Convenience helper functions to trigger toasts from anywhere in the codebase.
 */
export const toast = {
  // Player earns SC (+150 SC!)
  coin: (amount, reason = '') => {
    return useToastStore.getState().addToast({
      title: `+${typeof amount === 'number' ? amount.toLocaleString() : amount} SC!`,
      message: reason || 'SouL Coins added to your balance',
      icon: '🪙',
      type: 'coin',
      accent: 'amber',
    });
  },

  // Player levels up in SouL Pass
  levelUp: (newLevel) => {
    return useToastStore.getState().addToast({
      title: `SouL Pass Level Up!`,
      message: `You reached Season Tier ${newLevel}!`,
      icon: '⭐',
      type: 'level',
      accent: 'purple',
    });
  },

  // Player claims Daily Streak or Quests
  streak: (day, rewardText) => {
    return useToastStore.getState().addToast({
      title: `Day ${day} Streak Claimed!`,
      message: rewardText || 'Daily streak reward collected',
      icon: '🔥',
      type: 'streak',
      accent: 'amber',
    });
  },

  quest: (questDesc, scReward) => {
    return useToastStore.getState().addToast({
      title: `Quest Completed!`,
      message: `${questDesc} (+${scReward} SC)`,
      icon: '🎯',
      type: 'quest',
      accent: 'emerald',
    });
  },

  // Player equips an item from the SouL Store
  equip: (itemName, category) => {
    return useToastStore.getState().addToast({
      title: `Equipped ${itemName}`,
      message: `Active on your ${category || 'profile'}`,
      icon: '✨',
      type: 'equip',
      accent: 'purple',
    });
  },

  success: (title, message = '') => {
    return useToastStore.getState().addToast({
      title,
      message,
      icon: '✅',
      type: 'success',
      accent: 'emerald',
    });
  },

  info: (title, message = '') => {
    return useToastStore.getState().addToast({
      title,
      message,
      icon: 'ℹ️',
      type: 'info',
      accent: 'purple',
    });
  },
};
