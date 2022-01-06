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
    console.log = jest.fn()
    const exitCode = await cli.run([], {
      stdin: process.stdin
    })
    expect(console.log).toHaveBeenCalledWith('html-w3c-validator')
    expect(exitCode).toEqual(0)
  })
})
