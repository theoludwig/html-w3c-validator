import path from 'node:path'
import fs from 'node:fs'

import { Command } from 'clipanion'
import chalk from 'chalk'
import ora from 'ora'
import validateHTML, { ValidationMessageLocationObject } from 'html-validator'
import { table } from 'table'

import { isExistingPath } from './utils/isExistingPath.js'

const CURRENT_DIRECTORY = process.cwd()
const CONFIG_FILE_NAME = '.html-w3c-validatorrc.json'

interface Config {
  urls: string[]
}

interface Error {
  url: string
  messagesTable: string[][]
}

export class HTMLValidatorCommand extends Command {
  static usage = {
    description:
      'CLI for validating multiple html pages using <https://validator.w3.org/>.'
  }

  async execute(): Promise<number> {
    const configPath = path.join(CURRENT_DIRECTORY, CONFIG_FILE_NAME)
    try {
      if (!(await isExistingPath(configPath))) {
        throw new Error(
          `No config file found at ${configPath}. Please create ${CONFIG_FILE_NAME}.`
        )
      }

      const configData = await fs.promises.readFile(configPath, {
        encoding: 'utf-8'
      })
      let config: Config = { urls: [] }
      let isValidConfig = true
      try {
        config = JSON.parse(configData)
      } catch {
        isValidConfig = false
      }
      isValidConfig = isValidConfig && Array.isArray(config.urls)
      if (!isValidConfig) {
        throw new Error(
          `Invalid config file at ${configPath}. Please check the syntax.`
        )
      }

      const errors: Error[] = []
      let isValid = true
      for (const url of config.urls) {
        const loader = ora(`Validating ${url}`).start()
        const result = await validateHTML({
          url,
          format: 'json',
          isLocal: true
        })
        const isValidHTML = result.messages.length === 0
        if (isValidHTML) {
          loader.succeed()
        } else {
          loader.fail()
          const messagesTable: string[][] = []
          for (const message of result.messages) {
            const row: string[] = []
            if (message.type === 'error') {
              row.push(chalk.red(message.type))
            } else {
              row.push(chalk.yellow(message.type))
            }
            row.push(message.message)
            const violation = message as ValidationMessageLocationObject
            if (violation.extract != null) {
              row.push(
                `line: ${violation.lastLine}, column: ${violation.firstColumn}-${violation.lastColumn}`
              )
            }
            messagesTable.push(row)
          }
          errors.push({ url, messagesTable })
          isValid = false
        }
      }

      if (!isValid) {
        for (const error of errors) {
          console.error(`\n${error.url}`)
          console.error(table(error.messagesTable))
          console.error('------------------------------')
        }
        console.error()
        throw new Error('HTML validation (W3C) failed!')
      }
      console.log()
      console.log(
        `${chalk.bold.green('Success:')} HTML validation (W3C) passed! 🎉`
      )
      return 0
    } catch (error) {
      if (error instanceof Error) {
        console.error(`${chalk.bold.red('Error:')} ${error.message}`)
      } else {
        console.error(
          `${chalk.bold.red('Error:')} HTML validation (W3C) failed!`
        )
      }
      return 1
    }
  }
}
