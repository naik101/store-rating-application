const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

let adminToken = '';
let userToken = '';
let ownerToken = '';
let sampleStoreId = '';

beforeAll(async () => {
  // Login as admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@storerating.com', password: 'Admin@12345' });
  adminToken = adminRes.body.data.token;

  // Login as normal user
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@storerating.com', password: 'User@12345' });
  userToken = userRes.body.data.token;

  // Login as store owner
  const ownerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'owner@storerating.com', password: 'Owner@12345' });
  ownerToken = ownerRes.body.data.token;

  // Fetch sample store
  const storeRes = await request(app).get('/api/stores');
  sampleStoreId = storeRes.body.data.stores[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('1. Mandatory Validations & Authentication', () => {
  test('Rejects registration if name is less than 20 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Name',
      email: 'shortname@example.com',
      password: 'ValidPassword@123',
      address: '123 Valid Address Way, Suite 100',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 20 and 60 characters/i);
  });

  test('Rejects registration if name exceeds 60 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'This name is intentionally extremely long and exceeds the sixty character limit completely',
      email: 'toolongname@example.com',
      password: 'ValidPassword@123',
      address: '123 Valid Address Way, Suite 100',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 20 and 60 characters/i);
  });

  test('Rejects password lacking special character or uppercase', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Standard Valid Full Name Length',
      email: 'badpassword@example.com',
      password: 'alllowercase123',
      address: '123 Valid Address Way, Suite 100',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uppercase.*special character/i);
  });

  test('Rejects password outside 8-16 character limit', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Standard Valid Full Name Length',
      email: 'badpasslen@example.com',
      password: 'Ab@1', // 4 characters
      address: '123 Valid Address Way, Suite 100',
    });
    expect(res.status).toBe(400);
  });

  test('Rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Standard Valid Full Name Length',
      email: 'not-an-email',
      password: 'ValidPassword@123',
      address: '123 Valid Address Way, Suite 100',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test('Successful registration with all valid mandatory fields', async () => {
    const uniqueEmail = `newuser.${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Newly Registered Regular Customer',
      email: uniqueEmail,
      password: 'ValidPass#123',
      address: '500 Innovation Parkway, Suite 300, Austin, TX 78701',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.token).toBeDefined();
  });
});

describe('2. Role-Based Access Control', () => {
  test('Normal user cannot access admin dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('Unauthenticated user cannot access admin routes', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  test('Admin can access dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeGreaterThan(0);
    expect(res.body.data.totalStores).toBeGreaterThan(0);
  });
});

describe('3. Admin Features (Users, Stores, Ratings)', () => {
  test('Admin can list users with sorting and search', async () => {
    const res = await request(app)
      .get('/api/admin/users?sortBy=name&order=asc&role=USER')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  test('Admin can add a new store with owner', async () => {
    const uniqueEmail = `store.${Date.now()}@freshgrocer.com`;
    const res = await request(app)
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Fresh Organic Grocery Market',
        email: uniqueEmail,
        address: '888 Green Valley Parkway, Boulder, CO 80302',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.store.name).toBe('Fresh Organic Grocery Market');
  });

  test('Admin can view store owner rating information', async () => {
    const res = await request(app)
      .get('/api/admin/owner-ratings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.owners)).toBe(true);
  });
});

describe('4. Store Ratings (Submit, Modify, 1-5 Validation)', () => {
  test('Rejects rating below 1', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ storeId: sampleStoreId, rating: 0 });
    expect(res.status).toBe(400);
  });

  test('Rejects rating above 5', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ storeId: sampleStoreId, rating: 6 });
    expect(res.status).toBe(400);
  });

  test('Normal user can submit a rating', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ storeId: sampleStoreId, rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
  });

  test('Normal user can modify their previously submitted rating', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ storeId: sampleStoreId, rating: 3 });
    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(3);
  });
});

describe('5. Store Owner Dashboard', () => {
  test('Store owner can view their store ratings and rating users', async () => {
    const res = await request(app)
      .get('/api/owner/dashboard')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.stores)).toBe(true);
    if (res.body.data.stores.length > 0) {
      expect(res.body.data.stores[0].averageRating).toBeDefined();
      expect(Array.isArray(res.body.data.stores[0].ratings)).toBe(true);
    }
  });
});
