import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import fixPath from 'fix-path';
import { add } from 'lodash';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

fixPath();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
export let mainWindow: BrowserWindow;
export const createWindow = (): void => {
  // generate unique id for this window
  const id = Date.now().toString();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1024,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      additionalArguments: [`--window-id=${id}`],
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize();
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  BrowserWindow.getAllWindows().forEach(window => {
    console.log('window IDS created', window.webContents.id)
  })
  require('./electron/engine')
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow);

// when a window is closed event
app.on('web-contents-created', (event, contents) => {
  console.log('web-contents-created', contents.id)
})



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here


const isMac = process.platform === 'darwin'

import shellMenu from './electron/menus/shell';
import { execCommand } from './electron/menus/commands';

const commandKeys: Record<string, string> = {
  'tab:new': 'CmdOrCtrl+T',
  'window:new': 'CmdOrCtrl+N',
  'pane:splitDown': 'CmdOrCtrl+D',
  'pane:splitRight': 'CmdOrCtrl+E',
  'pane:close': 'CmdOrCtrl+W',
  'window:close': 'CmdOrCtrl+Q',
};



const menu = [shellMenu(commandKeys, execCommand)]
Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

import fs from 'fs/promises'
import { readlink, stat } from 'fs';
//const menu = Menu.buildFromTemplate(shellMenu([], undefined))
//Menu.setApplicationMenu(menu)

const myFS = {
  promises: {
    readdir: async (path: string, options: any): Promise<string[]> => {
      // call node fs.readdir
      //console.log('myFS.readdir', path, options)
      const file = await fs.readdir(path, {
        encoding: 'utf8',
      })
      //console.log('myFS.readdir', file)
      return file
    },

    readFile: async (path: string, options: any): Promise<string> => {
      //console.log('myFS.readFile', path, options)
      const file = await (fs as any).readFile(path, options)
      //console.log('myFS.readFile', file)
      return file


    },

    async writeFile(path: string, content: string): Promise<void> {
      return fs.writeFile(path, content, 'utf8')
    },

    async mkdir(path: string): Promise<void> {
      return fs.mkdir(path)
    },

    async rmdir(path: string): Promise<void> {
      return fs.rmdir(path)
    },

    async unlink(path: string): Promise<void> {
      return fs.unlink(path)
    },

    async rename(oldPath: string, newPath: string): Promise<void> {
      return fs.rename(oldPath, newPath)
    },

    async stat(path: string): Promise<any> {
      //console.log('myFS.stat', path)
      const stat = await fs.stat(path)
      //console.log('myFS.stat', stat)
      return stat
    },

    async lstat(path: string): Promise<any> {
      const lstat = await fs.lstat(path)
      //console.log('myFS.stat', path, lstat)
      return lstat
    },

    readlink: async (path: string): Promise<string> => {
      return fs.readlink(path)
    },
    symlink: async (target: string, path: string): Promise<void> => {
      return fs.symlink(target, path)
    }


  }
}

console.log('myFS', myFS)
import git, { CommitObject, ReadCommitResult } from 'isomorphic-git'
async function checkGit() {


  const files = await git.statusMatrix({ fs: myFS, dir: '/Volumes/bunsen/code/rmproject2/remix-project', filepaths: ['apps/1test/src/index.ts'] });
  console.log('GIT', files)
}


//checkGit()

/*
setInterval(() => {

const startTime = Date.now()
checkGit()
  .then(() => {
    console.log('checkGit', Date.now() - startTime)
  })

}, 3000)

*/
/*
git.add({ fs: myFS, dir: '/Volumes/bunsen/code/rmproject2/remix-project', filepath: 'test.txt' }).then(() => {
  console.log('git add')
}).catch((e: any) => {
  console.log('git add error', e)
})

git.log({ fs: myFS, dir: '/Volumes/bunsen/code/rmproject2/remix-project', depth:10 }).then((log: any) => {
  console.log('git log', log)
})
*/

// run a shell command
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const statusTransFormMatrix = (status: string) => {
  switch (status) {
    case '??':
      return [0, 2, 0]
    case 'A ':
      return [0, 2, 2]
    case 'M ':
      return [1, 2, 2]
    case 'MM':
      return [1, 2, 3]
    case ' M':
      return [1, 0, 1]
    case ' D':
      return [0, 2, 0]
    case 'D ':
      return [1, 0, 0]
    case 'AM':
      return [0, 2, 3]
    default:
      return [-1, -1, -1]
  }
}



execAsync('git status --porcelain -uall', { cwd: '/Volumes/bunsen/code/rmproject2/remix-project' }).then(async (result: any) => {
  //console.log('git status --porcelain -uall', result.stdout)
  // parse the result.stdout
  const lines = result.stdout.split('\n')
  const files: any = []
  const fileNames: any = []
  //console.log('lines', lines)
  lines.forEach((line: string) => {
    // get the first two characters of the line
    const status = line.slice(0, 2)

    const file = line.split(' ').pop()

    //console.log('line', line)
    if (status && file) {
      fileNames.push(file)
      files.push([
        file,
        ...statusTransFormMatrix(status)
      ])
    }
  }
  )
  // sort files by first column
  files.sort((a: any, b: any) => {
    if (a[0] < b[0]) {
      return -1
    }
    if (a[0] > b[0]) {
      return 1
    }
    return 0
  })

  //console.log('files', files, files.length)
  const iso = await git.statusMatrix({ fs: myFS, dir: '/Volumes/bunsen/code/rmproject2/remix-project', filepaths: fileNames });
  //console.log('GIT', iso, iso.length)
})

git.log({ fs: myFS, dir: '/Volumes/bunsen/code/rmproject2/remix-project', depth:3 }).then((log: ReadCommitResult[]) => {
  log.forEach((commit: ReadCommitResult) => {
    console.log('commit', commit.commit.parent)
  })
})

// exec git log --pretty=format:"%h - %an, %ar : %s" -n 10
execAsync(`git log --pretty=format:'{ "oid":"%H", "message":"%s", "author":"%an", "email": "%ae", "timestamp":"%at", "tree": "%T", "committer": "%cn", "committer-email": "%ce", "committer-timestamp": "%ct", "parent": "%P" }' -n 3`, { cwd: '/Volumes/bunsen/code/rmproject2/remix-project' }).then(async (result: any) =>{
  //console.log('git log', result.stdout)
  const lines = result.stdout.split('\n')
  const commits: ReadCommitResult[] = []
  lines.forEach((line: string) => {
    console.log('line', line)
    const data = JSON.parse(line)
    let commit:ReadCommitResult = {} as ReadCommitResult
    commit.oid = data.oid
    commit.commit = {} as CommitObject
    commit.commit.message = data.message
    commit.commit.tree = data.tree
    commit.commit.committer = {} as any
    commit.commit.committer.name = data.committer
    commit.commit.committer.email = data['committer-email']
    commit.commit.committer.timestamp = data['committer-timestamp']
    commit.commit.author = {} as any
    commit.commit.author.name = data.author
    commit.commit.author.email = data.email
    commit.commit.author.timestamp = data.timestamp
    commit.commit.parent = [data.parent]
    console.log('commit', commit)
    commits.push(commit)
  })
})