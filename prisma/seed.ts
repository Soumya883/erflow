import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Cleaning up existing data...")
  await prisma.attendanceLog.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.department.deleteMany({})
  await prisma.employeeProfile.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("Creating departments...")
  const deptEngineering = await prisma.department.create({ data: { name: 'Engineering' } })
  const deptHR = await prisma.department.create({ data: { name: 'Human Resources' } })
  const deptSales = await prisma.department.create({ data: { name: 'Sales' } })
  const deptDesign = await prisma.department.create({ data: { name: 'Design' } })

  console.log("Creating users & profiles...")
  
  // 1. Admin Account (IT / Engineering)
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@sushvine.com',
      passwordHash: 'password', // Demo password
      role: 'ADMIN',
      employeeProfile: {
        create: {
          departmentId: deptEngineering.id,
          jobTitle: 'IT Director',
          phone: '+91-9000000001',
          joinDate: new Date('2022-01-15'),
          avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=4F46E5&color=fff&size=256'
        }
      }
    },
    include: { employeeProfile: true }
  })

  // 2. Manager Account (HR)
  const managerUser = await prisma.user.create({
    data: {
      name: 'Sarah HR',
      email: 'manager@sushvine.com',
      passwordHash: 'password',
      role: 'MANAGER',
      employeeProfile: {
        create: {
          departmentId: deptHR.id,
          jobTitle: 'HR Manager',
          phone: '+91-9000000002',
          joinDate: new Date('2023-03-01'),
          avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+HR&background=EC4899&color=fff&size=256'
        }
      }
    },
    include: { employeeProfile: true }
  })

  // 3. Employee Account (Engineering)
  const employeeUser1 = await prisma.user.create({
    data: {
      name: 'John Developer',
      email: 'employee@sushvine.com',
      passwordHash: 'password',
      role: 'EMPLOYEE',
      employeeProfile: {
        create: {
          departmentId: deptEngineering.id,
          jobTitle: 'Frontend Developer',
          phone: '+91-9000000003',
          joinDate: new Date('2024-01-10'),
          avatarUrl: 'https://ui-avatars.com/api/?name=John+Developer&background=10B981&color=fff&size=256'
        }
      }
    },
    include: { employeeProfile: true }
  })

  // 4. Another Employee (Design)
  const employeeUser2 = await prisma.user.create({
    data: {
      name: 'Emma Designer',
      email: 'emma@sushvine.com',
      passwordHash: 'password',
      role: 'EMPLOYEE',
      employeeProfile: {
        create: {
          departmentId: deptDesign.id,
          jobTitle: 'Product Designer',
          phone: '+91-9000000004',
          joinDate: new Date('2023-11-20'),
          avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Designer&background=F59E0B&color=fff&size=256'
        }
      }
    },
    include: { employeeProfile: true }
  })

  console.log("Creating projects & tasks...")
  
  const project1 = await prisma.project.create({
    data: {
      name: 'OfficeFlow V1',
      description: 'The initial MVP release of our internal ERP system.',
      status: 'ACTIVE'
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Q3 Marketing Website',
      description: 'Redesign of the main public website.',
      status: 'PLANNING'
    }
  })

  await prisma.task.createMany({
    data: [
      {
        title: 'Design Dashboard UI',
        description: 'Create high-fidelity mockups for the main dashboard.',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: employeeUser2.employeeProfile?.id,
      },
      {
        title: 'Implement NextAuth',
        description: 'Set up credentials provider and role-based access.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: employeeUser1.employeeProfile?.id,
      },
      {
        title: 'Write HR Policies',
        description: 'Draft the new remote work policies for 2026.',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project2.id,
        assigneeId: managerUser.employeeProfile?.id,
      }
    ]
  })

  console.log("Database seeded successfully!")
  
  console.log("\n--- Demo Accounts ---")
  console.log("Admin:   admin@sushvine.com / password")
  console.log("Manager: manager@sushvine.com / password")
  console.log("Emp:     employee@sushvine.com / password")
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
