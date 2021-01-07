const { ipcRenderer } = require('electron')

let logContainer;

init();

function init() {
    logContainer = document.getElementById('logContainer');
    document.getElementById('loadToken').addEventListener('click', loadToken);

    ipcRenderer.on('error', (_, error) => logError(error));
    ipcRenderer.on('token', token);
    ipcRenderer.on('file-saved', fileSaved);

    loadToken();
}

function loadToken() {
    logContainer.innerHTML = '';
    logMessage('Chargement de Luniistore');
    ipcRenderer.send('read-file');
}

function token(_, token) {
    logMessage('Chargement des packs');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://server-data-prod.lunii.com/v2/packs');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.setRequestHeader('X-AUTH-TOKEN', token);
    xhr.onload = function () {
        if (xhr.status != 200) {
            logError(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
            logMessage('Sauvegarde du fichier');
            ipcRenderer.send('save-file', xhr.response);
        }
    };
    xhr.send();
}

function fileSaved() {
    logMessage('Fichier sauvegardé');
}

function logError(error) {
    logMessage(error, '#F00');
}

function logMessage(message, color) {
    const element = document.createElement('p');
    element.innerText = message;

    if (color) {
        element.style.color = color;
    }

    logContainer.append(element);
}