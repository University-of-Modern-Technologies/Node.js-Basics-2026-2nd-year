import db from "./db.js";

// У Knex транзакція створюється через db.transaction(async (trx) => { ... }).
// trx - це transaction query builder. Усі запити всередині мають йти через trx,
// щоб вони виконувалися в одній транзакції.

async function enrollStudent({ studentEmail, courseTitle }) {
  return db.transaction(async (trx) => {
    const student = await trx("Student")
      .select("id", "email", "name")
      .where({ email: studentEmail })
      .first();

    if (!student) {
      throw new Error(`Student not found: ${studentEmail}`);
    }

    const course = await trx("Course")
      .select("id", "title")
      .where({ title: courseTitle })
      .first();

    if (!course) {
      throw new Error(`Course not found: ${courseTitle}`);
    }

    const existingEnrollment = await trx("Enrollment")
      .select("id", "studentId", "courseId", "status", "grade")
      .where({
        studentId: student.id,
        courseId: course.id,
      })
      .first();

    if (existingEnrollment) {
      return {
        created: false,
        enrollment: existingEnrollment,
      };
    }

    const [enrollment] = await trx("Enrollment")
      .insert({
        studentId: student.id,
        courseId: course.id,
        status: "ACTIVE",
      })
      .returning(["id", "studentId", "courseId", "status", "grade"]);

    return {
      created: true,
      enrollment,
    };
  });
}

try {
  const result = await enrollStudent({
    studentEmail: "knex.andrii@student.test",
    courseTitle: "Knex API Design",
  });

  console.log("Transaction result:");
  console.dir(result, { depth: null });

  const duplicateResult = await enrollStudent({
    studentEmail: "knex.andrii@student.test",
    courseTitle: "Knex API Design",
  });

  console.log("Second call returns existing enrollment instead of duplicating:");
  console.dir(duplicateResult, { depth: null });
} finally {
  await db.destroy();
}
