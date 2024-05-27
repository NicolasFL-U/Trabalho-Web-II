const socket = io();

let questoes = [];
let indiceAtual = 0;
let pontuacao = 0;

document.getElementById('registrarBtn').addEventListener('click', () => {
    const nome = document.getElementById('nome').value;
    socket.emit('registrar', nome);

    document.getElementById('titulo').innerText = 'Aguardando o início do quiz...';
    document.getElementById('secaoRegistro').style.display = 'none';
});

socket.on('comecar_quiz', (dadosQuestoes) => {
    questoes = dadosQuestoes;
    indiceAtual = 0;
    pontuacao = 0;
    document.getElementById('titulo').innerText = 'Quiz em andamento...';
    document.getElementById('secaoQuiz').style.display = 'block';
    document.getElementById('secaoPontuacao').style.display = 'block';
    atualizarPontuacao();
    exibirQuestao();
});

socket.on('fim_quiz', (vencedor, pontuacoes) => {
    document.getElementById('titulo').innerText = `O vencedor é ${vencedor} com ${pontuacoes[vencedor]} pontos!`;
    document.getElementById('secaoAguardar').style.display = 'none';
    document.getElementById('secaoPontuacao').style.display = 'none';

    // preencher o ranking
    const ranking = document.getElementById('ranking');
    ranking.innerHTML = '';
    document.getElementById('secaoRanking').style.display = 'block';

    const sortedPontuacoes = Object.entries(pontuacoes).sort((a, b) => b[1] - a[1]);
    sortedPontuacoes.forEach((pontuacao, i) => {
        const pontuacaoElement = document.createElement('li');
        pontuacaoElement.classList.add('list-group-item');
        pontuacaoElement.innerText = `${i + 1} - ${pontuacao[0]}: ${pontuacao[1]} pontos`;
        ranking.appendChild(pontuacaoElement);
    });
});

// ----- Funções ----- //
function exibirQuestao() {
    const questao = questoes[indiceAtual];
    document.getElementById('pergunta').innerText = questao.pergunta;
    const opcoesContainer = document.getElementById('opcoes');
    opcoesContainer.innerHTML = '';

    questao.opcoes.forEach(opcao => {
        const opcaoElement = document.createElement('button');
        opcaoElement.classList.add('list-group-item', 'list-group-item-action');
        opcaoElement.innerText = opcao;
        opcaoElement.addEventListener('click', () => {
            verificarResposta(opcao === questao.resposta);
        });
        opcoesContainer.appendChild(opcaoElement);
    });
}

function verificarResposta(correta) {
    const nome = document.getElementById('nome').value;
    socket.emit('resposta', { nome, correta });

    if (correta) {
        pontuacao++;
        atualizarPontuacao();
    }

    indiceAtual++;
    if (indiceAtual < questoes.length) {
        exibirQuestao();
    } else {
        document.getElementById('secaoQuiz').style.display = 'none';
        document.getElementById('secaoAguardar').style.display = 'block';
        socket.emit('fim_quiz');
    }
}

function atualizarPontuacao() {
    document.getElementById('pontuacao').innerText = pontuacao;
}