/**
 * Demo Data Seeder
 * Creates sample data for testing
 * 
 * DISABLED: Model names need to be updated to match schema.prisma
 * TODO: Update lmsUser -> User, lmsOrder -> Payment, etc.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠️  Demo seeder is disabled - model names need updating');
  return;
}

/* COMMENTED OUT UNTIL MODELS ARE FIXED

async function mainDisabled() {
  console.log('🌱 Seeding demo data...');
  console.log('========================');

  // Create demo organization
  const org = await prisma.lmsOrganization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      domain: 'demo.elevateforhumanity.org',
    },
  });
  console.log('✅ Created demo organization');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const admin = await prisma.lmsUser.upsert({
    where: { email: 'admin@demo.org' },
    update: {},
    create: {
      email: 'admin@demo.org',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      orgId: org.id,
    },
  });
  console.log('✅ Created admin user (admin@demo.org / demo123)');

  const instructor = await prisma.lmsUser.upsert({
    where: { email: 'instructor@demo.org' },
    update: {},
    create: {
      email: 'instructor@demo.org',
      name: 'Instructor User',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      orgId: org.id,
    },
  });
  console.log('✅ Created instructor user (instructor@demo.org / demo123)');

  const student = await prisma.lmsUser.upsert({
    where: { email: 'student@demo.org' },
    update: {},
    create: {
      email: 'student@demo.org',
      name: 'Student User',
      password: hashedPassword,
      role: 'STUDENT',
      orgId: org.id,
    },
  });
  console.log('✅ Created student user (student@demo.org / demo123)');

  // Create demo courses
  const course1 = await prisma.lmsCourse.upsert({
    where: { slug: 'intro-to-programming' },
    update: {},
    create: {
      orgId: org.id,
      title: 'Introduction to Programming',
      slug: 'intro-to-programming',
      price: 4999, // $49.99
      published: true,
    },
  });
  console.log('✅ Created course: Introduction to Programming');

  const course2 = await prisma.lmsCourse.upsert({
    where: { slug: 'web-development-basics' },
    update: {},
    create: {
      orgId: org.id,
      title: 'Web Development Basics',
      slug: 'web-development-basics',
      price: 7999, // $79.99
      published: true,
    },
  });
  console.log('✅ Created course: Web Development Basics');

  // Create modules for course 1
  const module1 = await prisma.lmsModule.create({
    data: {
      courseId: course1.id,
      title: 'Getting Started',
      order: 1,
    },
  });

  const module2 = await prisma.lmsModule.create({
    data: {
      courseId: course1.id,
      title: 'Variables and Data Types',
      order: 2,
    },
  });
  console.log('✅ Created modules for course 1');

  // Create lessons
  await prisma.lmsLesson.create({
    data: {
      courseId: course1.id,
      moduleId: module1.id,
      title: 'Welcome to Programming',
      type: 'VIDEO',
      content: 'Introduction video content',
      duration: 600, // 10 minutes
      order: 1,
    },
  });

  await prisma.lmsLesson.create({
    data: {
      courseId: course1.id,
      moduleId: module1.id,
      title: 'Setting Up Your Environment',
      type: 'TEXT',
      content: 'Step-by-step guide to setting up your development environment',
      order: 2,
    },
  });

  await prisma.lmsLesson.create({
    data: {
      courseId: course1.id,
      moduleId: module2.id,
      title: 'Understanding Variables',
      type: 'VIDEO',
      content: 'Variables explained',
      duration: 900, // 15 minutes
      order: 1,
    },
  });
  console.log('✅ Created lessons');

  // Enroll student in course
  await prisma.lmsEnrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progress: 25,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Enrolled student in course');

  // Create demo products
  await prisma.lmsProduct.create({
    data: {
      orgId: org.id,
      title: 'Premium Membership',
      slug: 'premium-membership',
      price: 9999, // $99.99
      image: 'https://via.placeholder.com/300x200',
      active: true,
    },
  });
  console.log('✅ Created demo product');

  // Create demo pages
  await prisma.lmsPage.create({
    data: {
      slug: 'about',
      title: 'About Us',
      content: 'Welcome to Elevate for Humanity - empowering education for all.',
      published: true,
    },
  });

  await prisma.lmsPage.create({
    data: {
      slug: 'contact',
      title: 'Contact Us',
      content: 'Get in touch with our team.',
      published: true,
    },
  });
  console.log('✅ Created demo pages');

  console.log('========================');
  console.log('🎉 Demo data seeded successfully!');
  console.log('========================');
  console.log('');
  console.log('Demo Accounts:');
  console.log('- Admin: admin@demo.org / demo123');
  console.log('- Instructor: instructor@demo.org / demo123');
  console.log('- Student: student@demo.org / demo123');
  console.log('');
  console.log('Demo Courses:');
  console.log('- Introduction to Programming ($49.99)');
  console.log('- Web Development Basics ($79.99)');
  console.log('');
}

mainDisabled()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

*/

// Call the actual main function
main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
