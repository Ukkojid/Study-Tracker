const io = require("socket.io")(5000, {
    cors: { origin: "http://localhost:3000" }
  });
  const Notification = require("./models/Notification"); // MongoDB Model
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    // Send real-time notifications
    socket.on("sendNotification", async (data) => {
      const newNotification = new Notification(data);
      await newNotification.save();
  
      io.emit("receiveNotification", data); // Broadcast to all users
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
  