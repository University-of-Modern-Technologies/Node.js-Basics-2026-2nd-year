import prisma from "../db.js";

// Основні методи Prisma Client для створення:
// create              - створити один запис.
// createMany          - створити багато записів одним запитом; повертає count.
// createManyAndReturn - створити багато записів і повернути створені рядки.
// upsert              - знайти запис по unique-полю: якщо є, оновити; якщо нема, створити.
//
// Основні relation-операції всередині data:
// connect         - прив'язати до вже існуючого пов'язаного запису.
// connectOrCreate - прив'язати існуючий запис або створити його, якщо не знайдено.
// create          - створити новий пов'язаний запис через nested write.
//
// У цьому файлі показані create, createManyAndReturn, upsert, connect і nested create.

try {
  // upsert = update або insert.
  // Якщо викладач з таким email вже існує, Prisma виконає update.
  // Тут update порожній, тому існуючий запис просто повернеться без змін.
  // Якщо викладача немає, Prisma створить його через create.
  const instructor = await prisma.instructor.upsert({
    where: { email: "iryna.hnatiuk@university.test" },
    update: {},
    create: {
      email: "iryna.hnatiuk@university.test",
      name: "Ірина Гнатюк",
    },
  });

  const course = await prisma.course.create({
    data: {
      title: "Prisma ORM in Practice",
      description: "Models, migrations, CRUD, relations",
      isPublished: false,
      // connect не створює викладача.
      // Він прив'язує новий курс до вже існуючого Instructor.
      instructor: {
        connect: { id: instructor.id },
      },
    },
    // include повертає Course разом із пов'язаним Instructor.
    // Без include Prisma повернула б тільки поля самого Course.
    include: {
      instructor: true,
    },
  });

  // createManyAndReturn створює багато записів і повертає створені рядки.
  // Важливий нюанс: bulk-create не використовують для nested writes.
  // Тому тут передаємо instructorId напряму, а не instructor: { connect: ... }.
  const bulkCourses = await prisma.course.createManyAndReturn({
    data: [
      {
        title: "Bulk Course: HTTP",
        description: "Created with createManyAndReturn",
        isPublished: false,
        instructorId: instructor.id,
      },
      {
        title: "Bulk Course: SQL",
        description: "Created with createManyAndReturn",
        isPublished: false,
        instructorId: instructor.id,
      },
    ],
    select: {
      id: true,
      title: true,
      instructorId: true,
    },
  });

  const student = await prisma.student.create({
    data: {
      email: `student.${Date.now()}@student.test`,
      name: "Новий Студент",
      enrollments: {
        // Nested create: разом зі Student створюємо Enrollment.
        // studentId Prisma підставить сама, бо Enrollment
        // створюється всередині student.create.
        // courseId передаємо явно, бо Course вже створений вище.
        create: {
          courseId: course.id,
          status: "ACTIVE",
        },
      },
    },
    // Повертаємо Student разом із Enrollment,
    // а всередині Enrollment ще й пов'язаний Course.
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
    },
  });

  console.log("Created course with connected instructor:");
  console.dir(course, { depth: null });

  console.log("Created courses with createManyAndReturn:");
  console.dir(bulkCourses, { depth: null });

  console.log("Created student with nested enrollment:");
  console.dir(student, { depth: null });
} finally {
  await prisma.$disconnect();
}
