import db from "./db.js";

// Основні Knex-операції для створення:
// insert(data)              - створити один або багато рядків.
// insert(data).returning()  - створити рядки і повернути вибрані колонки.
// onConflict(...).merge()   - upsert-поведінка на рівні SQL conflict.
// transaction(async trx)    - обгорнути кілька insert/update/select в одну транзакцію.

try {
  // Аналог Prisma upsert: якщо email уже існує, оновлюємо name.
  // У SQLite це перетворюється на INSERT ... ON CONFLICT ... DO UPDATE.
  const [instructor] = await db("Instructor")
    .insert({
      email: "knex.iryna@university.test",
      name: "Knex Ірина",
    })
    .onConflict("email")
    .merge({
      name: "Knex Ірина",
      updatedAt: db.fn.now(),
    })
    .returning(["id", "email", "name"]);

  // У Knex немає connect. Ми напряму пишемо foreign key instructorId.
  const [course] = await db("Course")
    .insert({
      title: "Knex Query Builder in Practice",
      description: "Manual SQL-style relations",
      isPublished: false,
      instructorId: instructor.id,
    })
    .returning(["id", "title", "description", "isPublished", "instructorId"]);

  const bulkCourses = await db("Course")
    .insert([
      {
        title: "Knex Bulk HTTP",
        description: "Created with bulk insert",
        isPublished: false,
        instructorId: instructor.id,
      },
      {
        title: "Knex Bulk SQL",
        description: "Created with bulk insert",
        isPublished: false,
        instructorId: instructor.id,
      },
    ])
    .returning(["id", "title", "instructorId"]);

  const [student] = await db("Student")
    .insert({
      email: `knex.student.${Date.now()}@student.test`,
      name: "Knex Новий Студент",
    })
    .returning(["id", "email", "name"]);

  // Аналог Prisma nested create, але руками:
  // спочатку Student, потім окремий insert у Enrollment.
  const [enrollment] = await db("Enrollment")
    .insert({
      studentId: student.id,
      courseId: course.id,
      status: "ACTIVE",
    })
    .returning(["id", "studentId", "courseId", "status"]);

  console.log("Created instructor with onConflict().merge():");
  console.dir(instructor, { depth: null });

  console.log("Created course with direct instructorId:");
  console.dir(course, { depth: null });

  console.log("Created courses with bulk insert returning:");
  console.dir(bulkCourses, { depth: null });

  console.log("Created student and enrollment manually:");
  console.dir({ student, enrollment }, { depth: null });
} finally {
  await db.destroy();
}
