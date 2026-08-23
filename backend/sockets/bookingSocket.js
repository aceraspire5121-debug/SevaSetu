const {
  toCleanKey,
  normalizeCityName,
  getCoordinatesForLocation,
  getDistanceKm,
  calculateEta,
  isSameCityCluster,
} = require('../utils/geoUtils');
const Worker = require('../models/Worker');
const User = require('../models/User');

let ioInstance;

const initBookingSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join room by User ID (customer or worker)
    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`[Socket] User ${userId} joined their personal room`);
      }
    });

    // Worker dynamic channel registration
    socket.on('join_worker_channel', (payload) => {
      if (!payload) return;
      const { userId, city, categories = [] } = payload;
      if (userId) {
        socket.join(userId.toString());
      }
      const cleanCity = normalizeCityName(city || 'Delhi');
      socket.join(`city_${cleanCity}`);

      categories.forEach((cat) => {
        const roomName = `room_${cleanCity}_${toCleanKey(cat)}`;
        socket.join(roomName);
      });
    });

    socket.on('disconnect', () => {});
  });
};

const notifyBookingUpdate = (booking) => {
  if (!ioInstance || !booking) return;

  // Notify customer
  if (booking.customer) {
    const custId = booking.customer._id
      ? booking.customer._id.toString()
      : booking.customer.toString();
    ioInstance.to(custId).emit('booking_status_changed', booking);
  }

  // Notify worker
  if (booking.worker) {
    const workerId = booking.worker._id
      ? booking.worker._id.toString()
      : booking.worker.toString();
    ioInstance.to(workerId).emit('booking_status_changed', booking);
  }
};

const notifyNewBooking = async (booking) => {
  if (!ioInstance || !booking) return;

  if (booking.worker) {
    // 1. Direct Assignment Booking: Target specific worker ID only
    const workerId = booking.worker._id
      ? booking.worker._id.toString()
      : booking.worker.toString();
    ioInstance.to(workerId).emit('new_booking_request', booking);
    return;
  }

  if (booking.isBroadcast) {
    try {
      const targetCategory = booking.category;
      const targetCity = normalizeCityName(booking.city || booking.address || 'Delhi');
      const [custLat, custLon] = getCoordinatesForLocation(
        `${booking.address || ''}, ${booking.city || ''}`
      );

      console.log(`\n======================================================`);
      console.log(`📡 [PROXIMITY DISPATCH ENGINE] New Broadcast Request`);
      console.log(`  Package: ${booking.packageTitle || booking.category}`);
      console.log(`  Target Locality: ${booking.address || ''}, ${booking.city || ''} (${targetCity.toUpperCase()})`);
      console.log(`  Required Skill: ${targetCategory}`);
      console.log(`======================================================`);

      // Find all approved workers who have this exact category
      const eligibleWorkers = await Worker.find({
        approvalStatus: 'approved',
        categories: { $in: [targetCategory] },
      }).populate('user').populate('society');

      // Filter strictly to workers whose city or society matches the booking city/cluster
      const matchedNearbyWorkers = eligibleWorkers.filter((w) => {
        if (!w.user) return false;
        const wCity = normalizeCityName(w.user.city || w.society?.city || '');
        const wAddress = (w.user.address || '').toLowerCase();
        const bCity = targetCity.toLowerCase();

        // Must match either exact city, address keyword, or same close regional cluster
        return (
          wCity === bCity ||
          wAddress.includes(bCity) ||
          isSameCityCluster(wCity, bCity)
        );
      });

      console.log(`🎯 Found ${matchedNearbyWorkers.length} Verified Nearby Workers matching [${targetCategory} in ${targetCity.toUpperCase()}]:`);

      const baseBookingObj = booking.toObject ? booking.toObject() : { ...booking };

      // Dispatch EXCLUSIVELY to these matched nearby workers
      matchedNearbyWorkers.forEach((w) => {
        const workerUserId = w.user._id.toString();
        const [workerLat, workerLon] = getCoordinatesForLocation(
          `${w.user.address || ''}, ${w.user.city || ''}`
        );
        const distanceKm = getDistanceKm(workerLat, workerLon, custLat, custLon);
        const estimatedEta = calculateEta(distanceKm);

        const enrichedForWorker = {
          ...baseBookingObj,
          distanceKm,
          estimatedEta,
          matchedCity: targetCity,
        };

        console.log(`  -> Sent to: ${w.user.name} (${w.user.city}) | 📍 ${distanceKm} km away | ETA: ${estimatedEta}`);

        // Emit exclusively to this worker's personal socket room
        ioInstance.to(workerUserId).emit('new_booking_request', enrichedForWorker);
      });

      console.log(`======================================================\n`);
    } catch (err) {
      console.error('❌ [Broadcast Dispatch Error]:', err.message);
    }
  }
};

module.exports = {
  initBookingSocket,
  notifyBookingUpdate,
  notifyNewBooking,
};
