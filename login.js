// ==========================================
// CONFIGURAÇÃO SUPABASE
// ==========================================

const SUPABASE_URL = "https://zyynuqvhwuwgvgwrnxao.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tIaPCpRF3j-GcxSauLrg4g_FLW53qdL";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTOS
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const botaoLogin =
    document.getElementById("botaoLogin");

const mensagem =
    document.getElementById("mensagem");


// ==========================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// ==========================================

async function verificarLogin() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        window.location.href = "index.html";

    }

}


verificarLogin();


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const senha =
            document
                .getElementById("senha")
                .value;


        mensagem.textContent = "";

        botaoLogin.disabled = true;

        botaoLogin.textContent =
            "Entrando...";


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: senha

        });


        if (error) {

            console.error(
                "Erro no login:",
                error
            );


            mensagem.textContent =
                "E-mail ou senha incorretos.";


            botaoLogin.disabled = false;

            botaoLogin.textContent =
                "Entrar";

            return;

        }


        console.log(
            "Login realizado:",
            data.user
        );


        window.location.href =
            "index.html";

    }
);