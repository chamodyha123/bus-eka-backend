const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function combineDateAndTime(date, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const res = new Date(date);
  res.setHours(hours, minutes, 0, 0);
  return res;
}

async function main() {
  console.log("🌱 Starting Bus Eka database seed...");

  const defaultPassword = await bcrypt.hash("123456", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  // 1. CREATE ADMIN USER
  const admin = await prisma.user.upsert({
    where: { email: "admin@buseka.lk" },
    update: { password: adminPassword },
    create: {
      name: "System Administrator",
      email: "admin@buseka.lk",
      password: adminPassword,
      role: "admin"
    }
  });
  console.log(`✅ Admin account created/updated: ${admin.email}`);

  // 2. CREATE BUS OWNER USER & PROFILE
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@buseka.lk" },
    update: { password: defaultPassword },
    create: {
      name: "Kasun Perera (Lanka Express)",
      email: "owner@buseka.lk",
      password: defaultPassword,
      role: "owner"
    }
  });

  const owner = await prisma.owner.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      nic: "882341123V",
      companyName: "Lanka Express Transport Ltd"
    }
  });
  console.log(`✅ Owner account created: ${ownerUser.email}`);

  // 3. CREATE DRIVER USER & PROFILE
  const driverUser = await prisma.user.upsert({
    where: { email: "driver@buseka.lk" },
    update: { password: defaultPassword },
    create: {
      name: "Sunil Fernando",
      email: "driver@buseka.lk",
      password: defaultPassword,
      role: "driver"
    }
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: "B8493021",
      phoneNumber: "0771234567"
    }
  });
  console.log(`✅ Driver account created: ${driverUser.email}`);

  // 4. CREATE CONDUCTOR USER & PROFILE
  const conductorUser = await prisma.user.upsert({
    where: { email: "conductor@buseka.lk" },
    update: { password: defaultPassword },
    create: {
      name: "Kamal Silva",
      email: "conductor@buseka.lk",
      password: defaultPassword,
      role: "conductor"
    }
  });

  const conductor = await prisma.conductor.upsert({
    where: { userId: conductorUser.id },
    update: {},
    create: {
      userId: conductorUser.id,
      nic: "923112456V",
      phone: "0719876543"
    }
  });
  console.log(`✅ Conductor account created: ${conductorUser.email}`);

  // 5. CREATE PASSENGER USER
  const passengerUser = await prisma.user.upsert({
    where: { email: "passenger@buseka.lk" },
    update: { password: defaultPassword },
    create: {
      name: "Nimal Ranasinghe",
      email: "passenger@buseka.lk",
      password: defaultPassword,
      role: "passenger"
    }
  });
  console.log(`✅ Passenger account created: ${passengerUser.email}`);

  // 6. CREATE ROUTES
  const route1 = await prisma.route.upsert({
    where: { routePermitNumber: "NC-RP-001" },
    update: {},
    create: {
      routeNumber: "01",
      routePermitNumber: "NC-RP-001",
      startLocation: "Colombo Fort",
      endLocation: "Kandy",
      distanceKm: 115.5
    }
  });

  const route2 = await prisma.route.upsert({
    where: { routePermitNumber: "NC-RP-002" },
    update: {},
    create: {
      routeNumber: "02",
      routePermitNumber: "NC-RP-002",
      startLocation: "Colombo Fort",
      endLocation: "Galle",
      distanceKm: 119.0
    }
  });

  const route3 = await prisma.route.upsert({
    where: { routePermitNumber: "EX-RP-101" },
    update: {},
    create: {
      routeNumber: "EX-101",
      routePermitNumber: "EX-RP-101",
      startLocation: "Maharagama",
      endLocation: "Galle",
      distanceKm: 112.0
    }
  });
  console.log("✅ Routes seeded (Colombo-Kandy, Colombo-Galle, Express Maharagama-Galle)");

  // 7. CREATE BUSES
  const bus1 = await prisma.bus.upsert({
    where: { licensePlate: "ND-4521" },
    update: { ownerId: owner.id, routeId: route1.id },
    create: {
      licensePlate: "ND-4521",
      routePermitNumber: route1.routePermitNumber,
      busType: "Luxury AC",
      category: "Interprovincial Express",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      seatCount: 49,
      seatLayout: "2x2",
      routeId: route1.id,
      ownerId: owner.id
    }
  });

  const bus2 = await prisma.bus.upsert({
    where: { licensePlate: "WP-ND-8890" },
    update: { ownerId: owner.id, routeId: route2.id },
    create: {
      licensePlate: "WP-ND-8890",
      routePermitNumber: route2.routePermitNumber,
      busType: "Super Luxury Semi-Sleeper",
      category: "Highway Express",
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
      seatCount: 40,
      seatLayout: "2x2",
      routeId: route2.id,
      ownerId: owner.id
    }
  });

  // Assign staff to bus1
  await prisma.driver.update({
    where: { id: driver.id },
    data: { busId: bus1.id }
  });
  await prisma.conductor.update({
    where: { id: conductor.id },
    data: { busId: bus1.id }
  });
  console.log("✅ Buses & Staff Assignments seeded");

  // 8. CREATE TRIP TEMPLATES (RECURRING SCHEDULES)
  const template1 = await prisma.tripTemplate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      busId: bus1.id,
      routeId: route1.id,
      departureCity: "Colombo Fort",
      arrivalCity: "Kandy",
      departureTime: "06:30",
      arrivalTime: "09:45",
      price: 1250,
      activeDays: "MON,TUE,WED,THU,FRI,SAT,SUN",
      isActive: true
    }
  });

  const template2 = await prisma.tripTemplate.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      busId: bus1.id,
      routeId: route1.id,
      departureCity: "Kandy",
      arrivalCity: "Colombo Fort",
      departureTime: "14:00",
      arrivalTime: "17:15",
      price: 1250,
      activeDays: "MON,TUE,WED,THU,FRI,SAT,SUN",
      isActive: true
    }
  });

  const template3 = await prisma.tripTemplate.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      busId: bus2.id,
      routeId: route2.id,
      departureCity: "Colombo Fort",
      arrivalCity: "Galle",
      departureTime: "07:15",
      arrivalTime: "09:30",
      price: 1400,
      activeDays: "MON,TUE,WED,THU,FRI,SAT,SUN",
      isActive: true
    }
  });
  console.log("✅ Trip Templates (Schedules) seeded");

  // 9. GENERATE TRIPS FOR TODAY & NEXT FEW DAYS
  const today = startOfToday();
  const daysToGenerate = [0, 1, 2];

  for (const dayOffset of daysToGenerate) {
    const tripDate = new Date(today);
    tripDate.setDate(tripDate.getDate() + dayOffset);
    const dateStr = tripDate.toISOString().slice(0, 10).replaceAll("-", "");

    // Trip 1 (Colombo -> Kandy)
    const trip1Code = `TRIP-1-${dateStr}`;
    const depTime1 = combineDateAndTime(tripDate, "06:30");
    const arrTime1 = combineDateAndTime(tripDate, "09:45");

    const trip1 = await prisma.trip.upsert({
      where: { tripCode: trip1Code },
      update: {},
      create: {
        tripCode: trip1Code,
        tripDate,
        busId: bus1.id,
        routeId: route1.id,
        templateId: template1.id,
        departureCity: "Colombo Fort",
        arrivalCity: "Kandy",
        departureTime: depTime1,
        arrivalTime: arrTime1,
        price: 1250,
        status: "ACTIVE",
        isActive: true
      }
    });

    // Create 49 seats for trip1 if not exists
    const existingSeats1 = await prisma.seat.count({ where: { tripId: trip1.id } });
    if (existingSeats1 === 0) {
      const seatsToCreate = [];
      for (let i = 1; i <= 49; i++) {
        seatsToCreate.push({
          seatNumber: `S${i}`,
          status: "AVAILABLE",
          busId: bus1.id,
          tripId: trip1.id
        });
      }
      await prisma.seat.createMany({ data: seatsToCreate });
    }

    // Trip 2 (Kandy -> Colombo)
    const trip2Code = `TRIP-2-${dateStr}`;
    const depTime2 = combineDateAndTime(tripDate, "14:00");
    const arrTime2 = combineDateAndTime(tripDate, "17:15");

    const trip2 = await prisma.trip.upsert({
      where: { tripCode: trip2Code },
      update: {},
      create: {
        tripCode: trip2Code,
        tripDate,
        busId: bus1.id,
        routeId: route1.id,
        templateId: template2.id,
        departureCity: "Kandy",
        arrivalCity: "Colombo Fort",
        departureTime: depTime2,
        arrivalTime: arrTime2,
        price: 1250,
        status: "ACTIVE",
        isActive: true
      }
    });

    const existingSeats2 = await prisma.seat.count({ where: { tripId: trip2.id } });
    if (existingSeats2 === 0) {
      const seatsToCreate = [];
      for (let i = 1; i <= 49; i++) {
        seatsToCreate.push({
          seatNumber: `S${i}`,
          status: "AVAILABLE",
          busId: bus1.id,
          tripId: trip2.id
        });
      }
      await prisma.seat.createMany({ data: seatsToCreate });
    }

    // Trip 3 (Colombo -> Galle)
    const trip3Code = `TRIP-3-${dateStr}`;
    const depTime3 = combineDateAndTime(tripDate, "07:15");
    const arrTime3 = combineDateAndTime(tripDate, "09:30");

    const trip3 = await prisma.trip.upsert({
      where: { tripCode: trip3Code },
      update: {},
      create: {
        tripCode: trip3Code,
        tripDate,
        busId: bus2.id,
        routeId: route2.id,
        templateId: template3.id,
        departureCity: "Colombo Fort",
        arrivalCity: "Galle",
        departureTime: depTime3,
        arrivalTime: arrTime3,
        price: 1400,
        status: "ACTIVE",
        isActive: true
      }
    });

    const existingSeats3 = await prisma.seat.count({ where: { tripId: trip3.id } });
    if (existingSeats3 === 0) {
      const seatsToCreate = [];
      for (let i = 1; i <= 40; i++) {
        seatsToCreate.push({
          seatNumber: `S${i}`,
          status: "AVAILABLE",
          busId: bus2.id,
          tripId: trip3.id
        });
      }
      await prisma.seat.createMany({ data: seatsToCreate });
    }
  }

  console.log("✅ Generated active trips & seats for today and upcoming dates");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });