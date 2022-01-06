#!/usr/bin/env node
import chalk from 'chalk'
import { Cli } from 'clipanion'

import { cli } from './cli.js'

const [, , ...arguments_] = process.argv

cli.runExit(arguments_, Cli.defaultContext).catch(() => {
  console.error(chalk.red('Error occurred...'))
  process.exit(1)
})
