const SUPABASE_URL = "COLE_AQUI_A_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "COLE_AQUI_A_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const clienteForm = document.getElementById("clienteForm");

const listaClientes = document.getElementById("listaClientes");

const pesquisa = document.getElementById("pesquisa");


// Lista temporária de clientes
let clientes = [];


// CADASTRAR CLIENTE

clienteForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;
    const cidade = document.getElementById("cidade").value;
    const observacoes = document.getElementById("observacoes").value;


    const cliente = {

        id: Date.now(),

        nome: nome,

        telefone: telefone,

        email: email,

        cidade: cidade,

        observacoes: observacoes

    };


    clientes.push(cliente);


    clienteForm.reset();


    mostrarClientes();

});


// MOSTRAR CLIENTES

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

            <h3>${cliente.nome}</h3>

            <p>
                📞 ${cliente.telefone || "Não informado"}
            </p>

            <p>
                📧 ${cliente.email || "Não informado"}
            </p>

            <p>
                📍 ${cliente.cidade || "Não informado"}
            </p>

            ${
                cliente.observacoes
                ? `<p>📝 ${cliente.observacoes}</p>`
                : ""
            }

        `;


        listaClientes.appendChild(div);

    });

}


// PESQUISAR CLIENTE

pesquisa.addEventListener("input", function() {

    const texto = pesquisa.value.toLowerCase();


    const resultado = clientes.filter(function(cliente) {

        return cliente.nome
            .toLowerCase()
            .includes(texto);

    });


    mostrarClientes(resultado);

});
