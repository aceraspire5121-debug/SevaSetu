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
      { name: 'Technician', slug: 'technician', icon: 'Wrench', description: 'AC, refrigerator, washing machine and appliance repairs.', minHourlyRate: 280 },
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    console.log('Seeding Societies across Delhi NCR, Gurgaon, Ghaziabad, Noida, Mumbai...');
    const societiesData = [
      {
        name: 'Delhi Craftsmen Cooperative Federation',
        code: 'DCCF-01',
        city: 'Delhi',
        pincode: '110001',
        address: 'Federation Bhavan, Connaught Place, New Delhi',
        contactEmail: 'delhi.coop@sevasetu.org',
        contactPhone: '+91 9811122334',
      },
      {
        name: 'Gurgaon Cooperative Labour Union',
        code: 'GCLU-02',
        city: 'Gurgaon',
        pincode: '122002',
        address: 'Cyber City Sector 29, Gurgaon, Haryana',
        contactEmail: 'gurgaon.coop@sevasetu.org',
        contactPhone: '+91 9812233445',
      },
      {
        name: 'Ghaziabad & NH-24 Labour Federation (ABES Region)',
        code: 'GZBF-03',
        city: 'Ghaziabad',
        pincode: '201009',
        address: 'Crossings Republik / NH-24 Union Complex, Ghaziabad',
        contactEmail: 'ghaziabad.coop@sevasetu.org',
        contactPhone: '+91 9813344556',
      },
      {
        name: 'Noida City Labour Cooperative Society',
        code: 'NOCS-04',
        city: 'Noida',
        pincode: '201301',
        address: 'Sector 62 Electronic City Commercial Hub, Noida',
        contactEmail: 'noida.coop@sevasetu.org',
        contactPhone: '+91 9814455667',
      },
      {
        name: 'Mumbai Labour Cooperative Society',
        code: 'MLCS-05',
        city: 'Mumbai',
        pincode: '400001',
        address: 'Cooperative House, Fort, Mumbai',
        contactEmail: 'mumbai.coop@sevasetu.org',
        contactPhone: '+91 9820011223',
      },
    ];
    const createdSocieties = await Society.insertMany(societiesData);

    console.log('Seeding Administrators...');
    // Super Admin (Federation)
    const fedAdminUser = await User.create({
      name: 'Radhika Sharma (Super Admin)',
      email: 'fedadmin@sevasetu.org',
      password: 'password123',
      phone: '9999900001',
      role: 'federationAdmin',
      city: 'Delhi',
      pincode: '110001',
      address: 'Central Federation Directorate, New Delhi',
    });

    // Society Admins
    const delhiAdmin = await User.create({
      name: 'Vikram Singh (Delhi Admin)',
      email: 'delhi.admin@sevasetu.org',
      password: 'password123',
      phone: '9999900002',
      role: 'societyAdmin',
      city: 'New Delhi',
      pincode: '110001',
      address: 'Connaught Place Union Office',
      society: createdSocieties[0]._id,
    });

    const mumbaiAdmin = await User.create({
      name: 'Suresh Patil (Mumbai Admin)',
      email: 'societyadmin@sevasetu.org',
      password: 'password123',
      phone: '9999900003',
      role: 'societyAdmin',
      city: 'Mumbai',
      pincode: '400001',
      address: 'Mumbai Labour Society Office',
      society: createdSocieties[4]._id,
    });

    await Society.findByIdAndUpdate(createdSocieties[0]._id, { admin: delhiAdmin._id });
    await Society.findByIdAndUpdate(createdSocieties[4]._id, { admin: mumbaiAdmin._id });

    // Customer
    const customerUser = await User.create({
      name: 'Ananya Roy',
      email: 'customer@sevasetu.org',
      password: 'password123',
      phone: '9876543210',
      role: 'customer',
      city: 'Delhi',
      pincode: '110001',
      address: 'Connaught Place, New Delhi',
    });

    console.log('Seeding Verified Workers (Gurgaon, Delhi CP, ABES Ghaziabad, Noida, Mayur Vihar)...');

    const workerUsersData = [
      // 1. GURGAON WORKERS
      {
        name: 'Amit',
        email: 'worker.amit.gurgaon@sevasetu.org',
        password: 'password123',
        phone: '9812001122',
        role: 'worker',
        city: 'Gurgaon',
        pincode: '122002',
        address: 'DLF Phase 3, Cyber City, Gurgaon',
        profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '6677-8899-0011',
        categories: ['Technician', 'Electrician'],
        hourlyRate: 290,
        experience: 6,
        rating: 4.92,
        totalRatings: 42,
        societyIndex: 1, // Gurgaon
      },
      {
        name: 'Rakesh',
        email: 'worker.rakesh.gurgaon@sevasetu.org',
        password: 'password123',
        phone: '9812003344',
        role: 'worker',
        city: 'Gurgaon',
        pincode: '122011',
        address: 'Sector 56, Huda Colony, Gurgaon',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '7788-9900-1122',
        categories: ['Cook', 'House Cleaning'],
        hourlyRate: 310,
        experience: 7,
        rating: 4.88,
        totalRatings: 35,
        societyIndex: 1, // Gurgaon
      },

      // 2. DELHI - AROUND CONNAUGHT PLACE (CP) - 5 WORKERS
      {
        name: 'Vikram Malhotra',
        email: 'worker.vikram.cp@sevasetu.org',
        password: 'password123',
        phone: '9811005511',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Block B, Inner Circle, Connaught Place, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '1122-3344-5566',
        categories: ['Electrician', 'Technician'],
        hourlyRate: 290,
        experience: 8,
        rating: 4.95,
        totalRatings: 58,
        societyIndex: 0, // Delhi
      },
      {
        name: 'Sunita Sharma',
        email: 'worker.sunita.cp@sevasetu.org',
        password: 'password123',
        phone: '9811005522',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Barakhamba Road, Near CP Metro, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '2233-4455-6677',
        categories: ['House Cleaning', 'Cook'],
        hourlyRate: 260,
        experience: 5,
        rating: 4.86,
        totalRatings: 29,
        societyIndex: 0, // Delhi
      },
      {
        name: 'Deepak Rawat',
        email: 'worker.deepak.cp@sevasetu.org',
        password: 'password123',
        phone: '9811005533',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Janpath Lane, Near Tolstoy Marg, CP, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '3344-5566-7788',
        categories: ['Plumber', 'Technician'],
        hourlyRate: 280,
        experience: 6,
        rating: 4.89,
        totalRatings: 34,
        societyIndex: 0, // Delhi
      },
      {
        name: 'Rajesh Verma',
        email: 'worker.rajesh.cp@sevasetu.org',
        password: 'password123',
        phone: '9811005544',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Mandir Marg, Gole Market, Near CP, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '4455-6677-8899',
        categories: ['Painter', 'Carpenter'],
        hourlyRate: 270,
        experience: 7,
        rating: 4.82,
        totalRatings: 26,
        societyIndex: 0, // Delhi
      },
      {
        name: 'Pooja Negi',
        email: 'worker.pooja.cp@sevasetu.org',
        password: 'password123',
        phone: '9811005555',
        role: 'worker',
        city: 'New Delhi',
        pincode: '110001',
        address: 'Panchkuian Marg, Near CP, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '5566-7788-9900',
        categories: ['Caregiver', 'Cook', 'House Cleaning'],
        hourlyRate: 250,
        experience: 4,
        rating: 4.94,
        totalRatings: 31,
        societyIndex: 0, // Delhi
      },

      // 3. GHAZIABAD - AROUND ABES ENGINEERING COLLEGE (5 WORKERS)
      {
        name: 'Sanjay Yadav',
        email: 'worker.sanjay.abes@sevasetu.org',
        password: 'password123',
        phone: '9813007711',
        role: 'worker',
        city: 'Ghaziabad',
        pincode: '201009',
        address: '19th KM Stone, NH-24, Near ABES EC Gate 1, Ghaziabad',
        profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '6677-1122-3344',
        categories: ['Electrician', 'Plumber'],
        hourlyRate: 250,
        experience: 5,
        rating: 4.85,
        totalRatings: 28,
        societyIndex: 2, // Ghaziabad
      },
      {
        name: 'Geeta Rani',
        email: 'worker.geeta.abes@sevasetu.org',
        password: 'password123',
        phone: '9813007722',
        role: 'worker',
        city: 'Ghaziabad',
        pincode: '201009',
        address: 'Lal Kuan, Near ABES Engineering College, Ghaziabad',
        profilePhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '7788-2233-4455',
        categories: ['House Cleaning', 'Cook'],
        hourlyRate: 210,
        experience: 4,
        rating: 4.90,
        totalRatings: 22,
        societyIndex: 2, // Ghaziabad
      },
      {
        name: 'Karan Bhati',
        email: 'worker.karan.abes@sevasetu.org',
        password: 'password123',
        phone: '9813007733',
        role: 'worker',
        city: 'Ghaziabad',
        pincode: '201009',
        address: 'Crossings Republik, Walking distance from ABES, Ghaziabad',
        profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '8899-3344-5566',
        categories: ['Carpenter', 'Painter'],
        hourlyRate: 260,
        experience: 6,
        rating: 4.79,
        totalRatings: 19,
        societyIndex: 2, // Ghaziabad
      },
      {
        name: 'Mohit Tomar',
        email: 'worker.mohit.abes@sevasetu.org',
        password: 'password123',
        phone: '9813007744',
        role: 'worker',
        city: 'Ghaziabad',
        pincode: '201009',
        address: 'NH-24 Highway Service Lane, Near ABES EC, Ghaziabad',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '9900-4455-6677',
        categories: ['Technician', 'Electrician'],
        hourlyRate: 300,
        experience: 7,
        rating: 4.88,
        totalRatings: 37,
        societyIndex: 2, // Ghaziabad
      },
      {
        name: 'Anita Chaudhary',
        email: 'worker.anita.abes@sevasetu.org',
        password: 'password123',
        phone: '9813007755',
        role: 'worker',
        city: 'Ghaziabad',
        pincode: '201009',
        address: 'Chipiyana Buzurg, Near ABES College Back Gate, Ghaziabad',
        profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '1011-5566-7788',
        categories: ['Caregiver', 'House Cleaning'],
        hourlyRate: 220,
        experience: 5,
        rating: 4.92,
        totalRatings: 25,
        societyIndex: 2, // Ghaziabad
      },

      // 4. NOIDA WORKERS (UNIQUE SKILL SETS & LOCALITIES)
      {
        name: 'Rohit Chauhan',
        email: 'worker.rohit.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009911',
        role: 'worker',
        city: 'Noida',
        pincode: '201309',
        address: 'Sector 62 (Electronic City), Noida',
        profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '1212-6677-8899',
        categories: ['Technician', 'Electrician'],
        hourlyRate: 290,
        experience: 6,
        rating: 4.91,
        totalRatings: 44,
        societyIndex: 3, // Noida
      },
      {
        name: 'Meena Kumari',
        email: 'worker.meena.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009922',
        role: 'worker',
        city: 'Noida',
        pincode: '201301',
        address: 'Sector 18 (Atta Market), Noida',
        profilePhoto: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '2323-7788-9900',
        categories: ['Cook', 'House Cleaning'],
        hourlyRate: 280,
        experience: 5,
        rating: 4.87,
        totalRatings: 32,
        societyIndex: 3, // Noida
      },
      {
        name: 'Praveen Sharma',
        email: 'worker.praveen.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009933',
        role: 'worker',
        city: 'Noida',
        pincode: '201301',
        address: 'Sector 50, Meghdootam Park, Noida',
        profilePhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '3434-8899-0011',
        categories: ['Plumber', 'Technician'],
        hourlyRate: 270,
        experience: 6,
        rating: 4.84,
        totalRatings: 29,
        societyIndex: 3, // Noida
      },
      {
        name: 'Dharmendra Singh',
        email: 'worker.dharmendra.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009944',
        role: 'worker',
        city: 'Noida',
        pincode: '201301',
        address: 'Sector 76, Silicon City, Noida',
        profilePhoto: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '4545-9900-1122',
        categories: ['Carpenter', 'Furniture Polish'],
        hourlyRate: 300,
        experience: 8,
        rating: 4.78,
        totalRatings: 23,
        societyIndex: 3, // Noida
      },
      {
        name: 'Vikas Malik',
        email: 'worker.vikas.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009955',
        role: 'worker',
        city: 'Noida',
        pincode: '201304',
        address: 'Sector 128, Express View, Noida Expressway',
        profilePhoto: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '5656-0011-2233',
        categories: ['Painter', 'Waterproofing'],
        hourlyRate: 280,
        experience: 7,
        rating: 4.86,
        totalRatings: 30,
        societyIndex: 3, // Noida
      },
      {
        name: 'Simran Kaur',
        email: 'worker.simran.noida@sevasetu.org',
        password: 'password123',
        phone: '9814009966',
        role: 'worker',
        city: 'Noida',
        pincode: '201309',
        address: 'Sector 62 (Near Fortis Hospital), Noida',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '6767-1122-3344',
        categories: ['Caregiver', 'Nurse Assistance'],
        hourlyRate: 320,
        experience: 5,
        rating: 4.96,
        totalRatings: 40,
        societyIndex: 3, // Noida
      },

      // 5. MAYUR VIHAR PHASE 2 & CORE WORKERS
      {
        name: 'Ayush',
        email: 'worker.ayush@sevasetu.org',
        password: 'password123',
        phone: '9811234567',
        role: 'worker',
        city: 'Delhi',
        pincode: '110091',
        address: 'Pocket B, Mayur Vihar Phase 2, New Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        idProofDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        aadhaarNumber: '3344-5566-7788',
        categories: ['Carpenter', 'Electrician', 'Plumber'],
        hourlyRate: 300,
        experience: 5,
        rating: 4.92,
        totalRatings: 38,
        societyIndex: 0, // Delhi
      },

      // 6. MUMBAI WORKERS
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
        categories: ['Cook'],
        hourlyRate: 250,
        experience: 5,
        rating: 4.9,
        totalRatings: 15,
        societyIndex: 4, // Mumbai
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
        categories: ['House Cleaning'],
        hourlyRate: 200,
        experience: 4,
        rating: 4.8,
        totalRatings: 18,
        societyIndex: 4, // Mumbai
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

      const workerCats = wData.categories || [wData.category];
      await Worker.create({
        user: u._id,
        society: targetSoc._id,
        categories: workerCats,
        hourlyRate: wData.hourlyRate,
        bio: `Certified ${workerCats.join(', ')} expert affiliated with ${targetSoc.name}. Specializes in high-quality home service, punctual work and fair-wage ethics.`,
        experienceYears: wData.experience,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        rating: wData.rating,
        totalRatings: wData.totalRatings || 20,
        verifiedBadge: true,
      });
    }

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
        address: 'Connaught Place, New Delhi',
        city: 'Delhi',
        pincode: '110001',
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

    console.log(`✅ Seed Completed Successfully! Added ${workerUsersData.length} active verified workers across Delhi NCR.`);
    process.exit(0);
  } catch (err) {
    console.error(`Seed error: ${err.message}`);
    process.exit(1);
  }
};

seedData();
