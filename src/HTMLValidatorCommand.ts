import path from 'node:path'
import fs from 'node:fs'

import { Command, Option } from 'clipanion'
import * as typanion from 'typanion'
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

export const CONFIG_FILE_NAME = '.html-w3c-validatorrc.json'

const severities = ['error', 'warning', 'info'] as const

export type Severity = (typeof severities)[number]

interface Config {
  urls?: string[]
  files?: string[]
  severities?: Severity[]
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
  static override usage = {
    description:
      'CLI for validating multiple html pages using <https://validator.w3.org/>.'
  }

  public currentWorkingDirectory = Option.String(
    '--current-working-directory',
    process.cwd(),
    {
      description: 'The current working directory.',
      validator: typanion.isString()
    }
  )

  public async execute(): Promise<number> {
    const configPath = path.join(this.currentWorkingDirectory, CONFIG_FILE_NAME)
    try {
      if (!(await isExistingPath(configPath))) {
        throw new Error(
          `No config file found at ${configPath}. Please create "${CONFIG_FILE_NAME}".`
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
      if (!isValidConfig) {
        throw new Error(
          `Invalid config file at "${configPath}". Please check the JSON syntax.`
        )
      }
      if (config.urls != null && !Array.isArray(config.urls)) {
        throw new Error(
          `Invalid config file at "${configPath}". Please include an array of URLs.`
        )
      }
      if (config.files != null && !Array.isArray(config.files)) {
        throw new Error(
          `Invalid config file at "${configPath}". Please include an array of files.`
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
      if (dataToValidate.length === 0) {
        throw new Error(
          `Invalid config file at "${configPath}". Please add URLs or files.`
        )
      }
      const configSeverities: Severity[] = config.severities ?? [
        'warning',
        'error'
      ]
      for (const severity of configSeverities) {
        if (!severities.includes(severity)) {
          throw new Error(
            `Invalid config file at "${configPath}". Please add valid severities (${severities.join(
              ', '
            )}).`
          )
        }
      }
      if (configSeverities.length === 0) {
        throw new Error(
          `Invalid config file at "${configPath}". Please add valid severities (${severities.join(
            ', '
          )}).`
        )
      }
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
              const htmlPath = path.resolve(this.currentWorkingDirectory, data)
              if (!(await isExistingPath(htmlPath))) {
                throw new Error(
                  `No file found at "${htmlPath}". Please check the path.`
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
              return (
                configSeverities.includes(message.type as Severity) ||
                configSeverities.includes(message.subType as Severity)
              )
            })
            if (!hasErrors) {
              results.push({ data, isSuccess: true })
            } else {
              results.push({ data, isSuccess: false })
              const messagesTable: string[][] = []
              for (const message of result.messages) {
                const row: string[] = []
                if (message.type === 'info') {
                  if (message.subType === 'warning') {
                    row.push(chalk.yellow(message.subType))
                  } else {
                    row.push(chalk.blue(message.type))
                  }
                } else {
                  row.push(chalk.red(message.type))
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
