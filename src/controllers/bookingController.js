const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require("../utils/apiResponse");




// 📥 GET USER BOOKINGS
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        seats: true,
        trip: {
          include: {
            bus: true,
            route: true
          }
        }
      }
    });

    return successResponse(
      res,
      "Bookings fetched successfully",
      bookings
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};


// ❌ CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { seats: true }
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // RELEASE SEATS
    await prisma.seat.updateMany({
      where: {
        bookingId: booking.id
      },
      data: {
        status: "AVAILABLE",
        bookingId: null
      }
    });

    // UPDATE BOOKING STATUS
    await prisma.booking.update({
      where: {
        id: booking.id
      },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED"
      }
    });

    return successResponse(
      res,
      "Booking cancelled successfully",
      null
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ====================== CREATE BOOKING ======================
exports.createBooking = async (req, res) => {
  try {
    const { tripId, seatIds } = req.body;

    if (!seatIds || seatIds.length === 0) {
      return errorResponse(res, "No seats selected", 400);
    }

    // 1. CHECK TRIP EXISTS
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip) {
      return errorResponse(res, "Trip not found", 404);
    }

    // 2. CHECK SEATS VALIDITY
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds }
      }
    });

    if (seats.length !== seatIds.length) {
      return errorResponse(res, "Some seats not found", 404);
    }

    // 3. CHECK IF ANY SEAT ALREADY BOOKED
    const alreadyBooked = seats.filter(
      (s) => s.status === "BOOKED"
    );

    if (alreadyBooked.length > 0) {
      return errorResponse(
        res,
        "Some seats are already booked",
        400
      );
    }

    // 4. CALCULATE PRICE
    const totalAmount = trip.price * seatIds.length;

    // 5. CREATE BOOKING
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tripId,
        status: "PENDING",
        paymentStatus: "PENDING",
        totalAmount
      }
    });

    // 6. UPDATE SEATS (ASSIGN TO BOOKING)
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds }
      },
      data: {
        status: "BOOKED",
        bookingId: booking.id
      }
    });

    // 7. FETCH FULL BOOKING
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        seats: true,
        trip: {
          include: {
            bus: true,
            route: true
          }
        },
        user: true
      }
    });

    return successResponse(
      res,
      "Booking created successfully",
      fullBooking,
      201
    );

  } catch (err) {
    return errorResponse(res, err.message);
  }
};