import db from "./db.js";

try {
  // Knex працює з таблицями напряму.
  // Тут немає Prisma models, relation fields або nested writes.
  await db("Enrollment").del();
  await db("Course").del();
  await db("Student").del();
  await db("Instructor").del();

  const [olena] = await db("Instructor")
    .insert({
      email: "knex.olena@university.test",
      name: "Knex Олена",
    })
    .returning(["id", "email", "name"]);

  const [maksym] = await db("Instructor")
    .insert({
      email: "knex.maksym@university.test",
      name: "Knex Максим",
    })
    .returning(["id", "email", "name"]);

  const [nodeCourse] = await db("Course")
    .insert({
      title: "Knex Node.js Backend",
      description: "HTTP, SQL joins, query builder",
      isPublished: true,
      instructorId: olena.id,
    })
    .returning(["id", "title", "instructorId"]);

  const [dbCourse] = await db("Course")
    .insert({
      title: "Knex Databases",
      description: "SQL-first data access",
      isPublished: true,
      instructorId: maksym.id,
    })
    .returning(["id", "title", "instructorId"]);

  const [apiCourse] = await db("Course")
    .insert({
      title: "Knex API Design",
      description: null,
      isPublished: false,
      instructorId: olena.id,
    })
    .returning(["id", "title", "instructorId"]);

  const [andrii] = await db("Student")
    .insert({
      email: "knex.andrii@student.test",
      name: "Knex Андрій",
    })
    .returning(["id", "email", "name"]);

  const [maria] = await db("Student")
    .insert({
      email: "knex.maria@student.test",
      name: "Knex Марія",
    })
    .returning(["id", "email", "name"]);

  // У Knex many-to-many створюється явним insert у join-таблицю.
  // Prisma nested create тут немає, тому studentId/courseId ставимо руками.
  await db("Enrollment").insert([
    {
      studentId: andrii.id,
      courseId: nodeCourse.id,
      status: "ACTIVE",
    },
    {
      studentId: andrii.id,
      courseId: dbCourse.id,
      status: "COMPLETED",
      grade: 91,
    },
    {
      studentId: maria.id,
      courseId: nodeCourse.id,
      status: "ACTIVE",
    },
    {
      studentId: maria.id,
      courseId: apiCourse.id,
      status: "ACTIVE",
    },
  ]);

  console.log("Knex seed completed");
  console.dir({ instructors: [olena, maksym], courses: [nodeCourse, dbCourse, apiCourse], students: [andrii, maria] }, { depth: null });
} finally {
  await db.destroy();
}
