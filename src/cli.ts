import { Builtins, Cli } from 'clipanion'

import { HTMLValidatorCommand } from './HTMLValidatorCommand.js'
import { packageJSON } from './packageJSON.js'

export const cli = new Cli({
  binaryLabel: packageJSON.name,
  binaryName: packageJSON.name,
  binaryVersion: packageJSON.version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(HTMLValidatorCommand)
