// ==========================================
// CONEXÃO COM O SUPABASE
// ==========================================

const SUPABASE_URL = "https://zyynuqvhwuwgvgwrnxao.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tIaPCpRF3j-GcxSauLrg4g_FLW53qdL";

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


// ==========================================
// LISTA DE CLIENTES
// ==========================================

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

    atualizarResumo();

    mostrarClientes();
}


// ==========================================
// ATUALIZAR NÚMEROS DO TOPO
// ==========================================

function atualizarResumo() {

    const totalClientes = document.getElementById("totalClientes");
    const totalCadastros = document.getElementById("totalCadastros");

    totalClientes.textContent = clientes.length;
    totalCadastros.textContent = clientes.length;
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

        alert("Digite o nome da cliente.");

        return;
    }

    const botao = clienteForm.querySelector("button");

    botao.disabled = true;
    botao.textContent = "Salvando...";


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
            "Não foi possível salvar a cliente.\n\n" +
            "Erro: " + error.message
        );

        botao.disabled = false;
        botao.innerHTML = "<span>＋</span> Cadastrar cliente";

        return;
    }


    console.log("Cliente salvo:", data);

    clienteForm.reset();

    await carregarClientes();

    botao.disabled = false;
    botao.innerHTML = "<span>＋</span> Cadastrar cliente";

    alert("Cliente cadastrado com sucesso!");
});


// ==========================================
// MOSTRAR CLIENTES NA TELA
// ==========================================

function mostrarClientes(lista = clientes) {

    listaClientes.innerHTML = "";


    if (lista.length === 0) {

        listaClientes.innerHTML = `
            <p class="vazio">
                Nenhuma cliente cadastrada.
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
// PESQUISA DE CLIENTES
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
// PROTEÇÃO CONTRA HTML
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