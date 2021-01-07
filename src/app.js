const fs = require('fs')
const path = require('path')
const { ipcMain } = require('electron')

module.exports = class App {
    encoding = 'utf8';
    tokenPattern = /token={"server"\\:"([^"]+)"}/;
    sourceFile = '.local.properties';
    targetFile = '/db/official.json';
    pathList = {
        win32: {
            src: '%UserProfile%\\AppData\\Roaming\\Luniitheque',
            dest: '%UserProfile%\\.studio',
        },
        darwin: {
            src: '~/Library/Application\ Support/Luniitheque',
            dest: '~/.studio',
        },
        default: {
            src: '~/.local/share/Luniitheque',
            dest: '~/.studio',
        },
    };

    constructor() {
        ipcMain.on('read-file', this.readFile.bind(this));
        ipcMain.on('save-file', this.saveFile.bind(this));
    }

    async readFile(event) {
        let file;

        try {
            file = await this.getFile(this.sourceFile, 'src');

            const content = await fs.promises.readFile(file, this.encoding);
            const match = this.tokenPattern.exec(content);

            if (!match) {
                event.reply('error', 'Token not found');
                return;
            }

            event.reply('token', match[1]);
        } catch (error) {
            event.reply('error', `Erreur à la lecture du fichier : ${file}`);
            event.reply('error', error);
        }
    }

    async saveFile(event, content) {
        let file;

        try {
            file = await this.getFile(this.targetFile, 'dest');
            await fs.promises.writeFile(file, content, this.encoding);

            event.reply('file-saved');
        } catch (error) {
            event.reply('error', `Erreur à l'écriture du fichier : ${file}`);
            event.reply('error', error);
        }
    }

    async getFile(srcFile, srcProperty) {
        let os, sourcePath, sourceFile;

        try {
            os = this.pathList[process.platform] || this.pathList.default;
            sourcePath = os[srcProperty].replace(/%([^%]+)%/g, (_, n) => process.env[n]);
            sourceFile = path.join(sourcePath, srcFile);

            return sourceFile;
        } catch (error) {
            console.error(error);
            throw new Error(`Path not found for '${process.platform}' at : ${sourceFile}`);
        }
    }
}