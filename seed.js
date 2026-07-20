const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Clearing existing data...");
  await prisma.attendance.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.employee.deleteMany({});

  console.log("Seeding test accounts...");

  // 1. Admin
  await prisma.employee.create({
    data: {
      employeeIdentifier: 'EMP-001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sushvine.com',
      passwordHash: 'password', // "TODO_HASH_" + password will match "password" in auth.ts logic or exact match
      role: 'ADMIN',
      designation: 'System Administrator',
      department: 'IT',
      phoneNumber: '+91-9876543210',
      address: '123 Tech Park, Cyber City, India',
      joiningDate: new Date('2023-01-01'),
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff&size=256'
    }
  });

  // 2. HR
  await prisma.employee.create({
    data: {
      employeeIdentifier: 'EMP-002',
      firstName: 'HR',
      lastName: 'Manager',
      email: 'hr@sushvine.com',
      passwordHash: 'password',
      role: 'HR',
      designation: 'HR Director',
      department: 'Human Resources',
      phoneNumber: '+91-9876543211',
      address: '456 Business Center, Corporate Hub, India',
      joiningDate: new Date('2023-05-15'),
      photoUrl: 'https://ui-avatars.com/api/?name=HR+Manager&background=E53E3E&color=fff&size=256'
    }
  });

  // 3. Employee
  const emp = await prisma.employee.create({
    data: {
      employeeIdentifier: 'EMP-003',
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@sushvine.com',
      passwordHash: 'password',
      role: 'EMPLOYEE',
      designation: 'Software Engineer',
      department: 'Engineering',
      phoneNumber: '+91-9876543212',
      address: '789 Residential Towers, Suburb, India',
      joiningDate: new Date('2024-02-01'),
      photoUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=38A169&color=fff&size=256'
    }
  });

  // Create some attendance history for the employee
  const today = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(9, 0, 0, 0); // 9 AM clock in
    
    const out = new Date(d);
    out.setHours(17, 30, 0, 0); // 5:30 PM clock out
    
    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: d,
        clockInTime: d,
        clockOutTime: out,
        status: i === 2 ? 'LATE' : 'PRESENT',
        needsHrReview: i === 2
      }
    });
  }

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1) });
