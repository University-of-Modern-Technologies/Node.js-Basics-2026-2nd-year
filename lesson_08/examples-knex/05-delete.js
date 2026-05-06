import db from "./db.js";

// Основні Knex-операції для видалення:
// del() / delete() - видалити рядки, які підходять під where; зазвичай повертає count.
//
// У schema.prisma для Enrollment увімкнено onDelete: Cascade.
// Тому при видаленні Student пов'язані Enrollment-записи видаляться автоматично.

try {
  const student = await db("Student")
    .select("id", "email", "name")
    .where({ email: "knex.maria@student.test" })
    .first();

  if (!student) {
    throw new Error("Run `npm run knex:seed` before this demo.");
  }

  const deletedCount = await db("Student").where({ id: student.id }).del();

  console.log("Deleted student with cascaded enrollments:");
  console.dir({ deletedCount, student }, { depth: null });
} finally {
  await db.destroy();
}
