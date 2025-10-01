const request = require('supertest');
const app = require('../server');

describe('Jira Seller API', () => {
  let authToken;
  let bookId;

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('running');
    });
  });

  describe('Seller Registration and Login', () => {
    it('should register a new seller', async () => {
      const sellerData = {
        name: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        businessInfo: {
          businessName: 'Test Bookstore',
          gstNumber: '12ABCDE1234F1Z5',
          panNumber: 'ABCDE1234F'
        },
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'Test Bank',
          accountHolderName: 'Test Seller'
        }
      };

      const res = await request(app)
        .post('/api/seller/register')
        .send(sellerData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('registered successfully');
      expect(res.body.token).toBeDefined();
    });

    it('should login seller', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/seller/login')
        .send(loginData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });
  });

  describe('Book Management', () => {
    it('should create a new book', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9780123456789',
        description: 'A test book description',
        category: 'Fiction',
        language: 'English',
        publisher: 'Test Publisher',
        publicationYear: 2023,
        pages: 200,
        format: 'Paperback',
        condition: 'New',
        price: 19.99,
        stock: 10,
        minStock: 2
      };

      const res = await request(app)
        .post('/api/seller/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.book.title).toBe('Test Book');
      bookId = res.body.book._id;
    });

    it('should get all books', async () => {
      const res = await request(app)
        .get('/api/seller/books')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.books).toBeInstanceOf(Array);
    });

    it('should get single book', async () => {
      const res = await request(app)
        .get(`/api/seller/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.book._id).toBe(bookId);
    });

    it('should update stock and price', async () => {
      const updateData = {
        stock: 15,
        price: 24.99,
        discount: 10
      };

      const res = await request(app)
        .put(`/api/seller/books/${bookId}/stock-price`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.book.stock).toBe(15);
      expect(res.body.book.price).toBe(24.99);
    });

    it('should delete book', async () => {
      const res = await request(app)
        .delete(`/api/seller/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for protected routes without token', async () => {
      const res = await request(app)
        .get('/api/seller/books')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/seller/books/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });
});
