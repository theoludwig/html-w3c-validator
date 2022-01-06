import path from 'node:path'

import execa from 'execa'

import { cli } from '../cli.js'
import { HTMLValidatorCommand } from '../HTMLValidatorCommand.js'

describe('html-w3c-validator', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be instance of the command', async () => {
    const command = cli.process([])
    expect(command).toBeInstanceOf(HTMLValidatorCommand)
  })

  it('succeeds and validate the html correctly', async () => {
    const examplePath = path.join(__dirname, '..', '..', 'example')
    process.chdir(examplePath)
    await execa('rimraf', ['node_modules'])
    await execa('npm', ['install'])
    const { exitCode } = await execa('npm', ['run', 'test:html-w3c-validator'])
    expect(exitCode).toEqual(0)
  })
})
