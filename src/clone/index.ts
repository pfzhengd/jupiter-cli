import chalk from 'chalk'
import { Options } from '..'
import { rootPathName } from '../config'
import { clearTemp, createProject } from '../create'
import { info } from '../spinner'
const { spawn } = require('child_process')

export function clone (repoAddress:string, targetPath:string, options:Options) {
  const log = info('正在下载模板。。。')
  clearTemp()
  const cmd = spawn('git', ['clone', repoAddress, targetPath], { stdio: 'inherit' })
  cmd.on('close', (status:number) => {
    log.clear()
    if (status === 0) {
      console.log(chalk.green('下载模板成功。'))
      try {
        createProject(options, rootPathName)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.log(chalk.redBright('创建项目时出现了错误:', errorMsg))
      }
    } else {
      console.log(chalk.redBright('下载模板时出现了错误，请检查网络或仓库地址是否正确'))
    }
  })
  cmd.on('error', (errMsg: Error) => {
    log.clear()
    console.log(chalk.redBright('执行 git clone 命令失败:', errMsg.message))
  })
}
