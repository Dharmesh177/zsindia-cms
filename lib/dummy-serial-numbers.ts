import { SerialNumber } from './api';

export const dummySerialNumbers: SerialNumber[] = [
  {
    _id: '1',
    serialNumber: 'ZSIN-A1B2-C3D4-E5F6',
    productId: '1',
    isVerified: true,
    verifiedAt: '2024-01-15T10:30:00Z',
    verifiedCount: 3,
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
    batchNumber: 'BATCH-2024-01',
  },
  {
    _id: '2',
    serialNumber: 'ZSIN-B2C3-D4E5-F6G7',
    productId: '1',
    isVerified: true,
    verifiedAt: '2024-01-16T14:20:00Z',
    verifiedCount: 1,
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
    batchNumber: 'BATCH-2024-01',
  },
  {
    _id: '3',
    serialNumber: 'ZSIN-C3D4-E5F6-G7H8',
    productId: '1',
    isVerified: false,
    verifiedCount: 0,
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
    batchNumber: 'BATCH-2024-01',
  },
  {
    _id: '4',
    serialNumber: 'ZSIN-D4E5-F6G7-H8I9',
    productId: '1',
    isVerified: true,
    verifiedAt: '2024-01-14T09:15:00Z',
    verifiedCount: 5,
    status: 'deactivated',
    createdAt: '2024-01-10T08:00:00Z',
    batchNumber: 'BATCH-2024-01',
  },
  {
    _id: '5',
    serialNumber: 'ZSIN-E5F6-G7H8-I9J0',
    productId: '2',
    isVerified: true,
    verifiedAt: '2024-01-18T11:45:00Z',
    verifiedCount: 2,
    status: 'active',
    createdAt: '2024-01-12T10:00:00Z',
    batchNumber: 'BATCH-2024-02',
  },
  {
    _id: '6',
    serialNumber: 'ZSIN-F6G7-H8I9-J0K1',
    productId: '2',
    isVerified: false,
    verifiedCount: 0,
    status: 'active',
    createdAt: '2024-01-12T10:00:00Z',
    batchNumber: 'BATCH-2024-02',
  },
];

// Helper to generate dummy serial numbers
export function generateDummySerialNumbers(productId: string, quantity: number, batchNumber?: string): SerialNumber[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const newSerials: SerialNumber[] = [];

  for (let i = 0; i < quantity; i++) {
    const randomSerial = () => {
      let result = 'ZSIN-';
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 4; k++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (j < 2) result += '-';
      }
      return result;
    };

    newSerials.push({
      _id: `dummy-${Date.now()}-${i}`,
      serialNumber: randomSerial(),
      productId,
      isVerified: false,
      verifiedCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      batchNumber,
    });
  }

  return newSerials;
}
