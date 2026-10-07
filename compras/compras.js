const SUPABASE_URL = "https://zyynuqvhwuwgvgwrnxao.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_tIaPCpRF3j-GcxSauLrg4g_FLW53qdL";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const compraForm = document.getElementById("compraForm");
const clienteSelect = document.getElementById("cliente");
const produtosContainer = document.getElementById("produtos");
const adicionarProduto = document.getElementById("adicionarProduto");
const totalCompra = document.getElementById("totalCompra");
const valorPago = document.getElementById("valorPago");
const trocoCompra = document.getElementById("trocoCompra");
const listaPendentes = document.getElementById("listaPendentes");
const listaFeitos = document.getElementById("listaFeitos");
const totalPendentes = document.getElementById("totalPendentes");
const totalFeitos = document.getElementById("totalFeitos");
const mensagemCompra = document.getElementById("mensagemCompra");
const botaoSair = document.getElementById("botaoSair");

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

async function protegerPagina() {
    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "../login/login.html";
        return false;
    }

    return true;
}

async function carregarClientes() {
    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .order("nome", { ascending: true });

    if (error) {
        console.error(error);
        clienteSelect.innerHTML =
            '<option value="">Erro ao carregar clientes</option>';
        return;
    }

    clienteSelect.innerHTML =
        '<option value="">Selecione a cliente</option>';

    (data || []).forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome;
        clienteSelect.appendChild(option);
    });
}

function adicionarLinhaProduto() {
    const linha = document.createElement("div");
    linha.className = "produto-linha";

    linha.innerHTML = `
        <div class="campo">
            <label>Produto</label>
            <input type="text" class="produto" placeholder="Ex.: Batom" required>
        </div>

        <div class="campo">
            <label>Marca</label>
            <input type="text" class="marca" placeholder="Ex.: Fabella">
        </div>

        <div class="campo pequeno">
            <label>Qtd.</label>
            <input type="number" class="quantidade" min="1" value="1" required>
        </div>

        <div class="campo">
            <label>Preço</label>
            <input type="number" class="preco" min="0" step="0.01" placeholder="0,00" required>
        </div>

        <button type="button" class="remover-produto" title="Remover produto">×</button>
    `;

    produtosContainer.appendChild(linha);
    atualizarValores();
}

function calcularTotal() {
    let total = 0;

    document.querySelectorAll(".produto-linha").forEach(linha => {
        const quantidade =
            Number(linha.querySelector(".quantidade").value) || 0;

        const preco =
            Number(linha.querySelector(".preco").value) || 0;

        total += quantidade * preco;
    });

    return total;
}

function atualizarValores() {
    const total = calcularTotal();
    const pago = Number(valorPago.value) || 0;
    const troco = Math.max(0, pago - total);

    totalCompra.textContent = dinheiro(total);
    trocoCompra.textContent = dinheiro(troco);
}

function mostrarMensagem(texto, erro = false) {
    mensagemCompra.textContent = texto;
    mensagemCompra.classList.toggle("erro", erro);
}

async function salvarCompra(event) {
    event.preventDefault();
    mostrarMensagem("");

    const clienteId = clienteSelect.value;
    const dataCompra = document.getElementById("dataCompra").value;
    const valorPagoNumero = Number(valorPago.value) || 0;

    if (!clienteId || !dataCompra) {
        mostrarMensagem("Selecione a cliente e a data.", true);
        return;
    }

    const linhas = [...document.querySelectorAll(".produto-linha")];

    const itens = linhas.map(linha => {
        const produto = linha.querySelector(".produto").value.trim();
        const marca = linha.querySelector(".marca").value.trim();
        const quantidade =
            Number(linha.querySelector(".quantidade").value) || 1;
        const preco =
            Number(linha.querySelector(".preco").value) || 0;

        return {
            produto,
            marca,
            quantidade,
            preco_unitario: preco,
            subtotal: quantidade * preco
        };
    });

    const total = itens.reduce(
        (soma, item) => soma + item.subtotal,
        0
    );

    if (!itens.length || itens.some(item => !item.produto || item.preco < 0)) {
        mostrarMensagem("Preencha corretamente os produtos.", true);
        return;
    }

    if (valorPagoNumero < total) {
        mostrarMensagem("O valor pago não pode ser menor que o total.", true);
        return;
    }

    const troco = valorPagoNumero - total;

    const botao = compraForm.querySelector(".botao-principal");
    botao.disabled = true;
    botao.textContent = "Salvando...";

    /*
      A tabela compras precisa ter:
      cliente_id, data_compra, total, valor_pago, troco

      Para o botão "Pedido feito", a tabela compras também precisa
      ter uma coluna status (pendente/feito).
    */
    const { data: compra, error: erroCompra } =
        await supabaseClient
            .from("compras")
            .insert([{
                cliente_id: clienteId,
                data_compra: dataCompra,
                total: total,
                valor_pago: valorPagoNumero,
                troco: troco,
                status: "pendente"
            }])
            .select()
            .single();

    if (erroCompra) {
        console.error(erroCompra);
        mostrarMensagem(
            "Erro ao salvar o pedido: " + erroCompra.message,
            true
        );
        botao.disabled = false;
        botao.innerHTML = "<span>＋</span> Registrar pedido";
        return;
    }

    const itensParaSalvar = itens.map(item => ({
        compra_id: compra.id,
        produto: item.produto,
        marca: item.marca,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal
    }));

    const { error: erroItens } =
        await supabaseClient
            .from("itens_compra")
            .insert(itensParaSalvar);

    if (erroItens) {
        console.error(erroItens);

        await supabaseClient
            .from("compras")
            .delete()
            .eq("id", compra.id);

        mostrarMensagem(
            "Erro ao salvar os produtos: " + erroItens.message,
            true
        );

        botao.disabled = false;
        botao.innerHTML = "<span>＋</span> Registrar pedido";
        return;
    }

    compraForm.reset();
    produtosContainer.innerHTML = "";
    adicionarLinhaProduto();

    document.getElementById("dataCompra").value =
        new Date().toISOString().slice(0, 10);

    atualizarValores();

    botao.disabled = false;
    botao.innerHTML = "<span>＋</span> Registrar pedido";

    mostrarMensagem("Pedido registrado com sucesso!");
    await carregarPedidos();
}

async function buscarPedidos() {
    const { data, error } = await supabaseClient
        .from("compras")
        .select(`
            id,
            cliente_id,
            data_compra,
            total,
            valor_pago,
            troco,
            status,
            clientes (
                nome
            ),
            itens_compra (
                produto,
                marca,
                quantidade,
                preco_unitario,
                subtotal
            )
        `)
        .order("data_compra", { ascending: false })
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return { data: [], error };
    }

    return { data: data || [], error: null };
}

function montarPedido(pedido) {
    const div = document.createElement("article");
    div.className = "pedido";

    const nomeCliente =
        pedido.clientes?.nome || "Cliente não encontrada";

    const itens = pedido.itens_compra || [];

    const produtosHTML = itens.map(item => `
        <div class="item-pedido">
            <div>
                <strong>${escaparHTML(item.produto)}</strong>
                ${item.marca
                    ? `<span>${escaparHTML(item.marca)}</span>`
                    : ""}
            </div>
            <span>
                ${item.quantidade} × ${dinheiro(item.preco_unitario)}
            </span>
        </div>
    `).join("");

    const data = new Date(
        `${pedido.data_compra}T00:00:00`
    ).toLocaleDateString("pt-BR");

    const feito =
        pedido.status === "feito";

    div.innerHTML = `
        <div class="pedido-topo">
            <div>
                <span class="mini-titulo">CLIENTE</span>
                <h3>${escaparHTML(nomeCliente)}</h3>
                <p class="data-pedido">📅 ${data}</p>
            </div>

            <span class="status ${feito ? "feito" : "pendente"}">
                ${feito ? "✓ Pedido feito" : "⏳ Pendente"}
            </span>
        </div>

        <div class="itens-pedido">
            ${produtosHTML}
        </div>

        <div class="resumo-pedido">
            <div>
                <span>Total</span>
                <strong>${dinheiro(pedido.total)}</strong>
            </div>

            <div>
                <span>Pago</span>
                <strong>${dinheiro(pedido.valor_pago)}</strong>
            </div>

            <div>
                <span>Troco</span>
                <strong>${dinheiro(pedido.troco)}</strong>
            </div>
        </div>

        ${
            feito
                ? ""
                : `
                    <button
                        type="button"
                        class="botao-feito"
                        data-id="${pedido.id}"
                    >
                        ✓ Pedido feito
                    </button>
                  `
        }
    `;

    return div;
}

async function carregarPedidos() {
    const { data, error } = await buscarPedidos();

    if (error) {
        listaPendentes.innerHTML =
            '<p class="vazio">Erro ao carregar pedidos.</p>';
        listaFeitos.innerHTML =
            '<p class="vazio">Erro ao carregar pedidos.</p>';
        return;
    }

    const pendentes = data.filter(
        pedido => pedido.status !== "feito"
    );

    const feitos = data.filter(
        pedido => pedido.status === "feito"
    );

    totalPendentes.textContent = pendentes.length;
    totalFeitos.textContent = feitos.length;

    listaPendentes.innerHTML = "";
    listaFeitos.innerHTML = "";

    if (!pendentes.length) {
        listaPendentes.innerHTML =
            '<p class="vazio">Nenhum pedido pendente.</p>';
    } else {
        pendentes.forEach(pedido => {
            listaPendentes.appendChild(
                montarPedido(pedido)
            );
        });
    }

    if (!feitos.length) {
        listaFeitos.innerHTML =
            '<p class="vazio">Nenhum pedido feito ainda.</p>';
    } else {
        feitos.forEach(pedido => {
            listaFeitos.appendChild(
                montarPedido(pedido)
            );
        });
    }

    document.querySelectorAll(".botao-feito").forEach(botao => {
        botao.addEventListener("click", () => marcarComoFeito(botao.dataset.id));
    });
}

async function marcarComoFeito(id) {
    const { error } = await supabaseClient
        .from("compras")
        .update({ status: "feito" })
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Não foi possível marcar o pedido como feito.");
        return;
    }

    await carregarPedidos();
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

produtosContainer.addEventListener("input", atualizarValores);
valorPago.addEventListener("input", atualizarValores);

produtosContainer.addEventListener("click", event => {
    if (!event.target.classList.contains("remover-produto")) {
        return;
    }

    const linhas =
        document.querySelectorAll(".produto-linha");

    if (linhas.length === 1) {
        linhas[0]
            .querySelectorAll("input")
            .forEach(input => input.value = "");

        linhas[0]
            .querySelector(".quantidade")
            .value = 1;
    } else {
        event.target.closest(".produto-linha").remove();
    }

    atualizarValores();
});

adicionarProduto.addEventListener(
    "click",
    adicionarLinhaProduto
);

compraForm.addEventListener(
    "submit",
    salvarCompra
);

botaoSair.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "../login/login.html";
});

protegerPagina().then(async logado => {
    if (!logado) return;

    document.getElementById("dataCompra").value =
        new Date().toISOString().slice(0, 10);

    adicionarLinhaProduto();
    await carregarClientes();
    await carregarPedidos();
    atualizarValores();
});
