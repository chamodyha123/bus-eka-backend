const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function startOfLocalDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function combineDateAndTime(date, timeString) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(timeString || ""));
  if (!match) throw new Error(`Invalid time '${timeString}'. Use HH:mm.`);
  const result = startOfLocalDay(date);
  result.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return result;
}

function isTemplateActiveOnDate(template, date) {
  if (!template.isActive) return false;
  const activeDays = String(template.activeDays || "MON,TUE,WED,THU,FRI,SAT,SUN")
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);
  return activeDays.includes(DAY_CODES[new Date(date).getDay()]);
}

function buildTripCode(templateId, date) {
  const day = startOfLocalDay(date).toISOString().slice(0, 10).replaceAll("-", "");
  return `TRIP-${templateId}-${day}`;
}

async function generateTripForTemplate(template, date = new Date()) {
  const tripDate = startOfLocalDay(date);
  if (!isTemplateActiveOnDate(template, tripDate)) return null;

  const existing = await prisma.trip.findFirst({
    where: { templateId: template.id, tripDate }
  });
  if (existing) return existing;

  const departureTime = combineDateAndTime(tripDate, template.departureTime);
  const arrivalTime = combineDateAndTime(tripDate, template.arrivalTime);
  if (arrivalTime <= departureTime) arrivalTime.setDate(arrivalTime.getDate() + 1);

  return prisma.trip.create({
    data: {
      tripCode: buildTripCode(template.id, tripDate),
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
      isActive: true
    }
  });
}

async function generateTripsForDate(date = new Date()) {
  const templates = await prisma.tripTemplate.findMany({ where: { isActive: true } });
  const results = [];
  for (const template of templates) {
    const trip = await generateTripForTemplate(template, date);
    if (trip) results.push(trip);
  }
  return results;
}

async function generateTripsForToday() {
  return generateTripsForDate(new Date());
}

module.exports = {
  combineDateAndTime,
  generateTripForTemplate,
  generateTripsForDate,
  generateTripsForToday,
  isTemplateActiveOnDate,
  startOfLocalDay
};
