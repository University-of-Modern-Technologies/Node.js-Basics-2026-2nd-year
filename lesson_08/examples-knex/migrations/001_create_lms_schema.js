export async function up(knex) {
  await knex.schema.createTable("Student", (table) => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("name").notNullable();
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("Instructor", (table) => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("name").notNullable();
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("Course", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.boolean("isPublished").notNullable().defaultTo(false);
    table.integer("instructorId").unsigned().notNullable();
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    table.foreign("instructorId").references("Instructor.id");
    table.index(["instructorId"]);
    table.index(["isPublished"]);
  });

  await knex.schema.createTable("Enrollment", (table) => {
    table.increments("id").primary();
    table.integer("studentId").unsigned().notNullable();
    table.integer("courseId").unsigned().notNullable();
    table.string("status").notNullable().defaultTo("ACTIVE");
    table.integer("grade");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("enrolledAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    table.foreign("studentId").references("Student.id").onDelete("CASCADE");
    table.foreign("courseId").references("Course.id").onDelete("CASCADE");
    table.unique(["studentId", "courseId"]);
    table.index(["courseId"]);
    table.index(["status"]);
  });

  await knex.schema.raw(`
    CREATE TRIGGER enrollment_status_check_insert
    BEFORE INSERT ON Enrollment
    FOR EACH ROW
    WHEN NEW.status NOT IN ('ACTIVE', 'COMPLETED', 'CANCELLED')
    BEGIN
      SELECT RAISE(ABORT, 'Invalid Enrollment.status');
    END;
  `);

  await knex.schema.raw(`
    CREATE TRIGGER enrollment_status_check_update
    BEFORE UPDATE OF status ON Enrollment
    FOR EACH ROW
    WHEN NEW.status NOT IN ('ACTIVE', 'COMPLETED', 'CANCELLED')
    BEGIN
      SELECT RAISE(ABORT, 'Invalid Enrollment.status');
    END;
  `);
}

export async function down(knex) {
  await knex.schema.raw("DROP TRIGGER IF EXISTS enrollment_status_check_update");
  await knex.schema.raw("DROP TRIGGER IF EXISTS enrollment_status_check_insert");
  await knex.schema.dropTableIfExists("Enrollment");
  await knex.schema.dropTableIfExists("Course");
  await knex.schema.dropTableIfExists("Instructor");
  await knex.schema.dropTableIfExists("Student");
}
