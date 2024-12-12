import request from 'supertest';
import App from '../app';
import { prisma } from '../config/prisma';

const appTest = new App().app;

describe('Connection & GET testing API', () => {
  beforeEach(() => {
    // digunakan untuk menyiapkan program yang ingin dijalankan sebelum menjalankan tiap point testing
  });

  beforeAll(async () => {
    // digunakan untuk menyiapkan program yang ingin di jalankan sebelum semua testing berlangsung
    // dijalankan sekali
    await prisma.$connect();
  });

  afterEach(() => {
    // digunakan untuk menyiapkan program yang ingin dijalankan sesudah menjalankan tiap point testing
  });

  afterAll(async () => {
    // digunakan untuk menyiapkan program yang ingin di jalankan sesudah semua testing berlangsung
    // dijalankan sekali
    await prisma.$disconnect();
  });

  // good case
  it('Should return welcome message from main route', async () => {
    const response = await request(appTest).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('ORM API');
  });
  // bad case
  it('Should return not found page', async () => {
    const response = await request(appTest).get('/article');

    expect(response.status).toBe(404);
  });

  // test sign in
  it('should sign in user acc', async () => {
    const response = await request(appTest).post('/users/signin').send({
      email: 'erklundmn@disqus.com',
      password: 'spasibapaka',
    });

    expect(response.body).toHaveProperty('token');
  });
});
