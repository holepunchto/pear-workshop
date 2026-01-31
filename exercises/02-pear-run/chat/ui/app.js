/** @typedef {import('pear-interface')} */ /* global Pear */
import ui from 'pear-electron'

Pear.updates((update) => {
    console.log('update available:', update)
    document.getElementById('update').style.display = 'revert'
    const action = document.getElementById('action')
    action.style.display = 'revert'
    action.onclick = () => { Pear.restart({ platform: !update.app }) }
    action.innerText = 'Restart ' + (update.app ? 'App' : 'Pear') + ' [' + update.version.fork + '.' + update.version.length + ']'
  })

document.querySelector('h1').addEventListener('click', (e) => { e.target.innerHTML = '🍐' })

console.log(await ui.dimensions()) // log app dimensions