const { PrismaClient } = require("@prisma/client");

// Singleton Prisma instance — prevents multiple connections in dev
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;
