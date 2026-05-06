import prisma from "../db.js";

// Основні способи працювати з транзакціями в Prisma:
// prisma.$transaction([query1, query2])    - batch-транзакція для незалежних запитів.
// prisma.$transaction(async (tx) => { ... }) - interactive transaction для логіки з умовами.
//
// У цьому файлі потрібна interactive transaction, бо ми:
// 1. знаходимо студента;
// 2. знаходимо курс;
// 3. перевіряємо, чи Enrollment уже існує;
// 4. створюємо Enrollment тільки якщо дубля немає.

async function enrollStudent({ studentEmail, courseTitle }) {
  // Усе всередині callback виконується як одна транзакція.
  // Якщо будь-який запит кине помилку, Prisma зробить rollback.
  return prisma.$transaction(async (tx) => {
    // tx - це transaction client.
    // У транзакції використовуємо tx.student, tx.course, tx.enrollment,
    // а не глобальний prisma, щоб усі запити були в одній транзакції.
    const student = await tx.student.findUniqueOrThrow({
      where: { email: studentEmail },
    });

    // title не є unique, тому використовуємо findFirstOrThrow.
    // Якщо курс не знайдено, транзакція завершиться помилкою.
    const course = await tx.course.findFirstOrThrow({
      where: { title: courseTitle },
    });

    // Enrollment має @@unique([studentId, courseId]).
    // Перевіряємо compound unique key, щоб не створювати дубль.
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id,
        },
      },
    });

    // Якщо запис уже є, просто повертаємо його.
    // Це робить функцію idempotent: повторний виклик не створює дубль.
    if (existingEnrollment) {
      return {
        created: false,
        enrollment: existingEnrollment,
      };
    }

    // Якщо запису немає, створюємо Enrollment.
    // Тут можна передати studentId/courseId напряму, бо обидва записи вже знайдені вище.
    const enrollment = await tx.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        status: "ACTIVE",
      },
      // Повертаємо створений Enrollment разом зі Student і Course.
      include: {
        student: true,
        course: true,
      },
    });

    return {
      created: true,
      enrollment,
    };
  });
}

try {
  // Перший виклик створить Enrollment, якщо Андрій ще не записаний на API Design.
  const result = await enrollStudent({
    studentEmail: "andrii@student.test",
    courseTitle: "API Design",
  });

  console.log("Transaction result:");
  console.dir(result, { depth: null });

  // Другий виклик не створить дубль, а поверне вже існуючий Enrollment.
  const duplicateResult = await enrollStudent({
    studentEmail: "andrii@student.test",
    courseTitle: "API Design",
  });

  console.log("Second call returns existing enrollment instead of duplicating:");
  console.dir(duplicateResult, { depth: null });
} finally {
  await prisma.$disconnect();
}
