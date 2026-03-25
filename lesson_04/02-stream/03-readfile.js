import fs from "node:fs";

// highWaterMark — розмір внутрішнього буфера читання (байти); менше значення → дрібніші чанки в "data".
// За замовчуванням ~64 KiB, тоді для маленького файлу часто один великий chunk.
const read = fs.createReadStream("../01-zip/test.txt", { highWaterMark: 80 });

read.on("data", (chunk) => {
  console.log(`Chunk read: size(${chunk.length}) - ${chunk.toString()}`);
});

read.on("end", () => {
  console.log("Файл закінчився");
});
