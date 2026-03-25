import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

const studentSource = new Readable({
  objectMode: true,
  read() {
    [
      { id: 1, name: "Olena", score: 93 },
      { id: 2, name: "Dmytro", score: 78 },
      { id: 3, name: "Sofiia", score: 65 },
    ].forEach((s) => this.push(s));
    this.push(null);
  },
});

const gradeCalc = new Transform({
  objectMode: true,
  transform(student, _enc, callback) {
    if (typeof student.score !== "number") {
      return callback(new TypeError(`Invalid score for ${student.name}`));
    }
    const grade = student.score >= 90 ? "A" : student.score >= 75 ? "B" : "C";
    callback(null, { ...student, grade });
  },
});

const dbSink = new Writable({
  objectMode: true,
  async write(student, _enc, callback) {
    try {
      console.log(`Saved: ${student.name}:${student.grade}`);
      callback();
    } catch (err) {
      callback(err);
    }
  },
});

try {
  await pipeline(studentSource, gradeCalc, dbSink);
} catch (err) {
  console.error("Pipeline failed:", err);
}
