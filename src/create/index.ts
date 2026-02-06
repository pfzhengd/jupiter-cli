
import { Options } from '..'
import { gitPathName, rootPathName, tempPathName } from '../config'
import * as path from 'path'
const fse = require('fs-extra')

function changePackageJson (options:Options) {
  try {
    const { name, description, author } = options
    const packageJsonPath = path.join(tempPathName, 'package.json')
    const packageJson:any = fse.readJsonSync(packageJsonPath)
    packageJson.name = name
    packageJson.description = description
    packageJson.author = author
    fse.writeJSONSync(packageJsonPath, packageJson, { spaces: 4 })
  } catch (ex) {
    const errorMsg = ex instanceof Error ? ex.message : String(ex)
    throw new Error(`修改 package.json 失败: ${errorMsg}`)
  }
}

export function createProject (options:Options, sourcePath:string) {
  const { name } = options
  const projectPath = `${rootPathName}${name}`
  if (!fse.pathExistsSync(projectPath)) {
    fse.ensureDir(projectPath)
  }
  clearGit()
  changePackageJson(options)
  fse.copySync(tempPathName, projectPath)
  clearTemp()
}

export function clearTemp () {
  fse.removeSync(tempPathName)
}

export function clearGit () {
  fse.removeSync(gitPathName)
}
