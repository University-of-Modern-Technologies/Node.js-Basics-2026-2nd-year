import prisma from "../db.js";

// Основні методи Prisma Client для видалення:
// delete     - видалити один запис по @unique або @@unique; якщо не знайдено, буде помилка.
// deleteMany - видалити всі записи, які підходять під where; повертає count.
//
// У schema.prisma для Enrollment увімкнено onDelete: Cascade.
// Тому при видаленні Student база сама видалить пов'язані Enrollment-записи.
// Це production-style варіант: код видаляє основну сутність, а залежні записи чистяться автоматично.

try {
  // Знаходимо Марію по unique email.
  // include тут потрібен тільки для демонстрації: ми бачимо, що у студентки є Enrollment-записи.
  const student = await prisma.student.findUnique({
    where: { email: "maria@student.test" },
    include: {
      enrollments: true,
    },
  });

  // Якщо seed не запускали або Марію вже видалили, демо не має над чим працювати.
  if (!student) {
    throw new Error("Run `npm run seed` before this demo.");
  }

  // delete працює тільки по unique-полю; тут використовуємо id.
  // Пов'язані Enrollment-записи видаляться автоматично через onDelete: Cascade.
  const deletedStudent = await prisma.student.delete({
    where: {
      id: student.id,
    },
  });

  console.log("Deleted student with cascaded enrollments:");
  console.dir(deletedStudent, { depth: null });
} finally {
  await prisma.$disconnect();
}
