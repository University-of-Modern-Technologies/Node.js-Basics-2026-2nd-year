import stream from "node:stream";
import esMain from "es-main/main.js";

// Кастомний Transform: на вході — сирі чанки (Buffer/string), на виході — той самий потік байтів,
// але з підстановкою searchString → replaceString. Складність: шуканий фрагмент може «розрізатися»
// між двома послідовними chunk; тому між викликами _transform тримаємо хвіст довжиною (N−1) символів.

class ReplaceStream extends stream.Transform {
  constructor(searchString, replaceString) {
    super();
    this.searchString = searchString;
    this.replaceString = replaceString;
    // Накопичений «хвіст» останнього чанка: можливий префікс майбутнього входження searchString.
    this.tailPiece = "";
  }

  _transform(chunk, encoding, cb) {
    // Використовуємо рядкову склейку: chunk коректно стає рядком при конкатенації з tailPiece.
    const pieces = (this.tailPiece + chunk).split(this.searchString);
    const lastPiece = pieces[pieces.length - 1];
    const tailPieceLen = this.searchString.length - 1;

    // Останній елемент після split може закінчуватися початком searchString (решта прийде в наступному chunk).
    // Зберігаємо останні (N−1) символів у tailPiece; решту останнього сегмента лишаємо «закритою» в pieces.
    this.tailPiece = lastPiece.slice(-tailPieceLen);
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailPieceLen);

    // Між усіма розбитими сегментами вставляємо replaceString — це й є глобальна заміна на межі поточного буфера.
    this.push(pieces.join(this.replaceString));
    cb();
  }

  _flush(cb) {
    // Коли вхід закінчився, в tailPiece не може лишитися повного searchString (інакше він був би вже знайдений).
    // Виводимо залишок байтів/символів, щоб нічого не загубити.
    this.push(this.tailPiece);
    cb();
  }
}

export default ReplaceStream;

if (esMain(import.meta)) {
  // Локальний тест без stdin: кілька write() імітують розрізання слова «World» між чанками.
  const rs = new ReplaceStream("World", "Node.js");

  rs.on("data", (chunk) => console.log(chunk.toString()));

  rs.write("Hello W");
  rs.write("orld");
  rs.write("Hello World");
  rs.end("!");
}
