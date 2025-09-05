import request from 'supertest';
import { app } from '../server';
import { connectDB, disconnectDB } from '../utils/database';
import User from '../models/User';
import Class from '../models/Class';
import bcrypt from 'bcryptjs';

describe('Classes Routes', () => {
  let adminToken: string;
  let memberToken: string;
  let trainerToken: string;
  let adminId: string;
  let trainerId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Class.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@test.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    // Create trainer user
    const trainerPassword = await bcrypt.hash('trainer123', 12);
    const trainer = await User.create({
      email: 'trainer@test.com',
      password: trainerPassword,
      firstName: 'Trainer',
      lastName: 'User',
      role: 'trainer',
      status: 'active',
      isEmailVerified: true
    });
    trainerId = trainer._id.toString();

    // Create member user
    const memberPassword = await bcrypt.hash('member123', 12);
    await User.create({
      email: 'member@test.com',
      password: memberPassword,
      firstName: 'Member',
      lastName: 'User',
      role: 'member',
      status: 'active',
      isEmailVerified: true
    });

    // Login users and get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const trainerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'trainer@test.com', password: 'trainer123' });
    trainerToken = trainerLogin.body.data.token;

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@test.com', password: 'member123' });
    memberToken = memberLogin.body.data.token;
  });

  describe('GET /api/classes', () => {
    beforeEach(async () => {
      // Create test classes
      await Class.create([
        {
          name: 'Morning Yoga',
          description: 'Start your day with yoga',
          type: 'yoga',
          trainerId: trainerId,
          maxCapacity: 20,
          duration: 60,
          price: 15,
          status: 'active',
          schedule: [{
            dayOfWeek: 1,
            startTime: '07:00',
            endTime: '08:00',
            isRecurring: true
          }],
          location: {
            room: 'Yoga Studio A',
            floor: 2,
            building: 'Main Building'
          },
          requirements: ['Yoga mat'],
          equipment: ['Yoga mats', 'Blocks'],
          difficulty: 'beginner',
          tags: ['yoga', 'morning'],
          isBookable: true,
          cancellationPolicy: {
            hoursBeforeClass: 24,
            refundPercentage: 100
          }
        },
        {
          name: 'HIIT Cardio',
          description: 'High intensity cardio workout',
          type: 'cardio',
          trainerId: trainerId,
          maxCapacity: 15,
          duration: 45,
          price: 20,
          status: 'active',
          schedule: [{
            dayOfWeek: 1,
            startTime: '18:00',
            endTime: '18:45',
            isRecurring: true
          }],
          location: {
            room: 'Cardio Studio',
            floor: 1,
            building: 'Main Building'
          },
          requirements: ['Water bottle', 'Towel'],
          equipment: ['Treadmills', 'Bikes'],
          difficulty: 'intermediate',
          tags: ['hiit', 'cardio'],
          isBookable: true,
          cancellationPolicy: {
            hoursBeforeClass: 12,
            refundPercentage: 80
          }
        }
      ]);
    });

    it('should get all classes', async () => {
      const response = await request(app)
        .get('/api/classes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toHaveLength(2);
      expect(response.body.data.classes[0].name).toBe('Morning Yoga');
    });

    it('should filter classes by type', async () => {
      const response = await request(app)
        .get('/api/classes?type=yoga')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toHaveLength(1);
      expect(response.body.data.classes[0].type).toBe('yoga');
    });

    it('should filter classes by status', async () => {
      const response = await request(app)
        .get('/api/classes?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toHaveLength(2);
      expect(response.body.data.classes.every((cls: any) => cls.status === 'active')).toBe(true);
    });
  });

  describe('POST /api/classes', () => {
    it('should create a new class as admin', async () => {
      const classData = {
        name: 'Evening Pilates',
        description: 'Relaxing pilates session',
        type: 'pilates',
        trainerId: trainerId,
        maxCapacity: 18,
        duration: 50,
        price: 18,
        status: 'active',
        schedule: [{
          dayOfWeek: 2,
          startTime: '19:00',
          endTime: '19:50',
          isRecurring: true
        }],
        location: {
          room: 'Pilates Studio',
          floor: 2,
          building: 'Main Building'
        },
        requirements: ['Pilates mat'],
        equipment: ['Pilates mats', 'Resistance bands'],
        difficulty: 'beginner',
        tags: ['pilates', 'evening'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class.name).toBe(classData.name);
      expect(response.body.data.class.type).toBe(classData.type);
    });

    it('should create a new class as trainer', async () => {
      const classData = {
        name: 'Strength Training',
        description: 'Build muscle and strength',
        type: 'strength',
        trainerId: trainerId,
        maxCapacity: 12,
        duration: 60,
        price: 25,
        status: 'active',
        schedule: [{
          dayOfWeek: 3,
          startTime: '19:00',
          endTime: '20:00',
          isRecurring: true
        }],
        location: {
          room: 'Weight Room',
          floor: 1,
          building: 'Main Building'
        },
        requirements: ['Water bottle', 'Towel'],
        equipment: ['Barbells', 'Dumbbells'],
        difficulty: 'intermediate',
        tags: ['strength', 'weights'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send(classData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class.name).toBe(classData.name);
    });

    it('should not create class as member', async () => {
      const classData = {
        name: 'Unauthorized Class',
        description: 'This should not be created',
        type: 'cardio',
        trainerId: trainerId,
        maxCapacity: 10,
        duration: 30,
        price: 10,
        status: 'active'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(classData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/classes/:id', () => {
    let classId: string;

    beforeEach(async () => {
      const newClass = await Class.create({
        name: 'Test Class',
        description: 'Test description',
        type: 'yoga',
        trainerId: trainerId,
        maxCapacity: 20,
        duration: 60,
        price: 15,
        status: 'active',
        schedule: [{
          dayOfWeek: 1,
          startTime: '07:00',
          endTime: '08:00',
          isRecurring: true
        }],
        location: {
          room: 'Test Room',
          floor: 1,
          building: 'Test Building'
        },
        requirements: ['Test requirement'],
        equipment: ['Test equipment'],
        difficulty: 'beginner',
        tags: ['test'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      });
      classId = newClass._id.toString();
    });

    it('should get class by id', async () => {
      const response = await request(app)
        .get(`/api/classes/${classId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class._id).toBe(classId);
      expect(response.body.data.class.name).toBe('Test Class');
    });

    it('should return 404 for non-existent class', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/classes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/classes/:id', () => {
    let classId: string;

    beforeEach(async () => {
      const newClass = await Class.create({
        name: 'Test Class',
        description: 'Test description',
        type: 'yoga',
        trainerId: trainerId,
        maxCapacity: 20,
        duration: 60,
        price: 15,
        status: 'active',
        schedule: [{
          dayOfWeek: 1,
          startTime: '07:00',
          endTime: '08:00',
          isRecurring: true
        }],
        location: {
          room: 'Test Room',
          floor: 1,
          building: 'Test Building'
        },
        requirements: ['Test requirement'],
        equipment: ['Test equipment'],
        difficulty: 'beginner',
        tags: ['test'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      });
      classId = newClass._id.toString();
    });

    it('should update class as admin', async () => {
      const updateData = {
        name: 'Updated Test Class',
        price: 20
      };

      const response = await request(app)
        .put(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class.name).toBe(updateData.name);
      expect(response.body.data.class.price).toBe(updateData.price);
    });

    it('should update class as trainer', async () => {
      const updateData = {
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class.description).toBe(updateData.description);
    });

    it('should not update class as member', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('DELETE /api/classes/:id', () => {
    let classId: string;

    beforeEach(async () => {
      const newClass = await Class.create({
        name: 'Test Class',
        description: 'Test description',
        type: 'yoga',
        trainerId: trainerId,
        maxCapacity: 20,
        duration: 60,
        price: 15,
        status: 'active',
        schedule: [{
          dayOfWeek: 1,
          startTime: '07:00',
          endTime: '08:00',
          isRecurring: true
        }],
        location: {
          room: 'Test Room',
          floor: 1,
          building: 'Test Building'
        },
        requirements: ['Test requirement'],
        equipment: ['Test equipment'],
        difficulty: 'beginner',
        tags: ['test'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      });
      classId = newClass._id.toString();
    });

    it('should delete class as admin', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify class is deleted
      const getResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .expect(404);
      expect(getResponse.body.success).toBe(false);
    });

    it('should not delete class as trainer', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should not delete class as member', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });
});
