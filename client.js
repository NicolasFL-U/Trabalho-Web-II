const WebSocket = require('ws')

const client = new WebSocket('ws://localhost:8080')

client.on('open', () => {
    console.log('Conectado no servidor')
})