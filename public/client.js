const client = new WebSocket(`ws://${window.location.host}`)

client.onopen = () => {
    console.log('Conectado ao servidor')
}

client.onmessage = (event) => {
    const messageDiv = document.getElementById('message')
    messageDiv.textContent = event.data
}
