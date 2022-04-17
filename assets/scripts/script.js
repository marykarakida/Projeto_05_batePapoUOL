const nome = {};
const nomeEnviado = document.querySelector(".nome-enviado");
const mensagemEnviada = document.querySelector(".mensagem-enviada");
let tempoUltimaMensagemRenderizada;
let contatoSelecionado = "Todos";
let visibilidadeSelecionado = "Pública";

nomeEnviado.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.querySelector(".tela-entrada .enviar").click();
  }
});
mensagemEnviada.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.querySelector(".barra-inferior .enviar").click();
    }
});

function perguntarNome() {
    nome.name = document.querySelector(".nome-enviado").value;
    conferirNome();
}
function conferirNome() {
    const nomeServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nome);
    nomeServidor.then(entrarBatePapo);
    nomeServidor.catch(corrigirNome);
    document.querySelector(".campo--input").classList.add("escondido");
    document.querySelector(".campo--spinner").classList.remove("escondido");
}
function corrigirNome(erro) {
    if (erro.response.status === 400) {
        alert("Esse nome já está sendo usado!")
    }
}

function entrarBatePapo() {
    document.querySelector(".tela-entrada").classList.add("escondido");

    const postStatus = () => {const conexaoServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome)};
    const conexao = setInterval(postStatus,5000);

    const getMessages = () => {
        const chatServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
        chatServidor.then(carregarMensagens);
    }
    getMessages();
    const chat = setInterval(getMessages,3000);

    const getParticipantes = () => {
        const contatosServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
        contatosServidor.then(carregarContatos);
    }
    getParticipantes();
    const contatos = setInterval(getParticipantes,10000);
}

function carregarMensagens(chatServidor) {
    const chatLista = chatServidor.data;
    let tempoUltimaMensagemServidor;
    const chat = document.querySelector(".chat");
    chat.innerHTML = ""
    for (var i = 0; i < chatLista.length; i++) {
        if (chatLista[i].type === "status") {
            chat.innerHTML += `<li class="mensagem mensagem-de-status"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> ${chatLista[i].text}</li>`
        } else if (chatLista[i].type === "message") {
            chat.innerHTML += `<li class="mensagem mensagem-normal"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> para <span class="usuario">${chatLista[i].to}</span>: ${chatLista[i].text}</li>`
        } else if (chatLista[i].type === "private_message" && (chatLista[i].to === nome.name || chatLista[i].from === nome.name)) {
            chat.innerHTML += `<li class="mensagem mensagem-reservada"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> reservadamente para <span class="usuario">${chatLista[i].to}</span>: ${chatLista[i].text}</li>`
        }
        if (i === chatLista.length - 1) {
            tempoUltimaMensagemServidor = chatLista[i].time;
        }
    }
    if (tempoUltimaMensagemRenderizada !== tempoUltimaMensagemServidor) {
        document.querySelector(".chat").scrollIntoView(false);
    }
    tempoUltimaMensagemRenderizada = tempoUltimaMensagemServidor;
}

function carregarContatos(contatosServidor) {
    const contatos = document.querySelector(".contatos-nomes");
    const contatosLista = contatosServidor.data;
    contatos.innerHTML = `<li class="clicado" onclick="selecionarContato(this)"><ion-icon class="todos" name="people"></ion-icon><span>Todos</span><ion-icon class="check" name="checkmark"></ion-icon></li>`;
    let usuarioDesconectado = true;
    for (var i = 0; i < contatosLista.length; i++) {
        if (contatoSelecionado === contatosLista[i].name) {
            contatos.innerHTML = `<li onclick="selecionarContato(this)"><ion-icon class="todos" name="people"></ion-icon><span>Todos</span><ion-icon class="check" name="checkmark"></ion-icon></li>`;
            usuarioDesconectado = false;
        }
        if (i === contatosLista.length - 1 && usuarioDesconectado) {
            contatoSelecionado = "Todos";
        }    
    }
    for (var i = 0; i < contatosLista.length; i++) {
        if (contatoSelecionado === contatosLista[i].name) {
            contatos.innerHTML += `<li class="clicado" onclick="selecionarContato(this)"><ion-icon class="contato" name="person-circle"></ion-icon><span>${contatoSelecionado}</span><ion-icon class="check" name="checkmark"></ion-icon></li>`;
        } else {
            contatos.innerHTML += `<li onclick="selecionarContato(this)"><ion-icon class="contato" name="person-circle"></ion-icon><span>${contatosLista[i].name}</span><ion-icon class="check" name="checkmark"></ion-icon></li>`;
        }
    }
}

function enviarMensagem() {
    const mensagem = document.querySelector(".mensagem-enviada").value;
    if (mensagem === "" || (contatoSelecionado === "Todos" && visibilidadeSelecionado === "Reservadamente")) {
        document.querySelector(".mensagem-enviada").value = "";
        return;
    }
    let tipo = "";
    switch(visibilidadeSelecionado) {
        case "Pública":
            tipo = "message";
            break;
        case "Reservadamente":
            tipo = "private_message"
    }
    const mensagemNormal = {
        from: nome.name,
	    to: contatoSelecionado,
	    text: mensagem,
	    type: tipo
    }
    const mensagemEnviada = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagemNormal);
    const chatServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    chatServidor.then(carregarMensagens);
    chatServidor.catch(sairDaSala);
    document.querySelector(".mensagem-enviada").value = "";
}

function sairDaSala() {
    // rever se funciona mesmo
    document.querySelector(".nome-enviado").value = "";
    document.querySelector(".mensagem-enviada").value = "";
    window.location.reload()
}

function mostrarContatos() {
    document.querySelector(".contatos-overlay").classList.toggle("clicado");
    document.querySelector(".contatos-lista").classList.toggle("clicado");
}

function selecionarContato(elemento) {
    const elementoSelecionado = document.querySelector(".contatos-nomes .clicado");
    if (elementoSelecionado !== null) {
        elementoSelecionado.classList.remove("clicado")
    }
    elemento.classList.add("clicado");
    contatoSelecionado = elemento.querySelector("span").innerHTML;
    mudarVisibilidadeContatos (contatoSelecionado)
}

function mudarVisibilidadeContatos(contatoSelecionado) {
    if(contatoSelecionado === "Todos") {
        const visibilidade = document.querySelector(".publico");
        selecionarVisibilidade(visibilidade);
    } else if (contatoSelecionado === nome.name) {
        const visibilidade = document.querySelector(".reservado");
        selecionarVisibilidade(visibilidade);
    }
    enviarMensagemPrivada();
}

function selecionarVisibilidade(elemento) {
    const elementoSelecionado = document.querySelector(".visibilidade .clicado");
    if (elementoSelecionado !== null) {
        elementoSelecionado.classList.remove("clicado")
    }
    elemento.classList.add("clicado");
    visibilidadeSelecionado = elemento.querySelector("span").innerHTML;
    enviarMensagemPrivada();
}

function enviarMensagemPrivada() {
    if (visibilidadeSelecionado === "Reservadamente" && contatoSelecionado !== "Todos") {
        document.querySelector(".destinatario").innerHTML = `Enviando para ${contatoSelecionado} (reservadamente)`
    } else {
        document.querySelector(".destinatario").innerHTML = ""
    }
}