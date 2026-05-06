import db from "./db.js";

// Основні Knex-операції для читання:
// select(...) / first() - вибір колонок і один перший рядок.
// where(...)            - фільтрація.
// join(...)             - явне з'єднання таблиць.
// orderBy(...)          - сортування.
// limit(...) / offset() - пагінація.
// count(...)            - кількість рядків.

try {
  const andrii = await db("Student")
    .select("id", "email", "name")
    .where({ email: "knex.andrii@student.test" })
    .first();

  console.log("Student by unique email:");
  console.dir(andrii, { depth: null });

  const nodeCourse = await db("Course")
    .select("Course.*", "Instructor.name as instructorName")
    .join("Instructor", "Instructor.id", "Course.instructorId")
    .where("Course.title", "like", "%Node%")
    .first();

  console.log("First course matched by title with explicit join:");
  console.dir(nodeCourse, { depth: null });

  // Те, що Prisma робить через include, у Knex пишеться через join.
  const studentsWithCourses = await db("Student")
    .select(
      "Student.id as studentId",
      "Student.name as studentName",
      "Enrollment.status",
      "Enrollment.grade",
      "Course.title as courseTitle",
      "Instructor.name as instructorName",
    )
    .join("Enrollment", "Enrollment.studentId", "Student.id")
    .join("Course", "Course.id", "Enrollment.courseId")
    .join("Instructor", "Instructor.id", "Course.instructorId")
    .orderBy("Student.name", "asc");

  console.log("Students with courses through joins:");
  console.dir(studentsWithCourses, { depth: null });

  const activeNodeEnrollments = await db("Enrollment")
    .select(
      "Enrollment.id",
      "Enrollment.status",
      "Enrollment.grade",
      "Student.name as studentName",
      "Student.email as studentEmail",
      "Course.title as courseTitle",
    )
    .join("Student", "Student.id", "Enrollment.studentId")
    .join("Course", "Course.id", "Enrollment.courseId")
    .where("Enrollment.status", "ACTIVE")
    .where("Course.title", "like", "%Node%");

  console.log("Active enrollments for Node courses:");
  console.dir(activeNodeEnrollments, { depth: null });

  const [{ count }] = await db("Enrollment")
    .where({ status: "ACTIVE" })
    .count({ count: "*" });

  console.log("Active enrollments count:");
  console.dir(Number(count), { depth: null });

  const paginatedCourses = await db("Course")
    .select("Course.id", "Course.title", "Course.isPublished", "Instructor.name as instructorName")
    .join("Instructor", "Instructor.id", "Course.instructorId")
    .orderBy("Course.title", "asc")
    .limit(2)
    .offset(0);

  console.log("First two courses:");
  console.dir(paginatedCourses, { depth: null });
} finally {
  await db.destroy();
}
