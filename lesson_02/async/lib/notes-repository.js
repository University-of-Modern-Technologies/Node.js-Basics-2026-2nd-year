import fs from 'node:fs/promises';
import { DATA_DIR, NOTES_PATH } from './paths.js';

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readNotes() {
  await ensureDataDir();

  try {
    const data = await fs.readFile(NOTES_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(NOTES_PATH, '[]', 'utf8');
      return [];
    }

    throw err;
  }
}

async function writeNotes(notes) {
  await ensureDataDir();
  await fs.writeFile(NOTES_PATH, JSON.stringify(notes, null, 2), 'utf8');
}

export async function createNote(note) {
  const notes = await readNotes();
  const newNote = {
    id: Date.now(),
    ...note,
  };
  notes.push(newNote);
  await writeNotes(notes);
  return newNote;
}

export async function updateNote(id, patch) {
  const notes = await readNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    throw new Error(`Note with id=${id} not found`);
  }

  const updated = { ...notes[index], ...patch };
  notes[index] = updated;
  await writeNotes(notes);
  return updated;
}

export async function deleteNote(id) {
  const notes = await readNotes();
  const filtered = notes.filter((note) => note.id !== id);
  await writeNotes(filtered);
}

