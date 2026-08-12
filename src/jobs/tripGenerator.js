const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Colombo";

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getDatePartsInTimezone(date = new Date(), timeZone = APP_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(new Date(date));
  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") result[part.type] = part.value;
  }

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day),
    weekday: result.weekday,
  };
}

function getLocalDateString(date = new Date(), timeZone = APP_TIMEZONE) {
  const parts = getDatePartsInTimezone(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day
  ).padStart(2, "0")}`;
}

function getDayCode(date = new Date(), timeZone = APP_TIMEZONE) {
  const parts = getDatePartsInTimezone(date, timeZone);
  const map = {
    Sun: "SUN",
    Mon: "MON",
    Tue: "TUE",
    Wed: "WED",
    Thu: "THU",
    Fri: "FRI",
    Sat: "SAT",
  };
  return map[parts.weekday];
}

function startOfLocalDay(value = new Date()) {
  const dateString = getLocalDateString(value);
  return new Date(`${dateString}T00:00:00+05:30`);
}

function combineDateAndTime(date, timeString) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(timeString || ""));
  if (!match) throw new Error(`Invalid time '${timeString}'. Expected HH:mm.`);

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time '${timeString}'. Expected HH:mm.`);
  }

  const dateString = getLocalDateString(date);
  return new Date(
    `${dateString}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:00+05:30`
  );
}

function isTemplateActiveOnDate(template, date) {
  if (!template || !template.isActive) return false;

  const activeDays = String(
    template.activeDays || "MON,TUE,WED,THU,FRI,SAT,SUN"
  )
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);

  return activeDays.includes(getDayCode(date));
}

function buildTripCode(templateId, date) {
  return `TRIP-${templateId}-${getLocalDateString(date).replaceAll("-", "")}`;
}

async function generateTripForTemplate(template, date = new Date()) {
  if (!template) throw new Error("Trip template is required.");

  const localDate = getLocalDateString(date);
  if (!isTemplateActiveOnDate(template, date)) return null;

  const tripDate = startOfLocalDay(date);
  const tripCode = buildTripCode(template.id, date);

  const departureTime = combineDateAndTime(date, template.departureTime);
  let arrivalTime = combineDateAndTime(date, template.arrivalTime);

  if (arrivalTime <= departureTime) {
    arrivalTime = new Date(arrivalTime.getTime() + 24 * 60 * 60 * 1000);
  }

  // tripCode is the database-level idempotency key.
  // This is safe when the job runs at startup, on cron, or after a restart.
  const trip = await prisma.trip.upsert({
    where: { tripCode },
    update: {
      // Keep the generated trip synchronized with its current template.
      tripDate,
      busId: template.busId,
      routeId: template.routeId,
      templateId: template.id,
      departureCity: template.departureCity,
      arrivalCity: template.arrivalCity,
      departureTime,
      arrivalTime,
      price: template.price,
    },
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

  console.log(`✅ Trip ready: ${trip.tripCode} (${localDate})`);
  return trip;
}

async function generateTripsForDate(date = new Date()) {
  const localDate = getLocalDateString(date);
  console.log(`🚌 Generating trips for ${localDate} (${APP_TIMEZONE})...`);

  const templates = await prisma.tripTemplate.findMany({
    where: { isActive: true },
  });

  console.log(`📋 Found ${templates.length} active trip template(s).`);

  const results = [];
  for (const template of templates) {
    try {
      const trip = await generateTripForTemplate(template, date);
      if (trip) results.push(trip);
    } catch (error) {
      console.error(
        `❌ Failed to generate trip for template ${template.id}:`,
        error.message
      );
    }
  }

  console.log(`🎯 Trip generation completed. ${results.length} trip(s) processed.`);
  return results;
}

async function generateTripsForToday() {
  return generateTripsForDate(new Date());
}

async function disconnectPrisma() {
  await prisma.$disconnect();
}

module.exports = {
  DAY_CODES,
  getDatePartsInTimezone,
  getLocalDateString,
  getDayCode,
  startOfLocalDay,
  combineDateAndTime,
  isTemplateActiveOnDate,
  buildTripCode,
  generateTripForTemplate,
  generateTripsForDate,
  generateTripsForToday,
  disconnectPrisma,
};
