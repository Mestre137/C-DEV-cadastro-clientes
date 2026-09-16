// ==========================================
// CONEXÃO COM O SUPABASE
// ==========================================

const SUPABASE_URL = "COLE_AQUI_A_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "COLE_AQUI_A_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const clienteForm = document.getElementById("clienteForm");
const listaClientes = document.getElementById("listaClientes");
const pesquisa = document.getElementById("pesquisa");


// Lista que ficará sincronizada com o Supabase
let clientes = [];


// ==========================================
// CARREGAR CLIENTES DO SUPABASE
// ==========================================

async function carregarClientes() {

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Erro ao carregar clientes:", error);

        listaClientes.innerHTML = `
            <p class="vazio">
                Erro ao carregar clientes.
            </p>
        `;

        return;
    }

    clientes = data || [];

    mostrarClientes();
}


// ==========================================
// CADASTRAR CLIENTE
// ==========================================

clienteForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const observacoes = document.getElementById("observacoes").value.trim();


    if (!nome) {

        alert("Digite o nome do cliente.");

        return;
    }


    // Desabilita o botão durante o salvamento
    const botao = clienteForm.querySelector("button");

    botao.disabled = true;
    botao.textContent = "Salvando...";


    // Envia o cliente para o Supabase
    const { data, error } = await supabaseClient
        .from("clientes")
        .insert([
            {
                nome: nome,
                telefone: telefone,
                email: email,
                cidade: cidade,
                observacoes: observacoes
            }
        ])
        .select();


    if (error) {

        console.error("Erro ao salvar cliente:", error);

        alert(
            "Não foi possível salvar o cliente.\n\n" +
            "Erro: " + error.message
        );

        botao.disabled = false;
        botao.textContent = "Cadastrar Cliente";

        return;
    }


    console.log("Cliente salvo:", data);


    // Limpa o formulário
    clienteForm.reset();


    // Atualiza a lista
    await carregarClientes();


    botao.disabled = false;
    botao.textContent = "Cadastrar Cliente";


    alert("Cliente cadastrado com sucesso!");
});


// ==========================================
// MOSTRAR CLIENTES
// ==========================================

function mostrarClientes(lista = clientes) {

    listaClientes.innerHTML = "";


    if (lista.length === 0) {

        listaClientes.innerHTML = `
            <p class="vazio">
                Nenhum cliente cadastrado.
            </p>
        `;

        return;
    }


    lista.forEach(function(cliente) {

        const div = document.createElement("div");

        div.classList.add("cliente");


        div.innerHTML = `

            <h3>${escaparHTML(cliente.nome)}</h3>

            <p>
                📞 ${escaparHTML(cliente.telefone || "Não informado")}
            </p>

            <p>
                📧 ${escaparHTML(cliente.email || "Não informado")}
            </p>

            <p>
                📍 ${escaparHTML(cliente.cidade || "Não informado")}
            </p>

            ${
                cliente.observacoes
                ? `<p>📝 ${escaparHTML(cliente.observacoes)}</p>`
                : ""
            }

        `;


        listaClientes.appendChild(div);

    });
}


// ==========================================
// PESQUISAR CLIENTE
// ==========================================

pesquisa.addEventListener("input", function() {

    const texto = pesquisa.value.toLowerCase().trim();


    const resultado = clientes.filter(function(cliente) {

        return (
            cliente.nome &&
            cliente.nome.toLowerCase().includes(texto)
        );

    });


    mostrarClientes(resultado);

});


// ==========================================
// PROTEÇÃO DO TEXTO EXIBIDO NA PÁGINA
// ==========================================

function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}


// ==========================================
// INICIAR SISTEMA
// ==========================================

carregarClientes();
