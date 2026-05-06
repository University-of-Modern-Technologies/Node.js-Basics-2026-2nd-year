import prisma from "../db.js";

// Основні методи Prisma Client для читання:
// findUnique        - один запис по @unique або @@unique; якщо не знайдено, повертає null.
// findUniqueOrThrow - один запис по @unique або @@unique; якщо не знайдено, кидає помилку.
// findFirst         - перший запис, який підходить під where; якщо не знайдено, повертає null.
// findFirstOrThrow  - перший запис, який підходить під where; якщо не знайдено, кидає помилку.
// findMany          - список записів; підтримує where, orderBy, skip, take, select, include.
// count             - кількість записів без завантаження самих рядків.

try {
  // findUniqueOrThrow шукає один запис по unique-полю.
  // Тут email має @unique у schema.prisma, тому Prisma дозволяє такий where.
  // Якщо запис не знайдено, буде помилка.
  const andrii = await prisma.student.findUniqueOrThrow({
    where: {
      email: "andrii@student.test",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log("Student by unique email:");
  console.dir(andrii, { depth: null });

  // findFirstOrThrow шукає перший запис, який підходить під filter.
  // title не є @unique, тому findUnique тут використовувати не можна.
  const nodeCourse = await prisma.course.findFirstOrThrow({
    where: {
      title: {
        contains: "Node",
      },
    },
    include: {
      instructor: true,
    },
  });

  console.log("First course matched by non-unique title filter:");
  console.dir(nodeCourse, { depth: null });

  // findUnique також працює з compound unique keys.
  // У schema.prisma є @@unique([studentId, courseId]),
  // тому Prisma генерує ключ studentId_courseId.
  const andriiNodeEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: andrii.id,
        courseId: nodeCourse.id,
      },
    },
    include: {
      student: true,
      course: true,
    },
  });

  console.log("Enrollment found by compound unique key:");
  console.dir(andriiNodeEnrollment, { depth: null });

  // findMany повертає список. Це основний метод для фільтрів, сортування,
  // include/select і пагінації.
  const studentsWithCourses = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log("Students with courses and instructors:");
  console.dir(studentsWithCourses, { depth: null });

  const activeNodeEnrollments = await prisma.enrollment.findMany({
    where: {
      status: "ACTIVE",
      course: {
        title: {
          contains: "Node",
        },
      },
    },
    select: {
      id: true,
      status: true,
      grade: true,
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  console.log("Active enrollments for Node courses:");
  console.dir(activeNodeEnrollments, { depth: null });

  // count рахує записи без завантаження самих рядків.
  // Корисно для пагінації, статистики і dashboard-ів.
  const activeEnrollmentsCount = await prisma.enrollment.count({
    where: {
      status: "ACTIVE",
    },
  });

  console.log("Active enrollments count:");
  console.dir(activeEnrollmentsCount, { depth: null });

  const publishedCourses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    select: {
      title: true,
      isPublished: true,
      instructor: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log("Published courses:");
  console.dir(publishedCourses, { depth: null });

  const paginatedCourses = await prisma.course.findMany({
    skip: 0,
    take: 2,
    orderBy: {
      title: "asc",
    },
    include: {
      instructor: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  console.log("First two courses with enrollment count:");
  console.dir(paginatedCourses, { depth: null });
} finally {
  await prisma.$disconnect();
}
