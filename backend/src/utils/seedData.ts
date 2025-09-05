import mongoose from 'mongoose';
import User, { UserRole, UserStatus } from '../models/User';
import Class, { ClassType, ClassStatus } from '../models/Class';
import Subscription, { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '../models/Subscription';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Subscription.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const admin = new User({
      email: 'admin@gymapp.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'AC',
        zipCode: '12345',
        country: 'USA'
      }
    });
    await admin.save();
    console.log('✅ Admin user created');

    // Create trainer users
    const trainerPassword = await bcrypt.hash('trainer123', 12);
    const trainers = [];
    
    const trainer1 = new User({
      email: 'trainer1@gymapp.com',
      password: trainerPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      phone: '+1234567891',
      address: {
        street: '456 Trainer Ave',
        city: 'Trainer City',
        state: 'TC',
        zipCode: '12346',
        country: 'USA'
      }
    });
    await trainer1.save();
    trainers.push(trainer1);

    const trainer2 = new User({
      email: 'trainer2@gymapp.com',
      password: trainerPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      phone: '+1234567892',
      address: {
        street: '789 Fitness Blvd',
        city: 'Fitness City',
        state: 'FC',
        zipCode: '12347',
        country: 'USA'
      }
    });
    await trainer2.save();
    trainers.push(trainer2);

    console.log('✅ Trainer users created');

    // Create member users
    const memberPassword = await bcrypt.hash('member123', 12);
    const members = [];
    
    for (let i = 1; i <= 10; i++) {
      const member = new User({
        email: `member${i}@gymapp.com`,
        password: memberPassword,
        firstName: `Member${i}`,
        lastName: 'User',
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        phone: `+123456789${i + 2}`,
        address: {
          street: `${i}00 Member Street`,
          city: 'Member City',
          state: 'MC',
          zipCode: `1234${i + 7}`,
          country: 'USA'
        },
        fitnessGoals: ['weight_loss', 'muscle_gain', 'endurance'],
        medicalConditions: []
      });
      await member.save();
      members.push(member);
    }
    console.log('✅ Member users created');

    // Create classes
    const classes = [
      {
        name: 'Morning Yoga',
        description: 'Start your day with peaceful yoga practice',
        type: ClassType.YOGA,
        trainerId: trainers[0]._id,
        maxCapacity: 20,
        duration: 60,
        price: 15,
        status: ClassStatus.ACTIVE,
        schedule: [
          {
            dayOfWeek: 1, // Monday
            startTime: '07:00',
            endTime: '08:00',
            isRecurring: true
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '07:00',
            endTime: '08:00',
            isRecurring: true
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '07:00',
            endTime: '08:00',
            isRecurring: true
          }
        ],
        location: {
          room: 'Yoga Studio A',
          floor: 2,
          building: 'Main Building'
        },
        requirements: ['Yoga mat', 'Comfortable clothing'],
        equipment: ['Yoga mats', 'Blocks', 'Straps'],
        difficulty: 'beginner',
        tags: ['yoga', 'morning', 'beginner', 'flexibility'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      },
      {
        name: 'HIIT Cardio',
        description: 'High-intensity interval training for maximum calorie burn',
        type: ClassType.CARDIO,
        trainerId: trainers[1]._id,
        maxCapacity: 15,
        duration: 45,
        price: 20,
        status: ClassStatus.ACTIVE,
        schedule: [
          {
            dayOfWeek: 1, // Monday
            startTime: '18:00',
            endTime: '18:45',
            isRecurring: true
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '18:00',
            endTime: '18:45',
            isRecurring: true
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '18:00',
            endTime: '18:45',
            isRecurring: true
          }
        ],
        location: {
          room: 'Cardio Studio',
          floor: 1,
          building: 'Main Building'
        },
        requirements: ['Water bottle', 'Towel', 'Athletic shoes'],
        equipment: ['Treadmills', 'Bikes', 'Weights'],
        difficulty: 'intermediate',
        tags: ['hiit', 'cardio', 'high-intensity', 'fat-burning'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 12,
          refundPercentage: 80
        }
      },
      {
        name: 'Strength Training',
        description: 'Build muscle and increase strength with progressive overload',
        type: ClassType.STRENGTH,
        trainerId: trainers[0]._id,
        maxCapacity: 12,
        duration: 60,
        price: 25,
        status: ClassStatus.ACTIVE,
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '19:00',
            endTime: '20:00',
            isRecurring: true
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: '19:00',
            endTime: '20:00',
            isRecurring: true
          }
        ],
        location: {
          room: 'Weight Room',
          floor: 1,
          building: 'Main Building'
        },
        requirements: ['Water bottle', 'Towel', 'Athletic shoes'],
        equipment: ['Barbells', 'Dumbbells', 'Weight plates', 'Benches'],
        difficulty: 'intermediate',
        tags: ['strength', 'muscle-building', 'weights', 'progressive'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      },
      {
        name: 'Pilates Core',
        description: 'Strengthen your core and improve posture',
        type: ClassType.PILATES,
        trainerId: trainers[1]._id,
        maxCapacity: 18,
        duration: 50,
        price: 18,
        status: ClassStatus.ACTIVE,
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '10:00',
            endTime: '10:50',
            isRecurring: true
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: '10:00',
            endTime: '10:50',
            isRecurring: true
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: '09:00',
            endTime: '09:50',
            isRecurring: true
          }
        ],
        location: {
          room: 'Pilates Studio',
          floor: 2,
          building: 'Main Building'
        },
        requirements: ['Pilates mat', 'Comfortable clothing'],
        equipment: ['Pilates mats', 'Resistance bands', 'Pilates balls'],
        difficulty: 'beginner',
        tags: ['pilates', 'core', 'posture', 'flexibility'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 24,
          refundPercentage: 100
        }
      },
      {
        name: 'CrossFit WOD',
        description: 'Workout of the Day - varied functional movements',
        type: ClassType.CROSSFIT,
        trainerId: trainers[0]._id,
        maxCapacity: 10,
        duration: 60,
        price: 30,
        status: ClassStatus.ACTIVE,
        schedule: [
          {
            dayOfWeek: 1, // Monday
            startTime: '06:00',
            endTime: '07:00',
            isRecurring: true
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '06:00',
            endTime: '07:00',
            isRecurring: true
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '06:00',
            endTime: '07:00',
            isRecurring: true
          }
        ],
        location: {
          room: 'CrossFit Box',
          floor: 1,
          building: 'Main Building'
        },
        requirements: ['Water bottle', 'Towel', 'Athletic shoes'],
        equipment: ['Kettlebells', 'Barbells', 'Pull-up bars', 'Boxes'],
        difficulty: 'advanced',
        tags: ['crossfit', 'wod', 'functional', 'high-intensity'],
        isBookable: true,
        cancellationPolicy: {
          hoursBeforeClass: 12,
          refundPercentage: 80
        }
      }
    ];

    for (const classData of classes) {
      const newClass = new Class(classData);
      await newClass.save();
    }
    console.log('✅ Classes created');

    // Create subscriptions for some members
    const subscriptionPlans = [
      {
        userId: members[0]._id,
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        price: 99.99,
        features: {
          maxClassesPerMonth: 20,
          personalTrainingSessions: 2,
          accessToAllClasses: true,
          priorityBooking: true,
          guestPasses: 2,
          lockerAccess: true,
          towelService: true,
          nutritionConsultation: true
        },
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        },
        autoRenew: true,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: members[1]._id,
        plan: SubscriptionPlan.BASIC,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: 49.99,
        features: {
          maxClassesPerMonth: 10,
          personalTrainingSessions: 0,
          accessToAllClasses: false,
          priorityBooking: false,
          guestPasses: 0,
          lockerAccess: false,
          towelService: false,
          nutritionConsultation: false
        },
        paymentMethod: {
          type: 'card',
          last4: '5555',
          brand: 'mastercard'
        },
        autoRenew: true,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const subscriptionData of subscriptionPlans) {
      const subscription = new Subscription(subscriptionData);
      await subscription.save();
    }
    console.log('✅ Subscriptions created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created:');
    console.log('- 1 Admin user (admin@gymapp.com / admin123456)');
    console.log('- 2 Trainer users (trainer1@gymapp.com, trainer2@gymapp.com / trainer123)');
    console.log('- 10 Member users (member1@gymapp.com to member10@gymapp.com / member123)');
    console.log('- 5 Classes with schedules');
    console.log('- 2 Active subscriptions');
    console.log('\n🚀 You can now start the application and test all features!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymapp')
    .then(() => {
      console.log('✅ Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
