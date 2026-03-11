#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {
  readNotes,
  createNote,
  updateNote,
  deleteNote,
} from './lib/notes-repository.js'

yargs(hideBin(process.argv))
  .scriptName('notes-cli')
  .usage('Usage: $0 <command> [options]')
  .command('list', 'Вивести список усіх нотаток', {}, async (argv) => {
    try {
      const notes = await readNotes()
      console.log(notes)
    } catch (err) {
      console.error('Помилка при зчитуванні нотаток:', err.message)
      process.exit(1)
    }
  })
  .command(
    'create',
    'Створити нову нотатку',
    (yargs) => {
      yargs.positional('title', {
        describe: 'Заголовок нотатки',
        type: 'string',
      })
      yargs.positional('content', {
        describe: 'Вміст нотатки',
        type: 'string',
      })
    },
    async (argv) => {
      const { title, content } = argv
      try {
        const note = await createNote({ title, content })
        console.log('Створено:', note)
      } catch (err) {
        console.error('Помилка при створенні нотатки:', err.message)
        process.exit(1)
      }
    },
  )
  .command(
    'update',
    'Оновити заголовок нотатки',
    (yargs) => {
      yargs.positional('id', {
        describe: 'ID нотатки',
        type: 'number',
      })
      yargs.positional('newTitle', {
        describe: 'Новий заголовок',
        type: 'string',
      })
    },
    async (argv) => {
      const { id, newTitle } = argv
      try {
        const updated = await updateNote(id, { title: newTitle })
        console.log('Оновлено:', updated)
      } catch (err) {
        console.error('Помилка при оновленні нотатки:', err.message)
        process.exit(1)
      }
    },
  )
  .command(
    'delete',
    'Видалити нотатку',
    (yargs) => {
      yargs.positional('id', {
        describe: 'ID нотатки',
        type: 'number',
      })
    },
    async (argv) => {
      const { id } = argv
      try {
        await deleteNote(id)
        console.log(`Видалено нотатку з id=${id}`)
      } catch (err) {
        console.error('Помилка при видаленні нотатки:', err.message)
        process.exit(1)
      }
    },
  )
  .demandCommand(1, 'Вкажіть команду')
  .help('h')
  .alias('h', 'help')
  .version('1.0.0')
  .alias('v', 'version')
  .parse()
