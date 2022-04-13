const nome = {};

perguntarNome();

function perguntarNome() {
    nome.name = prompt("Bem-vindo, usuário(a)! Digite seu nome para poder conversar com outros.");
    conferirNome();
}

function conferirNome() {
    const nomeServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nome);
    nomeServidor.then(manterConexao);
    //no bonus, aki funcao para atualizar lista de contatos
    nomeServidor.catch(corrigirNome);
}

// como mandar mensagem de saida
function manterConexao() {
    const mensagemStatus = {
        from: nome.name,
		to: "Todos",
		text: "entra na sala...",
		type: "status",
		time: Date.now()
    }
    const entrada = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagemStatus);

    const conexao = setInterval(function() {
        const conexaoServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome);
    },5000);
    const chat = setInterval(function() {
        const chatServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
        chatServidor.then(carregarMensagens);
    },3000);
}

function corrigirNome(erro) {
    if (erro.response.status === 400) {
        alert("Esse nome já está sendo usado!")
        perguntarNome();
    }
}

function carregarMensagens(chatServidor) {
    const chat = document.querySelector(".chat");
    chat.innerHTML = ""
    const chatLista = chatServidor.data;
    for (var i = 0; i < chatLista.length; i++) {
        if (chatLista[i].type === "status") {
            chat.innerHTML += `<li class="mensagem mensagem-de-status"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> ${chatLista[i].text}</li>`
        } else if (chatLista[i].type === "message") {
            chat.innerHTML += `<li class="mensagem mensagem-normal"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> para <span class="usuario">${chatLista[i].to}</span>: ${chatLista[i].text}</li>`
        } else if (chatLista[i].type === "private_message" && chatLista[i].to === nome.name) {
            chat.innerHTML += `<li class="mensagem mensagem-reservada"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> reservadamente para <span class="usuario">${chatLista[i].to}</span>: ${chatLista[i].text}</li>`
        }
    }
    chat.scrollIntoView(false);
}

function enviarMensagem() {
    const mensagem = document.querySelector(".mensagem-enviada").value;
    if (mensagem === "") {
        return;
    }
    const mensagemNormal = {
        from: nome.name,
	    to: "Todos",
	    text: mensagem,
	    type: "message"
    }
    const mensagemEnviada = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagemNormal);
    mensagemEnviada.then(carregarMensagens);
    mensagemEnviada.catch(sairDaSala);
    document.querySelector(".mensagem-enviada").value = "";
}

function sairDaSala() {
    window.location.reload()
}