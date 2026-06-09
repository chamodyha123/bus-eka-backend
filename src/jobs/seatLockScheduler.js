const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function unlockExpiredSeats() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: "LOCKED",
        lockedAt: {
          lt: fiveMinutesAgo
        }
      }
    });

    for (const seat of expiredSeats) {
      await prisma.seat.update({
        where: { id: seat.id },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null
        }
      });
    }

    return expiredSeats.length;

  } catch (err) {
    console.error("Seat unlock job error:", err);
    return 0;
  }
};