const cron = require("node-cron");
const { generateTripsForToday } = require("../services/tripService");

async function runTripGeneration(reason) {
  const trips = await generateTripsForToday();
  console.log(`🚍 Trip generation (${reason}): ${trips.length} active trip(s) available for today`);
}

async function startTripGenerationJob() {
  // Catch up after restarts/deployments. Duplicate protection makes this safe.
  await runTripGeneration("startup");

  // Sri Lanka midnight, independent of the server's own timezone.
  cron.schedule("0 0 * * *", () => runTripGeneration("daily").catch(console.error), {
    timezone: process.env.APP_TIMEZONE || "Asia/Colombo"
  });
}

module.exports = { startTripGenerationJob };
