const nome = {};
let contatoSelecionado = "Todos";
let visibilidadeSelecionado = "Pública";

document.querySelector(".mensagem-enviada").value = "";
perguntarNome();

function perguntarNome() {
    nome.name = prompt("Bem-vindo, usuário(a)! Digite seu nome para poder conversar com outros.");
    conferirNome();
}

function conferirNome() {
    const nomeServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nome);
    nomeServidor.then(manterConexao);
    nomeServidor.catch(corrigirNome);
}

function manterConexao() {
    const conexao = setInterval(function() {
        const conexaoServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome);
    },5000);
    const chat = setInterval(function() {
        const chatServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
        chatServidor.then(carregarMensagens);
    },3000);
    const contatos = setInterval(function() {
        const contatosServidor = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
        contatosServidor.then(carregarContatos);
    },10000);
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
        } else if (chatLista[i].type === "private_message" && (chatLista[i].to === nome.name || chatLista[i].from === nome.name)) {
            chat.innerHTML += `<li class="mensagem mensagem-reservada"><span class="relogio">${chatLista[i].time}</span> <span class="usuario">${chatLista[i].from}</span> reservadamente para <span class="usuario">${chatLista[i].to}</span>: ${chatLista[i].text}</li>`
        }
    }
    // só scrollar se tiver mensagens novas, dá para guardar o data em outra variável e compara se os dois são diferentes, se for scrolla
    chat.scrollIntoView(false);
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
    mensagemEnviada.then(carregarMensagens);
    mensagemEnviada.catch(sairDaSala);
    document.querySelector(".mensagem-enviada").value = "";
}

function sairDaSala() {
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

//se selecionou contato para enviar mensagem privada, mas ela sair antes de enviar contato, tem que tirar o texto
// ou se enviar o texto dar erro
function enviarMensagemPrivada() {
    if (visibilidadeSelecionado === "Reservadamente" && contatoSelecionado !== "Todos") {
        document.querySelector(".destinatario").innerHTML = `Enviando para ${contatoSelecionado} (reservadamente)`
    } else {
        document.querySelector(".destinatario").innerHTML = ""
    }
}