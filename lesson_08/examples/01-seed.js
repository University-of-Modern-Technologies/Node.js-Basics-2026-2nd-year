import prisma from "../db.js";

try {
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();

  const [olena, maksym] = await Promise.all([
    prisma.instructor.create({
      data: {
        email: "olena.koval@university.test",
        name: "Олена Коваль",
      },
    }),
    prisma.instructor.create({
      data: {
        email: "maksym.ivanenko@university.test",
        name: "Максим Іваненко",
      },
    }),
  ]);

  const nodeCourse = await prisma.course.create({
    data: {
      title: "Node.js Backend",
      description: "HTTP, REST API, Prisma ORM",
      isPublished: true,
      instructorId: olena.id,
    },
  });

  const dbCourse = await prisma.course.create({
    data: {
      title: "Databases",
      description: "SQL, relations, indexes",
      isPublished: true,
      instructorId: maksym.id,
    },
  });

  const apiCourse = await prisma.course.create({
    data: {
      title: "API Design",
      isPublished: false,
      // connect прив'язує новий курс до вже існуючого викладача.
      // Prisma поставить Course.instructorId = olena.id.
      instructor: {
        connect: { id: olena.id },
      },
    },
  });

  const andrii = await prisma.student.create({
    data: {
      email: "andrii@student.test",
      name: "Андрій Мельник",
      enrollments: {
        // Nested create: разом зі студентом створюємо пов'язані Enrollment-записи.
        // Масив потрібен, бо Андрій одразу записаний на два курси.
        create: [
          {
            courseId: nodeCourse.id,
            status: "ACTIVE",
          },
          {
            courseId: dbCourse.id,
            status: "COMPLETED",
            grade: 91,
          },
        ],
      },
    },
    // include не впливає на створення даних.
    // Він тільки каже Prisma повернути студента разом з Enrollment-записами
    // і курсами всередині цих записів.
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
    },
  });

  const maria = await prisma.student.create({
    data: {
      email: "maria@student.test",
      name: "Марія Шевченко",
      enrollments: {
        // Такий самий nested create, але для одного Enrollment-запису.
        // Prisma дозволяє передати один об'єкт замість масиву.
        create: {
          courseId: nodeCourse.id,
          status: "ACTIVE",
        },
      },
    },
  });

  // Тут Enrollment створюється окремим запитом, бо Maria і API Design вже існують.
  // Це той самий join-запис Student <-> Course, тільки не nested create,
  // а прямий create у таблицю Enrollment.
  await prisma.enrollment.create({
    data: {
      studentId: maria.id,
      courseId: apiCourse.id,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed");
  console.dir(andrii, { depth: null });
} finally {
  await prisma.$disconnect();
}
