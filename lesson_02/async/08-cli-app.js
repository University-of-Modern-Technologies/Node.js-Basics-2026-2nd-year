#!/usr/bin/env node

import { Command } from 'commander'
import {
  readNotes,
  createNote,
  updateNote,
  deleteNote,
} from './lib/notes-repository.js'

const program = new Command()

program
  .name('notes-cli')
  .description('CLI для роботи з нотатками')
  .version('1.0.0')

program
  .command('list')
  .description('Вивести список усіх нотаток')
  .action(async () => {
    try {
      const notes = await readNotes()
      console.log(notes)
    } catch (err) {
      console.error('Помилка при зчитуванні нотаток:', err.message)
      process.exit(1)
    }
  })

program
  .command('create')
  .description('Створити нову нотатку')
  .argument('<title>', 'Заголовок нотатки')
  .argument('<content>', 'Вміст нотатки')
  .action(async (title, content) => {
    try {
      const note = await createNote({ title, content })
      console.log('Створено:', note)
    } catch (err) {
      console.error('Помилка при створенні нотатки:', err.message)
      process.exit(1)
    }
  })

program
  .command('update')
  .description('Оновити заголовок нотатки')
  .argument('<id>', 'ID нотатки', (value) => {
    const id = Number(value)
    if (!id || isNaN(id)) {
      console.error('Помилка: ID має бути числом')
      process.exit(1)
    }
    return id
  })
  .argument('<newTitle>', 'Новий заголовок')
  .action(async (id, newTitle) => {
    try {
      const updated = await updateNote(id, { title: newTitle })
      console.log('Оновлено:', updated)
    } catch (err) {
      console.error('Помилка при оновленні нотатки:', err.message)
      process.exit(1)
    }
  })

program
  .command('delete')
  .description('Видалити нотатку')
  .argument('<id>', 'ID нотатки', (value) => {
    const id = Number(value)
    if (!id || isNaN(id)) {
      console.error('Помилка: ID має бути числом')
      process.exit(1)
    }
    return id
  })
  .action(async (id) => {
    try {
      await deleteNote(id)
      console.log(`Видалено нотатку з id=${id}`)
    } catch (err) {
      console.error('Помилка при видаленні нотатки:', err.message)
      process.exit(1)
    }
  })

program.parse()
