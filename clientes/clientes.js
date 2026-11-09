
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
// FILTRO DE STATUS
// ==========================================

const filtroStatus = document.createElement("select");

filtroStatus.id = "filtroStatus";
filtroStatus.classList.add("filtro-status");

filtroStatus.innerHTML = `
    <option value="ativas">Clientes ativas</option>
    <option value="inativas">Clientes inativas</option>
    <option value="todas">Todas as clientes</option>
`;

pesquisa.parentElement.appendChild(filtroStatus);

filtroStatus.addEventListener("change", pesquisarClientes);


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

    const clientesAtivas = clientes.filter(function(cliente) {
        return cliente.ativo !== false;
    });

    totalClientes.textContent = clientesAtivas.length;
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

        const ativa = cliente.ativo !== false;

        div.innerHTML = `

            <h3>${escaparHTML(cliente.nome)}</h3>

            <span class="status-cliente ${ativa ? "status-ativa" : "status-inativa"}">
                ${ativa ? "Cliente ativa" : "Cliente inativa"}
            </span>

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

        // BOTÃO INATIVAR OU REATIVAR

        const botaoStatus = document.createElement("button");

        botaoStatus.type = "button";

        botaoStatus.textContent = ativa
            ? "Inativar cliente"
            : "Reativar cliente";

        botaoStatus.classList.add("botao-status");

        botaoStatus.classList.add(
            ativa ? "botao-inativar" : "botao-reativar"
        );

        botaoStatus.addEventListener("click", function() {

            alterarStatusCliente(
                cliente.id,
                cliente.nome,
                !ativa,
                botaoStatus
            );

        });

        div.appendChild(botaoStatus);

        listaClientes.appendChild(div);

    });
}


// ==========================================
// INATIVAR OU REATIVAR CLIENTE
// ==========================================

async function alterarStatusCliente(id, nome, novoStatus, botao) {

    if (!id) {

        alert("Não foi possível identificar esta cliente.");

        return;
    }

    const acao = novoStatus ? "reativar" : "inativar";

    const confirmar = confirm(
        `Deseja realmente ${acao} a cliente ${nome}?`
    );

    if (!confirmar) {
        return;
    }

    botao.disabled = true;
    botao.textContent = "Atualizando...";

    const { data, error } = await supabaseClient
        .from("clientes")
        .update({ ativo: novoStatus })
        .eq("id", id)
        .select("id, ativo")
        .maybeSingle();

    if (error || !data) {

        console.error("Erro ao atualizar cliente:", error);

        botao.disabled = false;

        botao.textContent = novoStatus
            ? "Reativar cliente"
            : "Inativar cliente";

        alert(
            "Não foi possível atualizar o status da cliente.\n\n" +
            "Verifique sua conexão e as permissões do Supabase."
        );

        return;
    }

    // ATUALIZAR A LISTA LOCAL

    clientes = clientes.map(function(cliente) {

        if (cliente.id === id) {
            return {
                ...cliente,
                ativo: novoStatus
            };
        }

        return cliente;

    });

    atualizarResumo();
    pesquisarClientes();

    alert(
        novoStatus
            ? "Cliente reativada com sucesso!"
            : "Cliente inativada com sucesso!"
    );
}


// ==========================================
// PESQUISA E FILTROS
// ==========================================

function pesquisarClientes() {

    const texto = pesquisa.value.toLowerCase().trim();
    const statusSelecionado = filtroStatus.value;

    const resultado = clientes.filter(function(cliente) {

        const nomeCorresponde =
            cliente.nome &&
            cliente.nome.toLowerCase().includes(texto);

        const ativa = cliente.ativo !== false;

        const statusCorresponde =
            statusSelecionado === "todas" ||
            (statusSelecionado === "ativas" && ativa) ||
            (statusSelecionado === "inativas" && !ativa);

        return nomeCorresponde && statusCorresponde;

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
