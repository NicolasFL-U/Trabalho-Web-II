const express = require('express')
const path = require('path')
const WebSocket = require('ws')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))

const server = app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port} se Deus quiser`)
})

const wss = new WebSocket.Server({ server })

let id = 1
let clients = []

wss.on('connection', (client) => {
    client.id = id++
    clients.push(client)
    console.log(`Cliente conectado com id ${client.id}`)

    client.send('Bem-vindo ao Quiz Game cliente nº' + client.id)

    client.on('message', (message) => {
        clients.forEach((c) => {
            if (c !== client) {
                c.send(message)
            }
        })
    })

    client.on('close', () => {
        clients = clients.filter(c => c !== client)
        console.log(`Cliente desconectado com id ${client.id}`)
    })
})
