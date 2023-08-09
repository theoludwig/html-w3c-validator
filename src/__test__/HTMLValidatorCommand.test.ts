import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { PassThrough } from 'node:stream'

import sinon from 'sinon'
import { execa } from 'execa'
import { table } from 'table'
import chalk from 'chalk'
import logSymbols from 'log-symbols'

import { cli } from '../cli.js'
import {
  HTMLValidatorCommand,
  CONFIG_FILE_NAME,
  SEVERITIES
} from '../HTMLValidatorCommand.js'

const FIXTURES_PATH = path.join(process.cwd(), 'src', '__test__', 'fixtures')

await test('html-w3c-validator', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('should be instance of the command', async () => {
    const command = cli.process([])
    assert(command instanceof HTMLValidatorCommand)
  })

  await t.test(
    'succeeds and validate the html correctly (example)',
    async () => {
      const exampleURL = new URL('../../example', import.meta.url)
      process.chdir(exampleURL.pathname)
      await execa('rimraf', ['node_modules'])
      await execa('npm', ['install'])
      const { exitCode } = await execa('npm', [
        'run',
        'test:html-w3c-validator'
      ])
      assert.strictEqual(exitCode, 0)
    }
  )

  await t.test(
    'succeeds and validate the html correctly (example without working directory)',
    async () => {
      const logs: string[] = []
      sinon.stub(console, 'log').value((log: string) => {
        logs.push(log)
      })
      const consoleLogSpy = sinon.spy(console, 'log')
      const stream = new PassThrough()
      const exitCode = await cli.run([], {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      })
      stream.end()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(
        consoleLogSpy.calledWith(
          logSymbols.success,
          './example/build/index.html'
        ),
        true,
        logs.join('\n')
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(
          logSymbols.success,
          './example/build/about.html'
        ),
        true,
        logs.join('\n')
      )
    }
  )

  await t.test(
    'succeeds and validate the html correctly (fixture)',
    async () => {
      const workingDirectory = path.join(FIXTURES_PATH, 'success')
      const logs: string[] = []
      sinon.stub(console, 'log').value((log: string) => {
        logs.push(log)
      })
      const consoleLogSpy = sinon.spy(console, 'log')
      const stream = new PassThrough()
      const exitCode = await cli.run(
        [`--current-working-directory=${workingDirectory}`],
        {
          stdin: process.stdin,
          stdout: stream,
          stderr: stream
        }
      )
      stream.end()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(
        consoleLogSpy.calledWith(logSymbols.success, './build/index.html'),
        true,
        logs.join('\n')
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(logSymbols.success, './build/about.html'),
        true,
        logs.join('\n')
      )
    }
  )

  await t.test('fails with not found config', async () => {
    const workingDirectory = path.join(FIXTURES_PATH, 'error-config-not-found')
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` No config file found at ${configPath}. Please create "${CONFIG_FILE_NAME}".`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid JSON config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-json'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please check the JSON syntax.`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid URLs config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-urls'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please include an array of URLs.`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid files config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-files'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please include an array of files.`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid files and urls config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-files-and-urls'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please add URLs or files.`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid severities config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-severities'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please add valid severities (${SEVERITIES.join(
            ', '
          )}).`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid empty severities config', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-config-invalid-severities-empty'
    )
    const configPath = path.join(workingDirectory, CONFIG_FILE_NAME)
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') +
          ` Invalid config file at "${configPath}". Please add valid severities (${SEVERITIES.join(
            ', '
          )}).`
      ),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid files paths to check', async () => {
    const workingDirectory = path.join(
      FIXTURES_PATH,
      'error-invalid-files-paths-to-check'
    )
    const htmlPath = path.resolve(workingDirectory, 'index.html')
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    const messagesTable = [
      [`No file found at "${htmlPath}". Please check the path.`]
    ]
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') + ' HTML validation (W3C) failed!'
      ),
      true,
      errors.join('\n')
    )
    assert.strictEqual(
      consoleErrorSpy.calledWith(table(messagesTable)),
      true,
      errors.join('\n')
    )
  })

  await t.test('fails with invalid W3C HTML', async () => {
    const workingDirectory = path.join(FIXTURES_PATH, 'error-invalid-w3c-html')
    const errors: string[] = []
    sinon.stub(console, 'error').value((error: string) => {
      errors.push(error)
    })
    const consoleErrorSpy = sinon.spy(console, 'error')
    const stream = new PassThrough()
    const exitCode = await cli.run(
      [`--current-working-directory=${workingDirectory}`],
      {
        stdin: process.stdin,
        stdout: stream,
        stderr: stream
      }
    )
    stream.end()
    assert.strictEqual(exitCode, 1)
    const messagesTable = [
      [
        chalk.yellow('warning'),
        'Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.',
        'line: 2, column: 16-6'
      ]
    ]
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        chalk.bold.red('Error:') + ' HTML validation (W3C) failed!'
      ),
      true,
      errors.join('\n')
    )
    assert.strictEqual(
      consoleErrorSpy.calledWith(table(messagesTable)),
      true,
      errors.join('\n')
    )
  })
})
