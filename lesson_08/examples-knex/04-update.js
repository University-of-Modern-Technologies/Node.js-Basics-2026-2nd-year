import db from "./db.js";

// Основні Knex-операції для оновлення:
// update(data)              - оновити рядки, які підходять під where.
// update(data).returning()  - оновити і повернути змінені рядки.
// onConflict(...).merge()   - upsert-поведінка для insert.
//
// Важливо: Prisma @updatedAt працює на рівні Prisma Client.
// У Knex updatedAt треба оновлювати руками.

try {
  const student = await db("Student")
    .select("id", "email", "name")
    .where({ email: "knex.andrii@student.test" })
    .first();

  const nodeCourse = await db("Course")
    .select("id", "title")
    .where("title", "like", "%Node%")
    .first();

  if (!student || !nodeCourse) {
    throw new Error("Run `npm run knex:seed` before this demo.");
  }

  const [renamedStudent] = await db("Student")
    .where({ id: student.id })
    .update({
      name: "Knex Андрій Сеньйор",
      updatedAt: db.fn.now(),
    })
    .returning(["id", "email", "name", "updatedAt"]);

  const [gradedEnrollment] = await db("Enrollment")
    .where({
      studentId: student.id,
      courseId: nodeCourse.id,
    })
    .update({
      status: "COMPLETED",
      grade: 95,
      updatedAt: db.fn.now(),
    })
    .returning(["id", "studentId", "courseId", "status", "grade", "updatedAt"]);

  const [newInstructor] = await db("Instructor")
    .insert({
      email: "knex.roman@university.test",
      name: "Knex Роман",
    })
    .onConflict("email")
    .merge({
      name: "Knex Роман",
      updatedAt: db.fn.now(),
    })
    .returning(["id", "email", "name"]);

  const [reassignedCourse] = await db("Course")
    .where({ id: nodeCourse.id })
    .update({
      isPublished: true,
      instructorId: newInstructor.id,
      updatedAt: db.fn.now(),
    })
    .returning(["id", "title", "isPublished", "instructorId", "updatedAt"]);

  const publishedDraftCourses = await db("Course")
    .where({ isPublished: false })
    .update({
      isPublished: true,
      updatedAt: db.fn.now(),
    })
    .returning(["id", "title", "isPublished", "updatedAt"]);

  console.log("Updated student:");
  console.dir(renamedStudent, { depth: null });

  console.log("Updated enrollment:");
  console.dir(gradedEnrollment, { depth: null });

  console.log("Reassigned course:");
  console.dir(reassignedCourse, { depth: null });

  console.log("Published draft courses:");
  console.dir(publishedDraftCourses, { depth: null });
} finally {
  await db.destroy();
}
