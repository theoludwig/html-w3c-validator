import { Command } from 'clipanion'

// const CURRENT_DIRECTORY = process.cwd()

export class HTMLValidatorCommand extends Command {
  static usage = {
    description:
      'CLI for validating multiple html pages using <https://validator.w3.org/>.'
  }

  async execute(): Promise<number> {
    console.log('html-w3c-validator')
    return 0
  }
}
