const WebSocket = require('ws')

const server = new WebSocket.Server({ port: 8080 })

let id = 1
let clients = []

server.on('connection', (client) => {
    client.id = id++
    clients.push(client)
    console.log(`Cliente conectado com id ${client.id}`)

    client.on('message', (message) => {
        clients.forEach((c) => {
            if (c !== client) {
                c.send(message)
            }
        })
    })
})