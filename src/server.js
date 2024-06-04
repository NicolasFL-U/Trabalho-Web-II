const express = require('express');
const http = require('http');
const socket = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const port = process.env.PORT

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static('public'));

// Rota para os jogadores
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Rota para o admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin.html'));
});

const senhaAdmin = process.env.SENHA_ADMIN;

let jogadores = [];
let pontuacoes = {};
let finalizados = 0;
let reiniciar = 0;

// bagaça
io.on('connection', (socket) => {
    console.log('Nova conexão: ', socket.id);

    let isAdmin = false;

    socket.on('admin_login', () => {
        isAdmin = true;
        socket.join('admin');
    });

    if (!isAdmin) {
        socket.on('registrar', (nome) => {
            jogadores.push({ id: socket.id, nome });
            pontuacoes[nome] = 0;
            console.log(`${nome} foi registrado com sucesso`);

            socket.join('jogadores');
        });
    }

    socket.on('comecar_quiz', (senha) => {
        finalizados = 0;

        if (senha === senhaAdmin) {
            let questoes = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questoes.json'), 'utf-8'));
            let questoesEscolhidas = gerarQuestoes(questoes);

            io.to('jogadores').emit('comecar_quiz', questoesEscolhidas);
            console.log('Quiz iniciado');
        }
    });

    socket.on('resposta', (resposta) => {
        if (resposta.correta) {
            pontuacoes[resposta.nome]++;
        }

        io.to('admin').emit('atualizar_pontuacoes', pontuacoes);
    });

    socket.on('fim_quiz', () => {
        finalizados++;
        console.log(finalizados, jogadores.length)

        if (finalizados === jogadores.length) {

            let vencedor = jogadores.reduce((a, b) => pontuacoes[a.nome] > pontuacoes[b.nome] ? a : b);
            io.to('jogadores').emit('fim_quiz', vencedor.nome, pontuacoes);
        }
    });

    socket.on('voto_reiniciar', () => {
        reiniciar++;

        if (reiniciar === jogadores.length) {
            io.to('admin').emit('reiniciar');
            reiniciar = 0;
        }
    });
});

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// ----- Funções ----- //
function gerarQuestoes(data) {
    let questoes = data.questoes;
    let questoesEscolhidas = [];
    let indicesUsados = [];

    while (questoesEscolhidas.length < 5) {
        let random = Math.floor(Math.random() * questoes.length);

        if (!indicesUsados.includes(random)) {
            questoesEscolhidas.push(questoes[random]);
            indicesUsados.push(random);
        }
    }

    return questoesEscolhidas;
}