import fs from "node:fs";
import Chance from "chance";

const chance = new Chance();

const file = fs.createWriteStream("file-stream.txt");

function writeRandomChunks() {
  while (chance.bool({ likelihood: 95 })) {
    const isOver = file.write(chance.string({ length: 16 * 1024 }));
    if (!isOver) {
      console.log("DRAIN!");
      return file.once("drain", writeRandomChunks);
    }
  }

  file.end("END!!", () => {
    console.log("Випадкові чанки дописано");
  });
}

writeRandomChunks();
