import prisma from "../db.js";

// Основні методи Prisma Client для оновлення:
// update              - оновити один запис по @unique або @@unique; якщо не знайдено, буде помилка.
// updateMany          - оновити всі записи, які підходять під where; повертає count.
// updateManyAndReturn - оновити багато записів і повернути змінені рядки.
// upsert              - знайти запис по unique-полю: якщо є, оновити; якщо нема, створити.
//
// Основні relation-операції всередині data:
// connect    - переприв'язати запис до вже існуючого пов'язаного запису.
// disconnect - прибрати optional-зв'язок без видалення пов'язаного запису.
// set        - замінити набір пов'язаних записів.
// update     - оновити пов'язаний запис через nested write.

try {
  // Спочатку знаходимо записи, які будемо оновлювати.
  // findUnique працює по email, бо email має @unique у Student.
  const student = await prisma.student.findUnique({
    where: { email: "andrii@student.test" },
  });

  // findFirst потрібен, бо title у Course не є unique.
  const nodeCourse = await prisma.course.findFirst({
    where: { title: "Node.js Backend" },
  });

  // Якщо seed не запускали, демонстрація не має над чим працювати.
  if (!student || !nodeCourse) {
    throw new Error("Run `npm run seed` before this demo.");
  }

  // update змінює один запис по unique-полю.
  // Тут where використовує id студента.
  // Поле updatedAt оновиться автоматично завдяки @updatedAt у schema.prisma.
  const renamedStudent = await prisma.student.update({
    where: { id: student.id },
    data: {
      name: "Андрій Мельник-Сеньйор",
    },
  });

  // Enrollment має compound unique key @@unique([studentId, courseId]).
  // Prisma генерує для нього спеціальний where-ключ studentId_courseId.
  // Так можна точно знайти запис "Андрій на курсі Node.js Backend".
  const gradedEnrollment = await prisma.enrollment.update({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: nodeCourse.id,
      },
    },
    data: {
      // Оновлюємо бізнес-стан запису на курс.
      status: "COMPLETED",
      grade: 95,
    },
    // include повертає оновлений Enrollment разом зі Student і Course.
    include: {
      student: true,
      course: true,
    },
  });

  // upsert тут потрібен, щоб демо можна було запускати багато разів.
  // Якщо Роман уже є, повертаємо його без змін; якщо нема, створюємо.
  const newInstructor = await prisma.instructor.upsert({
    where: { email: "roman.petrenko@university.test" },
    update: {},
    create: {
      email: "roman.petrenko@university.test",
      name: "Роман Петренко",
    },
  });

  // Оновлюємо курс і одночасно переприв'язуємо його до іншого викладача.
  const reassignedCourse = await prisma.course.update({
    where: { id: nodeCourse.id },
    data: {
      isPublished: true,
      // connect не створює викладача.
      // Він ставить Course.instructorId = newInstructor.id.
      instructor: {
        connect: { id: newInstructor.id },
      },
    },
    // Повертаємо курс разом з новим викладачем після update.
    include: {
      instructor: true,
    },
  });

  // updateManyAndReturn оновлює всі записи, які підходять під where,
  // і повертає змінені рядки. На відміну від updateMany, це не тільки count.
  // Тут публікуємо всі курси-чернетки.
  const publishedDraftCourses = await prisma.course.updateManyAndReturn({
    where: {
      isPublished: false,
    },
    data: {
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  console.log("Updated student:");
  console.dir(renamedStudent, { depth: null });

  console.log("Updated enrollment by compound unique key:");
  console.dir(gradedEnrollment, { depth: null });

  console.log("Reassigned course to another instructor:");
  console.dir(reassignedCourse, { depth: null });

  console.log("Published draft courses with updateManyAndReturn:");
  console.dir(publishedDraftCourses, { depth: null });
} finally {
  await prisma.$disconnect();
}
