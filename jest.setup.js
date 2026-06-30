// Jest setup file for test environment configuration
/* eslint-disable no-undef */

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Set test environment variables
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:4000/api/v1';
