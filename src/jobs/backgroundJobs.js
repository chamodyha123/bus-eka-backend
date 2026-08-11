const cron = require("node-cron");

const {
  generateTripsForToday,
} = require("./tripGenerator");

/**
 * Start all background jobs.
 */
function startBackgroundJobs() {
  console.log("⏳ Starting background jobs...");

  /**
   * Generate today's trips when the server starts.
   */
  generateTripsForToday()
    .then(() => {
      console.log("✅ Initial trip generation completed.");
    })
    .catch((error) => {
      console.error(
        "❌ Failed to generate initial trips:",
        error
      );
    });

  /**
   * Run every day at 00:05.
   *
   * Sri Lankan timezone.
   */
  cron.schedule(
    "5 0 * * *",
    async () => {
      console.log(
        "⏰ Daily trip generation started..."
      );

      try {
        await generateTripsForToday();

        console.log(
          "✅ Daily trip generation completed."
        );
      } catch (error) {
        console.error(
          "❌ Daily trip generation failed:",
          error
        );
      }
    },
    {
      timezone: "Asia/Colombo",
    }
  );

  console.log(
    "📅 Daily trip generation scheduled for 00:05 Asia/Colombo."
  );
}

module.exports = {
  startBackgroundJobs,
};