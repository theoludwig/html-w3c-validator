import path from 'node:path'

import { Builtins, Cli } from 'clipanion'
import readPackage from 'read-pkg'

import { HTMLValidatorCommand } from './HTMLValidatorCommand.js'

const packageJSON = readPackage.sync({ cwd: path.join(__dirname, '..') })

export const cli = new Cli({
  binaryLabel: packageJSON.name,
  binaryName: packageJSON.name,
  binaryVersion: packageJSON.version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(HTMLValidatorCommand)
