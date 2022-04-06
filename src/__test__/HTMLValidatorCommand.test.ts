import tap from 'tap'
import { execa } from 'execa'

import { cli } from '../cli.js'
import { HTMLValidatorCommand } from '../HTMLValidatorCommand.js'

await tap.test('html-w3c-validator', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process([])
    t.equal(command instanceof HTMLValidatorCommand, true)
  })

  await t.test('succeeds and validate the html correctly', async (t) => {
    const exampleURL = new URL('../../example', import.meta.url)
    process.chdir(exampleURL.pathname)
    await execa('rimraf', ['node_modules'])
    await execa('npm', ['install'])
    const { exitCode } = await execa('npm', ['run', 'test:html-w3c-validator'])
    t.equal(exitCode, 0)
  })
})
