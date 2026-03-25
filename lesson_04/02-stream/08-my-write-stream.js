import fs from "node:fs";
import stream from "node:stream";
import path from "node:path";

class ToFileStream extends stream.Writable {
  constructor(options) {
    super(options);
  }
  _write(chunk, encoding, callback) {
    const dir = path.dirname(chunk.path);
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) return callback(err);
      fs.writeFile(chunk.path, chunk.content, callback);
    });
  }
}

const tfs = new ToFileStream({ objectMode: true });

const content = fs.readFileSync("07-write-random-chunks.js");

tfs.write({ path: "temp/file.js", content });
tfs.on("error", (err) => {});
tfs.end(() => {
  console.log("Done!");
});
