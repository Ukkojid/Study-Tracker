// import { io } from "socket.io-client";

// // Change this to your backend WebSocket URL
// const SOCKET_SERVER_URL = "http://localhost:5000";

// const socket = io(SOCKET_SERVER_URL, {
//   transports: ["websocket"], // Use WebSocket transport
//   withCredentials: true, // Send credentials if needed
//   reconnectionAttempts: 5, // Retry connection
// });

// socket.on("connect", () => {
//   console.log("Connected to socket server!", socket.id);
// });

// export default socket;



import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnectionAttempts: 5, // Retry connection up to 5 times
});
  
const useRevisionStore = create((set, get) => ({
  revisions: [],

  setRevisions: (data) => set({ revisions: data }),

  markCompleted: (id) => {
    set((state) => ({
      revisions: state.revisions.map((rev) =>
        rev.id === id ? { ...rev, status: "Completed" } : rev
      ),
    }));
    socket.emit("updateRevision", { id, status: "Completed" });
  },

  rescheduleRevision: (id, newDate) => {
    set((state) => ({
      revisions: state.revisions.map((rev) =>
        rev.id === id ? { ...rev, dueDate: newDate } : rev
      ),
    }));
    socket.emit("updateRevision", { id, dueDate: newDate });
  },

  deleteRevision: (id) => {
    set((state) => ({
      revisions: state.revisions.filter((rev) => rev.id !== id),
    }));
    socket.emit("deleteRevision", id);
  },
}));

// Listen for real-time updates
socket.on("revisionsUpdated", (data) => {
  useRevisionStore.setState({ revisions: data });
});

export default useRevisionStore;
