const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require("../utils/apiResponse");

// ======================================================
// CREATE BOOKING
// ======================================================
exports.createBooking = async (req, res) => {
  try {
    const { tripId, seatIds } = req.body;

    if (!tripId) {
      return errorResponse(res, "Trip ID is required", 400);
    }

    if (!seatIds || seatIds.length === 0) {
      return errorResponse(res, "No seats selected", 400);
    }

    // 1. CHECK TRIP EXISTS
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
      include: {
        bus: true,
        route: true
      }
    });

    if (!trip) {
      return errorResponse(res, "Trip not found", 404);
    }

    // 2. CHECK SEATS EXIST
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds.map((id) => parseInt(id)) }
      }
    });

    if (seats.length !== seatIds.length) {
      return errorResponse(res, "Some seats not found", 404);
    }

    // 3. CHECK SEATS BELONG TO SAME BUS AS TRIP
    const invalidSeats = seats.filter(
      (seat) => seat.busId !== trip.busId
    );

    if (invalidSeats.length > 0) {
      return errorResponse(
        res,
        "Some selected seats do not belong to this trip bus",
        400
      );
    }

    // 4. CHECK IF SEATS ARE AVAILABLE
    const unavailableSeats = seats.filter(
      (seat) => seat.status !== "AVAILABLE" && seat.status !== "LOCKED"
    );

    if (unavailableSeats.length > 0) {
      return errorResponse(
        res,
        "Some seats are already booked/unavailable",
        400
      );
    }

    // 5. CALCULATE TOTAL AMOUNT
    const totalAmount = Number(trip.price || 0) * seatIds.length;

    // 6. CREATE BOOKING
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tripId: parseInt(tripId),
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        totalAmount
      }
    });

    // 7. UPDATE SEATS -> BOOKED
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds.map((id) => parseInt(id)) }
      },
      data: {
        status: "BOOKED",
        bookingId: booking.id,
        lockedUntil: null
      }
    });

    // 8. FETCH FULL BOOKING DATA
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: true,
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
      "Booking created successfully",
      fullBooking,
      201
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ======================================================
// GET USER BOOKINGS
// ======================================================
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
      },
      orderBy: {
        id: "desc"
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

// ======================================================
// GET SINGLE BOOKING BY ID
// ======================================================
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: true,
        seats: true,
        trip: {
          include: {
            bus: true,
            route: true
          }
        }
      }
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    return successResponse(
      res,
      "Booking fetched successfully",
      booking
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ======================================================
// CANCEL BOOKING
// ======================================================
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: {
        id: parseInt(bookingId)
      },
      include: {
        seats: true
      }
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    if (booking.status === "CANCELLED") {
      return errorResponse(res, "Booking already cancelled", 400);
    }

    // RELEASE SEATS
    await prisma.seat.updateMany({
      where: {
        bookingId: booking.id
      },
      data: {
        status: "AVAILABLE",
        bookingId: null,
        lockedUntil: null
      }
    });

    // UPDATE BOOKING STATUS
    const updatedBooking = await prisma.booking.update({
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
      updatedBooking
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
};