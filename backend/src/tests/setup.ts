import { connectDB, disconnectDB } from '../utils/database';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await connectDB();
});

afterAll(async () => {
  // Disconnect from test database
  await disconnectDB();
});

// Increase timeout for database operations
jest.setTimeout(10000);
