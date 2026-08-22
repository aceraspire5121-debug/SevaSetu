let ioInstance;

const initBookingSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room by User ID (customer, worker, or admin)
    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    // Join room by Society ID
    socket.on('join_society', (societyId) => {
      if (societyId) {
        socket.join(`society_${societyId}`);
        console.log(`Socket joined society room: society_${societyId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const notifyBookingUpdate = (booking) => {
  if (!ioInstance) return;
  // Notify customer
  if (booking.customer) {
    const custId = booking.customer._id ? booking.customer._id.toString() : booking.customer.toString();
    ioInstance.to(custId).emit('booking_status_changed', booking);
  }
  // Notify worker
  if (booking.worker) {
    const workerId = booking.worker._id ? booking.worker._id.toString() : booking.worker.toString();
    ioInstance.to(workerId).emit('booking_status_changed', booking);
  }
};

const notifyNewBooking = (booking) => {
  if (!ioInstance) return;
  if (booking.worker) {
    const workerId = booking.worker._id ? booking.worker._id.toString() : booking.worker.toString();
    ioInstance.to(workerId).emit('new_booking_request', booking);
  }
};

module.exports = {
  initBookingSocket,
  notifyBookingUpdate,
  notifyNewBooking,
};
