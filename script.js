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
// LOGOUT
// ==========================================

const botaoSair =
    document.getElementById("botaoSair");


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
// PROTEGER PÁGINA
// ==========================================

async function protegerPagina() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        window.location.href =
            "login/login.html";

        return false;
    }


    return true;
}


// ==========================================
// ELEMENTOS
// ==========================================

const clienteForm =
    document.getElementById("clienteForm");

const totalClientes =
    document.getElementById("totalClientes");

const totalCadastros =
    document.getElementById("totalCadastros");


// ==========================================
// CARREGAR TOTAL DE CLIENTES
// ==========================================

async function carregarTotalClientes() {

    const {
        count,
        error
    } = await supabaseClient
        .from("clientes")
        .select("*", {
            count: "exact",
            head: true
        });


    if (error) {

        console.error(
            "Erro ao contar clientes:",
            error
        );

        return;
    }


    totalClientes.textContent =
        count || 0;

    totalCadastros.textContent =
        count || 0;
}


// ==========================================
// CADASTRAR CLIENTE
// ==========================================

clienteForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const telefone =
            document
                .getElementById("telefone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const cidade =
            document
                .getElementById("cidade")
                .value
                .trim();


        const observacoes =
            document
                .getElementById("observacoes")
                .value
                .trim();


        if (!nome) {

            alert(
                "Digite o nome da cliente."
            );

            return;
        }


        const botao =
            clienteForm.querySelector(
                "button"
            );


        botao.disabled = true;

        botao.textContent =
            "Salvando...";


        const {
            data,
            error
        } = await supabaseClient
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

            console.error(
                "Erro ao salvar cliente:",
                error
            );


            alert(
                "Não foi possível salvar a cliente.\n\n" +
                "Erro: " +
                error.message
            );


            botao.disabled = false;

            botao.innerHTML =
                "<span>＋</span> Cadastrar cliente";

            return;
        }


        console.log(
            "Cliente salvo:",
            data
        );


        clienteForm.reset();


        await carregarTotalClientes();


        botao.disabled = false;

        botao.innerHTML =
            "<span>＋</span> Cadastrar cliente";


        alert(
            "Cliente cadastrada com sucesso!"
        );

    }
);


// ==========================================
// INICIAR SISTEMA
// ==========================================

protegerPagina().then(
    function(logado) {

        if (logado) {

            carregarTotalClientes();

        }

    }
);