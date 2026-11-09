
// ==========================================
// CONEXÃO COM O SUPABASE
// ==========================================

const SUPABASE_URL = "https://zyynuqvhwuwgvgwrnxao.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_tIaPCpRF3j-GcxSauLrg4g_FLW53qdL";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const listaClientes = document.getElementById("listaClientes");
const pesquisa = document.getElementById("pesquisa");
const totalClientes = document.getElementById("totalClientes");
const totalCadastros = document.getElementById("totalCadastros");
const botaoSair = document.getElementById("botaoSair");

let clientes = [];


// ==========================================
// PROTEGER PÁGINA
// ==========================================

async function protegerPagina() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
        window.location.href = "../login/login.html";
        return false;
    }

    return true;
}


// ==========================================
// CARREGAR CLIENTES
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
    pesquisarClientes();
}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    totalClientes.textContent = clientes.length;
    totalCadastros.textContent = clientes.length;
}


// ==========================================
// MOSTRAR CLIENTES
// ==========================================

function mostrarClientes(lista) {

    listaClientes.innerHTML = "";

    if (lista.length === 0) {

        listaClientes.innerHTML = `
            <p class="vazio">
                Nenhuma cliente encontrada.
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
                ? `
                    <p>
                        📝 ${escaparHTML(cliente.observacoes)}
                    </p>
                `
                : ""
            }

        `;

        // BOTÃO EXCLUIR

        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.textContent = "🗑️ Excluir cliente";
        botaoExcluir.classList.add("botao-excluir");

        botaoExcluir.addEventListener("click", function() {
            excluirCliente(cliente.id, cliente.nome, botaoExcluir);
        });

        div.appendChild(botaoExcluir);

        listaClientes.appendChild(div);

    });
}


// ==========================================
// EXCLUIR CLIENTE
// ==========================================

async function excluirCliente(id, nome, botao) {

    if (!id) {

        alert("Não foi possível identificar esta cliente. Verifique a coluna id no Supabase.");

        return;
    }

    const confirmar = confirm(
        `Tem certeza de que deseja excluir a cliente ${nome}?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmar) {
        return;
    }

    botao.disabled = true;
    botao.textContent = "Excluindo...";

    const { error } = await supabaseClient
        .from("clientes")
        .delete()
        .eq("id", id);

    if (error) {

        console.error("Erro ao excluir cliente:", error);

        botao.disabled = false;
        botao.textContent = "🗑️ Excluir cliente";

        alert(
            "Não foi possível excluir esta cliente.\n\n" +
            "Verifique as permissões do Supabase e se existem compras vinculadas a ela."
        );

        return;
    }

    // Atualizar a lista local

    clientes = clientes.filter(function(cliente) {
        return cliente.id !== id;
    });

    atualizarResumo();
    pesquisarClientes();

    alert("Cliente excluída com sucesso!");
}


// ==========================================
// PESQUISA
// ==========================================

function pesquisarClientes() {

    const texto = pesquisa.value.toLowerCase().trim();

    const resultado = clientes.filter(function(cliente) {

        return (
            cliente.nome &&
            cliente.nome.toLowerCase().includes(texto)
        );

    });

    mostrarClientes(resultado);
}

pesquisa.addEventListener("input", pesquisarClientes);


// ==========================================
// PROTEÇÃO CONTRA HTML
// ==========================================

function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}


// ==========================================
// LOGOUT
// ==========================================

botaoSair.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {

        console.error("Erro ao sair:", error);

        alert("Não foi possível sair da conta.");

        return;
    }

    window.location.href = "../login/login.html";

});


// ==========================================
// INICIAR
// ==========================================

protegerPagina().then(function(logado) {

    if (logado) {
        carregarClientes();
    }

});
