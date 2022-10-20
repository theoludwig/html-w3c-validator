import path from 'node:path'
import fs from 'node:fs'

import { Command } from 'clipanion'
import chalk from 'chalk'
import ora from 'ora'
import logSymbols from 'log-symbols'
import type {
  ValidationMessageLocationObject,
  ParsedJsonAsValidationResults
} from 'html-validator'
import validateHTML from 'html-validator'
import { table } from 'table'

import { isExistingPath } from './utils/isExistingPath.js'

const CURRENT_DIRECTORY = process.cwd()
const CONFIG_FILE_NAME = '.html-w3c-validatorrc.json'

interface Config {
  urls?: string[]
  files?: string[]
}

interface Error {
  data: string
  messagesTable: string[][]
}

interface Result {
  data: string
  isSuccess: boolean
}

const printResults = (results: Result[]): void => {
  for (const result of results) {
    if (result.isSuccess) {
      console.log(logSymbols.success, result.data)
    } else {
      console.log(logSymbols.error, result.data)
    }
  }
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
      let config: Config = { urls: [], files: [] }
      let isValidConfig = true
      try {
        config = JSON.parse(configData)
      } catch {
        isValidConfig = false
      }
      isValidConfig =
        isValidConfig &&
        (Array.isArray(config.urls) || Array.isArray(config.urls))
      if (!isValidConfig) {
        throw new Error(
          `Invalid config file at ${configPath}. Please check the syntax.`
        )
      }
      const urls =
        config.urls == null
          ? []
          : config.urls.map((url) => {
              return { type: 'url', data: url }
            })
      const files =
        config.files == null
          ? []
          : config.files.map((file) => {
              return { type: 'file', data: file }
            })
      const dataToValidate = [...urls, ...files]
      const errors: Error[] = []
      let isValid = true
      const loader = ora(`Validating HTML (W3C)...`).start()
      const results: Result[] = []
      await Promise.all(
        dataToValidate.map(async ({ data, type }) => {
          try {
            const options = {
              format: 'json' as 'json' | undefined
            }
            let result: ParsedJsonAsValidationResults | undefined
            if (type === 'url') {
              result = await validateHTML({
                url: data,
                isLocal: true,
                ...options
              })
            } else if (type === 'file') {
              const htmlPath = path.resolve(CURRENT_DIRECTORY, data)
              if (!(await isExistingPath(htmlPath))) {
                throw new Error(
                  `No file found at ${htmlPath}. Please check the path.`
                )
              }
              const html = await fs.promises.readFile(htmlPath, {
                encoding: 'utf-8'
              })
              result = await validateHTML({
                data: html,
                ...options
              })
            } else {
              throw new Error('Invalid type')
            }
            const hasErrors = result.messages.some((message) => {
              return message.type === 'error'
            })
            if (!hasErrors) {
              results.push({ data, isSuccess: true })
            } else {
              results.push({ data, isSuccess: false })
              const messagesTable: string[][] = []
              for (const message of result.messages) {
                if (message.type === 'error') {
                  const row: string[] = []
                  row.push(chalk.red(message.type))
                  row.push(message.message)
                  const violation = message as ValidationMessageLocationObject
                  if (violation.extract != null) {
                    row.push(
                      `line: ${violation.lastLine}, column: ${violation.firstColumn}-${violation.lastColumn}`
                    )
                  }
                  messagesTable.push(row)
                }
              }
              errors.push({ data, messagesTable })
              isValid = false
            }
          } catch (error) {
            isValid = false
            if (error instanceof Error) {
              const messagesTable: string[][] = [[error.message]]
              errors.push({ data, messagesTable })
            }
          }
        })
      )
      if (!isValid) {
        loader.fail()
        printResults(results)
        for (const error of errors) {
          console.error(`\n${error.data}`)
          console.error(table(error.messagesTable))
          console.error('------------------------------')
        }
        console.error()
        throw new Error('HTML validation (W3C) failed!')
      }
      loader.succeed(
        `${chalk.bold.green('Success:')} HTML validation (W3C) passed! 🎉`
      )
      printResults(results)
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
