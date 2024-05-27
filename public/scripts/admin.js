const socket = io();

socket.on('connect', () => {
    socket.emit('admin_login');
});

socket.on('atualizar_pontuacoes', (pontuacoes) => {
    const pontuacoesElement = document.getElementById('pontuacoes');
    pontuacoesElement.innerHTML = '';
    pontuacoesElement.style.display = 'block';

    Object.entries(pontuacoes).forEach((pontuacao) => {
        const pontuacaoElement = document.createElement('li');
        pontuacaoElement.classList.add('list-group-item');
        pontuacaoElement.innerText = `${pontuacao[0]}: ${pontuacao[1]} pontos`;
        pontuacoesElement.appendChild(pontuacaoElement);
    });
});

document.getElementById('comecarQuizBtn').addEventListener('click', () => {
    const password = document.getElementById('adminSenha').value;
    socket.emit('comecar_quiz', password);

    document.getElementById('comecarQuizBtn').style.display = 'none';
    document.getElementById('adminSenha').style.display = 'none';
});
