const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Colombo";

const DAY_CODES = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

/**
 * Get date parts in the application timezone.
 *
 * Example:
 * Asia/Colombo
 * 2026-08-12 00:30
 * remains August 12 instead of becoming August 11
 * because of UTC conversion.
 */
function getDatePartsInTimezone(
  date = new Date(),
  timeZone = APP_TIMEZONE
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(new Date(date));

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day),
    weekday: result.weekday,
  };
}

/**
 * Create a YYYY-MM-DD string using the application timezone.
 *
 * Example:
 * 2026-08-12
 */
function getLocalDateString(
  date = new Date(),
  timeZone = APP_TIMEZONE
) {
  const parts = getDatePartsInTimezone(date, timeZone);

  return `${parts.year}-${String(parts.month).padStart(
    2,
    "0"
  )}-${String(parts.day).padStart(2, "0")}`;
}

/**
 * Get day code:
 *
 * SUN
 * MON
 * TUE
 * ...
 */
function getDayCode(
  date = new Date(),
  timeZone = APP_TIMEZONE
) {
  const parts = getDatePartsInTimezone(date, timeZone);

  const weekdayMap = {
    Sun: "SUN",
    Mon: "MON",
    Tue: "TUE",
    Wed: "WED",
    Thu: "THU",
    Fri: "FRI",
    Sat: "SAT",
  };

  return weekdayMap[parts.weekday];
}

/**
 * Start of local day.
 *
 * IMPORTANT:
 * This creates a Date representing midnight
 * in the configured application timezone.
 */
function startOfLocalDay(value = new Date()) {
  const dateString = getLocalDateString(value);

  /**
   * We use noon UTC to safely represent the local
   * calendar date without accidentally moving it
   * to the previous/next day during date conversion.
   */
  return new Date(`${dateString}T00:00:00+05:30`);
}

/**
 * Combine a local date with HH:mm.
 *
 * Example:
 *
 * date = 2026-08-12
 * time = 08:30
 *
 * returns:
 * 2026-08-12T08:30:00+05:30
 */
function combineDateAndTime(date, timeString) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(
    String(timeString || "")
  );

  if (!match) {
    throw new Error(
      `Invalid time '${timeString}'. Expected HH:mm.`
    );
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(
      `Invalid time '${timeString}'. Expected HH:mm.`
    );
  }

  const dateString = getLocalDateString(date);

  return new Date(
    `${dateString}T${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:00+05:30`
  );
}

/**
 * Check whether a template operates on a specific day.
 */
function isTemplateActiveOnDate(template, date) {
  if (!template || !template.isActive) {
    return false;
  }

  const activeDays = String(
    template.activeDays ||
      "MON,TUE,WED,THU,FRI,SAT,SUN"
  )
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);

  const dayCode = getDayCode(date);

  return activeDays.includes(dayCode);
}

/**
 * Build unique trip code.
 *
 * Example:
 *
 * TRIP-1-20260812
 */
function buildTripCode(templateId, date) {
  const dateString = getLocalDateString(date);

  const compactDate = dateString.replaceAll("-", "");

  return `TRIP-${templateId}-${compactDate}`;
}

/**
 * Generate one trip for one template and date.
 */
async function generateTripForTemplate(
  template,
  date = new Date()
) {
  if (!template) {
    throw new Error("Trip template is required.");
  }

  const tripDate = startOfLocalDay(date);

  const localDate = getLocalDateString(date);

  console.log(
    `🔎 Processing template ${template.id} for ${localDate}`
  );

  /**
   * Check whether template is active today.
   */
  if (!isTemplateActiveOnDate(template, date)) {
    console.log(
      `⏭️ Template ${template.id} does not operate on ${localDate}`
    );

    return null;
  }

  /**
   * First check by template + trip date.
   *
   * This prevents duplicate trips.
   */
  const existingTrip = await prisma.trip.findFirst({
    where: {
      templateId: template.id,
      tripDate: tripDate,
    },
  });

  if (existingTrip) {
    console.log(
      `♻️ Existing trip found: ${existingTrip.tripCode}`
    );

    return existingTrip;
  }

  /**
   * Create departure and arrival times.
   */
  const departureTime = combineDateAndTime(
    date,
    template.departureTime
  );

  let arrivalTime = combineDateAndTime(
    date,
    template.arrivalTime
  );

  /**
   * Overnight trip.
   *
   * Example:
   *
   * Departure: 23:30
   * Arrival:   01:30
   *
   * Arrival is the next day.
   */
  if (arrivalTime <= departureTime) {
    arrivalTime = new Date(
      arrivalTime.getTime() +
        24 * 60 * 60 * 1000
    );
  }

  const tripCode = buildTripCode(
    template.id,
    date
  );

  /**
   * IMPORTANT:
   *
   * tripCode is unique in Prisma.
   *
   * upsert prevents:
   *
   * Unique constraint failed on:
   * tripCode
   */
  const trip = await prisma.trip.upsert({
    where: {
      tripCode,
    },

    update: {},

    create: {
      tripCode,

      tripDate,

      busId: template.busId,

      routeId: template.routeId,

      templateId: template.id,

      departureCity: template.departureCity,

      arrivalCity: template.arrivalCity,

      departureTime,

      arrivalTime,

      price: template.price,

      status: "ACTIVE",

      isActive: true,
    },
  });

  console.log(
    `✅ Trip ready: ${trip.tripCode}`
  );

  return trip;
}

/**
 * Generate trips for a specific date.
 */
async function generateTripsForDate(
  date = new Date()
) {
  const localDate = getLocalDateString(date);

  console.log(
    `🚌 Generating trips for ${new Date(
      date
    ).toDateString()}...`
  );

  console.log(
    `🌍 Application timezone: ${APP_TIMEZONE}`
  );

  console.log(
    `📅 Local trip date: ${localDate}`
  );

  const templates =
    await prisma.tripTemplate.findMany({
      where: {
        isActive: true,
      },
    });

  console.log(
    `📋 Found ${templates.length} active trip template(s).`
  );

  const results = [];

  for (const template of templates) {
    try {
      const trip =
        await generateTripForTemplate(
          template,
          date
        );

      if (trip) {
        results.push(trip);
      }
    } catch (error) {
      console.error(
        `❌ Failed to generate trip for template ${template.id}:`,
        error.message
      );
    }
  }

  console.log(
    `🎯 Trip generation completed. ${results.length} trip(s) processed.`
  );

  return results;
}

/**
 * Generate today's trips.
 */
async function generateTripsForToday() {
  return generateTripsForDate(new Date());
}

/**
 * Close Prisma connection.
 */
async function disconnectPrisma() {
  await prisma.$disconnect();
}

module.exports = {
  startOfLocalDay,
  combineDateAndTime,
  isTemplateActiveOnDate,
  buildTripCode,
  generateTripForTemplate,
  generateTripsForDate,
  generateTripsForToday,
  disconnectPrisma,
};