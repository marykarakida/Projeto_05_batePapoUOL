const nome = {};

perguntarNome();

function perguntarNome() {
    nome.name = prompt("Bem-vindo, usuário(a)! Digite seu nome para poder conversar com outros.");
    conferirNome();
}

function conferirNome() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    const nomeServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nome);
    nomeServidor.then(manterConexao);
    nomeServidor.catch(corrigirNome);
}

function manterConexao() {
    const conectado = setInterval(function() {
        const conexaoServidor = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome);
    },5000)
}

function corrigirNome(erro) {
    if (erro.response.status === 400) {
        alert("Esse nome já está sendo usado!")
        perguntarNome();
    }
}
