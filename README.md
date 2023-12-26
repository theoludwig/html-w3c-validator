<h1 align="center">html-w3c-validator</h1>

<p align="center">
  <strong>CLI for validating multiple html pages using <a href="https://validator.w3.org/">validator.w3.org</a>.</strong>
</p>

</p>

<p align="center">
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="CONTRIBUTING" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue.svg" alt="Licence MIT"/></a>
  <a href="./CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" alt="Contributor Covenant" /></a>
  <br />
  <a href="https://github.com/theoludwig/html-w3c-validator/actions/workflows/build.yml"><img src="https://github.com/theoludwig/html-w3c-validator/actions/workflows/build.yml/badge.svg?branch=develop" alt="Build" /></a>
  <a href="https://github.com/theoludwig/html-w3c-validator/actions/workflows/lint.yml"><img src="https://github.com/theoludwig/html-w3c-validator/actions/workflows/lint.yml/badge.svg?branch=develop" alt="Lint" /></a>
  <a href="https://github.com/theoludwig/html-w3c-validator/actions/workflows/test.yml"><img src="https://github.com/theoludwig/html-w3c-validator/actions/workflows/test.yml/badge.svg?branch=develop" alt="Test" /></a>
  <br />
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release" /></a>
  <a href="https://www.npmjs.com/package/html-w3c-validator"><img src="https://img.shields.io/npm/v/html-w3c-validator.svg" alt="npm version"></a>
</p>

## 📜 About

**html-w3c-validator** is a CLI tool to validate multiple html pages using [validator.w3.org](https://validator.w3.org/).

You might use a JavaScript framework or simply use HTML but **you should always validate your production HTML** and this validation should be part of your CI/CD pipeline (tests, linting, etc.).

### Why should I validate my HTML pages?

Quote from [https://validator.w3.org/docs/help.html#why-validate](https://validator.w3.org/docs/help.html#why-validate):

> One of the important maxims of computer programming is: "Be conservative in what you produce; be liberal in what you accept."
>
> Browsers follow the second half of this maxim by accepting Web pages and trying to display them even if they're not legal HTML. Usually this means that the browser will try to make educated guesses about what you probably meant. The problem is that different browsers (or even different versions of the same browser) will make different guesses about the same illegal construct; worse, if your HTML is really pathological, the browser could get hopelessly confused and produce a mangled mess, or even crash.

## ⚙️ Getting Started

You can combine **html-w3c-validator** with [start-server-and-test](https://github.com/bahmutov/start-server-and-test) to validate HTML pages of your project.

### Prerequisites

- [Node.js](https://nodejs.org/) >= 16.0.0

### Installation (with [start-server-and-test](https://github.com/bahmutov/start-server-and-test))

```sh
npm install --save-dev html-w3c-validator start-server-and-test
```

## ⚙️ Configuration

### `package.json`

```jsonc
{
  "scripts": {
    // Command to start the server serving your HTML pages (e.g: using vercel/serve)
    "start": "serve \"./build\"",

    // Command to validate your HTML pages
    "test:html-w3c-validator": "start-server-and-test \"start\" \"http://127.0.0.1:3000\" \"html-w3c-validator\""
  }
}
```

### `.html-w3c-validatorrc.json`

```jsonc
{
  "urls": ["http://127.0.0.1:3000/", "http://127.0.0.1:3000/about"],

  // You can also specify HTML files instead of URLs
  "files": ["./index.html", "./about.html"],

  // Specify the severities of the validator (default: ["warning", "error"])
  "severities": ["info", "warning", "error"]
}
```

## Usage

```sh
npm run test:html-w3c-validator
```

Example of output (in case of success):

```txt
✔ Validating http://127.0.0.1:3000/
✔ Validating http://127.0.0.1:3000/about

Success: HTML validation (W3C) passed! 🎉
```

See the [./example](./example) folder for practical usage.

### Options

```text
-V, --version       Output the version number.
-h, --help          Display help for command.
```

## 💡 Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## 📄 License

[MIT](./LICENSE)
