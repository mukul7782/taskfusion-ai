// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Helper function to create a single instance
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Access the Node.js global object
const globalForPrisma = globalThis;

// Reuse an existing instance on `globalThis` if it exists, or create a new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

// In development, store the instance on `globalThis` so HMR reuses it
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}