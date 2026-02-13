import chalk from 'chalk'
import { Options } from '..'
import { rootPathName } from '../config'
import { clearTemp, createProject } from '../create'
import { info } from '../spinner'
const { spawn } = require('child_process')

function execGit (args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const cmd = spawn('git', args, { stdio: 'inherit' })
    cmd.on('close', (code: number) => {
      if (code === 0) resolve()
      else reject(new Error(`git exited with code ${code}`))
    })
    cmd.on('error', (err: Error) => {
      reject(err)
    })
  })
}

export function clone (repoAddress: string, targetPath: string, options: Options) {
  // run in background so caller doesn't need to await
  ;(async () => {
    const log = info('正在下载模板。。。')
    clearTemp()

    const attempts: string[][] = [
      ['clone', repoAddress, targetPath],
      ['-c', 'http.version=HTTP/1.1', 'clone', repoAddress, targetPath],
      ['-c', 'http.version=HTTP/1.1', 'clone', '--depth=1', repoAddress, targetPath]
    ]

    let success = false
    let lastError: Error | undefined
    for (const args of attempts) {
      try {
        await execGit(args)
        success = true
        break
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err))
        // small delay between retries
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    log.clear()
    if (success) {
      console.log(chalk.green('下载模板成功。'))
      try {
        createProject(options, rootPathName)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.log(chalk.redBright('创建项目时出现了错误:', errorMsg))
      }
    } else {
      const msg = lastError ? lastError.message : 'Unknown error'
      console.log(chalk.redBright('下载模板时出现了错误，请检查网络或仓库地址是否正确。错误信息：'))
      console.log(chalk.redBright(msg))
      console.log(chalk.yellow('尝试的修复措施：1) 确保网络连通 2) 升级 git 到最新版本 3) 手动运行 `git -c http.version=HTTP/1.1 clone <repo> .temp`'))
    }
  })()
}
