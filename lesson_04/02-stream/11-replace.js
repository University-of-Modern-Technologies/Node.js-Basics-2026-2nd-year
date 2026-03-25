import ReplaceStream from "./10-transform.js";

const search = process.argv[2];
const replace = process.argv[3];

if (search == null || replace == null) {
  console.error("Використання: node 11-replace.js <шукати> <замінити>");
  process.exit(1);
}

process.stdin.pipe(new ReplaceStream(search, replace)).pipe(process.stdout);
