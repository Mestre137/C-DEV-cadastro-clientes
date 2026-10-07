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

const listaClientes =
    document.getElementById("listaClientes");

const pesquisa =
    document.getElementById("pesquisa");

const totalClientes =
    document.getElementById("totalClientes");

const totalCadastros =
    document.getElementById("totalCadastros");

const botaoSair =
    document.getElementById("botaoSair");


// ==========================================
// LISTA DE CLIENTES
// ==========================================

let clientes = [];


// ==========================================
// PROTEGER PÁGINA
// ==========================================

async function protegerPagina() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        window.location.href = "login/login.html";

        return false;
    }


    return true;
}


// ==========================================
// CARREGAR CLIENTES
// ==========================================

async function carregarClientes() {

    const {
        data,
        error
    } = await supabaseClient
        .from("clientes")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro ao carregar clientes:",
            error
        );

        listaClientes.innerHTML = `
            <p class="vazio">
                Erro ao carregar clientes.
            </p>
        `;

        return;
    }


    clientes = data || [];


    atualizarResumo();

    mostrarClientes(clientes);
}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    totalClientes.textContent =
        clientes.length;

    totalCadastros.textContent =
        clientes.length;
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

        const div =
            document.createElement("div");

        div.classList.add("cliente");


        div.innerHTML = `

            <h3>
                ${escaparHTML(cliente.nome)}
            </h3>

            <p>
                📞 ${escaparHTML(
                    cliente.telefone ||
                    "Não informado"
                )}
            </p>

            <p>
                📧 ${escaparHTML(
                    cliente.email ||
                    "Não informado"
                )}
            </p>

            <p>
                📍 ${escaparHTML(
                    cliente.cidade ||
                    "Não informado"
                )}
            </p>

            ${
                cliente.observacoes
                ?
                `
                <p>
                    📝 ${escaparHTML(
                        cliente.observacoes
                    )}
                </p>
                `
                :
                ""
            }

        `;


        listaClientes.appendChild(div);

    });
}


// ==========================================
// PESQUISA
// ==========================================

pesquisa.addEventListener(
    "input",
    function() {

        const texto =
            pesquisa.value
                .toLowerCase()
                .trim();


        const resultado =
            clientes.filter(function(cliente) {

                return (
                    cliente.nome &&
                    cliente.nome
                        .toLowerCase()
                        .includes(texto)
                );

            });


        mostrarClientes(resultado);

    }
);


// ==========================================
// PROTEÇÃO CONTRA HTML
// ==========================================

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}


// ==========================================
// LOGOUT
// ==========================================

botaoSair.addEventListener(
    "click",
    async function() {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            return;
        }


        window.location.href =
            "login/login.html";

    }
);


// ==========================================
// INICIAR
// ==========================================

protegerPagina().then(function(logado) {

    if (logado) {

        carregarClientes();

    }

});