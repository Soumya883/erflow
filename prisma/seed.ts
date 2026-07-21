import { PrismaClient, Role, TaskStatus, ProjectStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing data
  await prisma.attendanceLog.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.document.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.systemSettings.deleteMany();

  // Settings
  await prisma.systemSettings.create({
    data: {
      companyName: 'OfficeFlow',
      primaryColor: '#4F46E5',
    }
  });

  // Departments
  const deptNames = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Design'];
  const departments = [];
  for (const name of deptNames) {
    const dept = await prisma.department.create({
      data: { name }
    });
    departments.push(dept);
  }

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@officeflow.com',
      passwordHash: 'password', // in reality, a bcrypt hash
      role: Role.ADMIN,
      employeeProfile: {
        create: {
          jobTitle: 'System Administrator',
          phone: faker.phone.number(),
          joinDate: new Date('2023-01-01'),
          avatarUrl: faker.image.avatar(),
          departmentId: departments[1].id // HR
        }
      }
    },
    include: { employeeProfile: true }
  });

  console.log(`Admin created: admin@officeflow.com`);

  // Generate 30 dummy employees
  const employees = [];
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    // Pick random department
    const dept = departments[Math.floor(Math.random() * departments.length)];
    
    let jobTitle = 'Specialist';
    if (dept.name === 'Engineering') jobTitle = faker.helpers.arrayElement(['Frontend Engineer', 'Backend Engineer', 'DevOps', 'QA Engineer']);
    if (dept.name === 'Sales') jobTitle = faker.helpers.arrayElement(['Account Executive', 'Sales Representative', 'Sales Manager']);
    if (dept.name === 'Design') jobTitle = faker.helpers.arrayElement(['UI Designer', 'UX Researcher', 'Product Designer']);

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: 'password',
        role: Role.EMPLOYEE,
        employeeProfile: {
          create: {
            jobTitle,
            phone: faker.phone.number(),
            joinDate: faker.date.past({ years: 3 }),
            avatarUrl: faker.image.avatar(),
            departmentId: dept.id
          }
        }
      },
      include: { employeeProfile: true }
    });
    
    if (user.employeeProfile) {
      employees.push(user.employeeProfile);
    }
  }

  // Create a few projects
  const projects = [];
  for (let i = 0; i < 3; i++) {
    const project = await prisma.project.create({
      data: {
        name: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement([ProjectStatus.ACTIVE, ProjectStatus.PLANNING])
      }
    });
    projects.push(project);
  }

  // Create Tasks for some employees
  for (let i = 0; i < 50; i++) {
    await prisma.task.create({
      data: {
        title: faker.hacker.phrase(),
        description: faker.lorem.sentences(2),
        status: faker.helpers.arrayElement([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE]),
        priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
        dueDate: faker.date.soon({ days: 14 }),
        projectId: faker.helpers.arrayElement(projects).id,
        assigneeId: faker.helpers.arrayElement(employees).id
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
