const { getDefaultConfig } = require('expo/metro-config')
const exclusionList = require('metro-config/src/defaults/exclusionList')
const path = require('path')

const config = getDefaultConfig(__dirname)
const escapePath = (filePath) => filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const projectPath = escapePath(path.resolve(__dirname))

config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: false,
  },
  additionalExts: [],
  watchman: {
    deferStates: ['hg.update'],
  },
}

config.watchFolders = [__dirname]
config.resolver = {
  ...config.resolver,
  blockList: exclusionList([
    new RegExp(`^${projectPath}/\\.git/.*`),
    new RegExp(`^${projectPath}/\\.expo/.*`),
    new RegExp(`^${projectPath}/dist/.*`),
    /node_modules\/.*\/node_modules\/.*/,
  ]),
}

module.exports = config
