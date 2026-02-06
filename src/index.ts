import inquirer from 'inquirer'
import chalk from 'chalk'
import { clone } from './clone'
import template, { tempPathName } from './config'
const packageJson = require('../../package.json')
const { program } = require('commander')

export type Options = {
  name: string,
  description: string,
  author: string,
  type: 'js'|'ts'|'web'|'monorepo',
  gitAddress: string
}

(async function () {
  program
    .option('-c, --create', '创建启动项目的模版')
    .option('-v, --version', '查看当前脚手架的版本')
    .option('-h, --help', '查看帮助')
  program.parse(process.argv)
  const options = program.opts()
  if (options.version) {
    console.log(packageJson.version)
  } else if (options.create) {
    const prompts = [
      {
        name: 'name',
        type: 'input',
        message: '请输入要启动的项目名称：',
        validate (input:string) {
          const done = this.async()
          if (input.length > 0) {
            done(true)
          } else {
            done('项目名称不能为空')
          }
        }
      },
      {
        name: 'description',
        type: 'input',
        message: '请简单的对项目进行描述：',
        validate (input:string) {
          const done = this.async()
          if (input.length > 0) {
            done(true)
          } else {
            done('项目描述不能为空')
          }
        }
      },
      {
        name: 'author',
        type: 'input',
        message: '请输入项目的主要作者：',
        validate (input:string) {
          const done = this.async()
          if (input.length > 0) {
            done(true)
          } else {
            done('作者名称不能为空')
          }
        }
      },
      {
        name: 'type',
        type: 'list',
        message: '选择一个模版类型',
        choices: [
          {
            name: '纯JS模版，用于启动一个纯JS项目',
            value: 'js'
          },
          {
            name: 'TS模版，用于启动一个TS项目',
            value: 'ts'
          },
          {
            name: 'Web模版，用于启动一个Web项目',
            value: 'web'
          },
          {
            name: 'Monorepo模版，用于启动一个Monorepo多包项目',
            value: 'monorepo'
          }
        ]
      }
    ]
    const result: Options = await inquirer.prompt(prompts)
    if (result) {
      let templateUrl = ''
      switch (result.type) {
        case 'js':
          templateUrl = template.js
          break
        case 'ts':
          templateUrl = template.ts
          break
        case 'web':
          templateUrl = template.web
          break
        case 'monorepo':
          templateUrl = template.monorepo
          break
      }
      if (!templateUrl) {
        console.log(chalk.red('未找到对应的模板类型'))
        return
      }
      clone(templateUrl, tempPathName, result)
    }
  } else {
    program.help()
  }
})()
