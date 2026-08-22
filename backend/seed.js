const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Society = require('./models/Society');
const Category = require('./models/Category');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Payment = require('./models/Payment');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Worker.deleteMany();
    await Society.deleteMany();
    await Category.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Payment.deleteMany();

    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Cook', slug: 'cook', icon: 'Utensils', description: 'Experienced home cooks for daily meals and party catering.', minHourlyRate: 200 },
      { name: 'House Cleaning', slug: 'house-cleaning', icon: 'Sparkles', description: 'Deep house cleaning, dusting, mopping and sanitation.', minHourlyRate: 180 },
      { name: 'Electrician', slug: 'electrician', icon: 'Zap', description: 'Licensed electricians for wiring, appliance repair and fixtures.', minHourlyRate: 250 },
      { name: 'Plumber', slug: 'plumber', icon: 'Droplets', description: 'Expert plumbing, pipe leakages, bathroom fitting repairs.', minHourlyRate: 250 },
      { name: 'Carpenter', slug: 'carpenter', icon: 'Hammer', description: 'Custom furniture repair, door lock installation and woodwork.', minHourlyRate: 250 },
      { name: 'Painter', slug: 'painter', icon: 'Paintbrush', description: 'Interior and exterior home wall painting and waterproofing.', minHourlyRate: 220 },
      { name: 'Driver', slug: 'driver', icon: 'Car', description: 'Professional personal drivers for local and outstation trips.', minHourlyRate: 200 },
      { name: 'Gardener', slug: 'gardener', icon: 'Flower2', description: 'Lawn care, balcony gardening, trimming and plant nutrition.', minHourlyRate: 150 },
      { name: 'Caregiver', slug: 'caregiver', icon: 'HeartPulse', description: 'Compassionate elderly care and home nurse assistance.', minHourlyRate: 220 },
      { name: 'Technician', slug: 'technician', icon: 'Wrench', description: 'AC, refrigerator, washing machine and laptop repairs.', minHourlyRate: 280 },
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    console.log('Seeding Societies...');
    const societiesData = [
      {
        name: 'Mumbai Labour Cooperative Society',
        code: 'MLCS-01',
        city: 'Mumbai',
        pincode: '400001',
        address: 'Cooperative House, Fort, Mumbai',
        contactEmail: 'mumbai.coop@sevasetu.org',
        contactPhone: '+91 9820011223',
      },
      {
        name: 'Delhi Craftsmen Cooperative Federation',
        code: 'DCCF-02',
        city: 'Delhi',
        pincode: '110001',
        address: 'Federation Bhavan, Connaught Place, New Delhi',
        contactEmail: 'delhi.coop@sevasetu.org',
        contactPhone: '+91 9811122334',
      },
    ];
    const createdSocieties = await Society.insertMany(societiesData);

    console.log('Seeding Users...');
    // Admins
    const fedAdminUser = await User.create({
      name: 'Radhika Sharma (Federation Admin)',
      email: 'fedadmin@sevasetu.org',
      password: 'password123',
      phone: '+91 9999900001',
      role: 'federationAdmin',
      city: 'Mumbai',
      pincode: '400001',
      address: 'Central Federation HQ',
    });

    const societyAdminUser = await User.create({
      name: 'Suresh Patil (Mumbai Admin)',
      email: 'societyadmin@sevasetu.org',
      password: 'password123',
      phone: '+91 9999900002',
      role: 'societyAdmin',
      city: 'Mumbai',
      pincode: '400001',
      address: 'Mumbai Labour Society Office',
    });

    const delhiSocietyAdminUser = await User.create({
      name: 'Vikram Singh (Delhi Admin)',
      email: 'delhi.admin@sevasetu.org',
      password: 'password123',
      phone: '+91 9999900003',
      role: 'societyAdmin',
      city: 'New Delhi',
      pincode: '110001',
      address: 'Connaught Place Union Office',
    });

    // Link societies to their admins
    await Society.findByIdAndUpdate(createdSocieties[0]._id, { admin: societyAdminUser._id });
    await Society.findByIdAndUpdate(createdSocieties[1]._id, { admin: delhiSocietyAdminUser._id });

    // Customer User
    const customerUser = await User.create({
      name: 'Ananya Roy',
      email: 'customer@sevasetu.org',
      password: 'password123',
      phone: '+91 9876543210',
      role: 'customer',
      city: 'Mumbai',
      pincode: '400001',
      address: 'Flat 402, Green Acres Apartment, Bandra West, Mumbai',
    });

    // Approved Workers
    const workerUsersData = [
      {
        name: 'Ramesh Verma',
        email: 'worker.ramesh@sevasetu.org',
        password: 'password123',
        phone: '9821012345',
        role: 'worker',
        city: 'Mumbai',
        pincode: '400001',
        address: 'Dharavi Sector 3, Mumbai',
        profilePhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '1234-5678-4819',
        category: 'Cook',
        hourlyRate: 250,
        experience: 5,
        rating: 4.9,
        societyIndex: 0, // Mumbai Society
      },
      {
        name: 'Sunita Devi',
        email: 'worker.sunita@sevasetu.org',
        password: 'password123',
        phone: '9821098765',
        role: 'worker',
        city: 'Mumbai',
        pincode: '400001',
        address: 'Kurla West, Mumbai',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '9876-5432-9124',
        category: 'House Cleaning',
        hourlyRate: 200,
        experience: 4,
        rating: 4.8,
        societyIndex: 0, // Mumbai Society
      },
      {
        name: 'Vijay Kumar',
        email: 'worker.vijay@sevasetu.org',
        password: 'password123',
        phone: '9821054321',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Andheri East / CP Delhi Union',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '4567-8901-1102',
        category: 'Electrician',
        hourlyRate: 300,
        experience: 7,
        rating: 4.9,
        societyIndex: 1, // Delhi Society
      },
      {
        name: 'Manoj Shinde',
        email: 'worker.manoj@sevasetu.org',
        password: 'password123',
        phone: '9821077889',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Karol Bagh, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '7890-1234-3341',
        category: 'Plumber',
        hourlyRate: 280,
        experience: 6,
        rating: 4.7,
        societyIndex: 1, // Delhi Society
      },
    ];

    for (const wData of workerUsersData) {
      const targetSoc = createdSocieties[wData.societyIndex];
      const u = await User.create({
        name: wData.name,
        email: wData.email,
        password: wData.password,
        phone: wData.phone,
        role: 'worker',
        city: wData.city,
        pincode: wData.pincode,
        address: wData.address,
        profilePhoto: wData.profilePhoto,
        idProofDocument: wData.idProofDocument,
        aadhaarNumber: wData.aadhaarNumber,
        society: targetSoc._id,
      });

      await Worker.create({
        user: u._id,
        society: targetSoc._id,
        categories: [wData.category],
        hourlyRate: wData.hourlyRate,
        bio: `Certified ${wData.category} affiliated with ${targetSoc.name}. Committed to high service standards.`,
        experienceYears: wData.experience,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        rating: wData.rating,
        totalRatings: 15,
        verifiedBadge: true,
      });
    }

    // Pending Worker for Mumbai Society
    const pendingUserMumbai = await User.create({
      name: 'Priya Jadhav (Mumbai Pending Worker)',
      email: 'worker.pending@sevasetu.org',
      password: 'password123',
      phone: '9821066554',
      role: 'worker',
      city: 'Mumbai',
      pincode: '400001',
      address: 'Ghatkopar East, Mumbai',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      aadhaarNumber: '8899-7766-7788',
      society: createdSocieties[0]._id,
    });

    await Worker.create({
      user: pendingUserMumbai._id,
      society: createdSocieties[0]._id,
      categories: ['Caregiver', 'Cook'],
      hourlyRate: 220,
      bio: 'Experienced caregiver looking for Mumbai cooperative membership.',
      experienceYears: 3,
      approvalStatus: 'pending',
      availabilityStatus: 'available',
      rating: 5.0,
    });

    // Pending Worker for Delhi Society
    const pendingUserDelhi = await User.create({
      name: 'Amit Sharma (Delhi Pending Worker)',
      email: 'worker.delhipending@sevasetu.org',
      password: 'password123',
      phone: '9811122339',
      role: 'worker',
      city: 'New Delhi',
      pincode: '110001',
      address: 'Lajpat Nagar, New Delhi',
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      aadhaarNumber: '9988-7766-1122',
      society: createdSocieties[1]._id,
    });

    await Worker.create({
      user: pendingUserDelhi._id,
      society: createdSocieties[1]._id,
      categories: ['Carpenter', 'Electrician'],
      hourlyRate: 260,
      bio: 'Skilled carpenter looking for Delhi union registration.',
      experienceYears: 4,
      approvalStatus: 'pending',
      availabilityStatus: 'available',
      rating: 5.0,
      totalRatings: 0,
      verifiedBadge: false,
    });

    console.log('Seeding Sample Historical Bookings for Demand Forecast...');
    const firstWorkerUser = await User.findOne({ email: 'worker.ramesh@sevasetu.org' });
    const today = new Date();

    for (let i = 1; i <= 15; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const catNames = ['Cook', 'House Cleaning', 'Electrician', 'Plumber', 'Technician'];
      const cat = catNames[i % catNames.length];

      await Booking.create({
        customer: customerUser._id,
        worker: firstWorkerUser._id,
        category: cat,
        date: dateStr,
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Bandra West, Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        notes: `Sample historical booking for ${cat}`,
        status: 'completed',
        isEmergency: i % 4 === 0,
        price: 350 + (i * 10),
        paymentStatus: 'paid',
        razorpayOrderId: 'order_seed_' + i,
        razorpayPaymentId: 'pay_seed_' + i,
        createdAt: d,
      });
    }

    console.log('Seed Completed Successfully!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('Customer: customer@sevasetu.org / password123');
    console.log('Worker (Approved): worker.ramesh@sevasetu.org / password123');
    console.log('Worker (Pending): worker.pending@sevasetu.org / password123');
    console.log('Society Admin: societyadmin@sevasetu.org / password123');
    console.log('Federation Admin: fedadmin@sevasetu.org / password123');

    process.exit(0);
  } catch (err) {
    console.error(`Seed error: ${err.message}`);
    process.exit(1);
  }
};

seedData();
