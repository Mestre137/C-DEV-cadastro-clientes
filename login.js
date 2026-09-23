const SUPABASE_URL = "SUA_URL_REAL_DO_SUPABASE";
const SUPABASE_PUBLISHABLE_KEY = "SUA_CHAVE_PUBLISHABLE_REAL";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("loginForm");
const botaoLogin = document.getElementById("botaoLogin");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const senha = document
        .getElementById("senha")
        .value;

    mensagem.textContent = "";

    botaoLogin.disabled = true;
    botaoLogin.textContent = "Entrando...";

    console.log("Tentando fazer login...");
    console.log("E-mail:", email);

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

    console.log("Resposta do Supabase:", data);
    console.log("Erro do Supabase:", error);

    if (error) {

        mensagem.textContent = error.message;

        botaoLogin.disabled = false;
        botaoLogin.textContent = "Entrar";

        return;
    }

    mensagem.textContent = "Login realizado!";

    console.log("Login realizado com sucesso!");

    setTimeout(function() {
        window.location.href = "index.html";
    }, 500);
});