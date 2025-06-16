import { create } from "zustand";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notif) => set((state) => ({ notifications: [notif, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] })
}));

// Listen for real-time updates
socket.on("receiveNotification", (notif) => {
  useNotificationStore.getState().addNotification(notif);
});
