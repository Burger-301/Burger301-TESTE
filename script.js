/* =========================================
   BURGER 301 - SISTEMA DE PEDIDOS COM FIREBASE
========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBJlQENhh8DbqYLyTl4zwvyqLGRAIMz87Y",
    authDomain: "burger301-79148.firebaseapp.com",
    projectId: "burger301-79148",
    storageBucket: "burger301-79148.firebasestorage.app",
    messagingSenderId: "681050351563",
    appId: "1:681050351563:web:7712d7ef3911365a2f784e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrinho = [];
let produtoAtual = null;
let quantidadeAtual = 1;
let statusLojaAdmin = true; 

// Ouve o status da loja em tempo real
onSnapshot(doc(db, "configuracoes", "loja"), (docSnap) => {
    if (docSnap.exists()) {
        statusLojaAdmin = docSnap.data().aberto;
        atualizarStatusHeader();
    }
});

// Ouve os produtos em tempo real e insere os padrão se estiver vazio
onSnapshot(collection(db, "produtos"), async (snapshot) => {
    const hamburgueresContainer = document.getElementById("lista-hamburgueres");
    const porcoesContainer = document.getElementById("lista-porcoes");

    if (!hamburgueresContainer || !porcoesContainer) return;

    // IMPORTAÇÃO AUTOMÁTICA SE A BASE DE DADOS ESTIVER VAZIA
    if (snapshot.empty) {
        const produtosIniciais = [
            {
                nome: "Poema Kids",
                categoria: "hamburgueres",
                preco: 25.00,
                descricao: "Pão brioche selado na manteiga, smash bovinos de 75g, queijo mussarela e maionese da casa, acompanha porção de fritas.\n        “É a vez dos pequenos.”",
                imagem: "imagens/poema-kids.jpg",
                esgotado: false
            },
            {
                nome: "Smash 301",
                categoria: "hamburgueres",
                preco: 29.00,
                descricao: "Pão brioche selado na manteiga, dois smash bovinos de 75g cada, queijo mussarela e maionese da casa.\n        “Para aquela fominha.”",
                imagem: "imagens/smash-301.jpg",
                esgotado: false
            },
            {
                nome: "Clássico da Casa",
                categoria: "hamburgueres",
                preco: 32.00,
                descricao: "Pão brioche selado na manteiga, blend bovino de 150g, queijo mussarela, alface, tomate e maionese da casa.\n        “Clássico que não sai de moda.”",
                imagem: "imagens/classico-da-casa.jpg",
                esgotado: false
            },
            {
                nome: "Du'Chef",
                categoria: "hamburgueres",
                preco: 35.00,
                descricao: "Pão brioche selado na manteiga, blend bovino de 150g, queijo cheddar, cebola caramelizada, bacon e maionese da casa.\n        “O favorito.”",
                imagem: "imagens/duchef.jpg",
                esgotado: false
            },
            {
                nome: "Poema Tropical",
                categoria: "hamburgueres",
                preco: 37.00,
                descricao: "Pão brioche selado na manteiga, blend bovino de 150g, queijo cheddar, bacon, rodela de abacaxi grelhado e maionese da casa.\n        “Uma experiência gastronômica.”",
                imagem: "imagens/poema-tropical.jpg",
                esgotado: false
            },
            {
                nome: "Porção de Fritas",
                categoria: "porcoes",
                preco: 10.00,
                descricao: "Porção de batata frita (na air fryer) e um potinho de maionese da casa.\n        “O que estava faltando.”",
                imagem: "imagens/fritas.jpg",
                esgotado: false
            },
            {
                nome: "Porção de Onion Rings",
                categoria: "porcoes",
                preco: 10.00,
                descricao: "Porção de anéis de cebola fritos (na air fryer) e um potinho de maionese da casa.\n        “Vai ficar de fora?”",
                imagem: "imagens/onion-rings.jpg",
                esgotado: false
            },
            {
                nome: "Fritas Feliz",
                categoria: "porcoes",
                preco: 10.00,
                descricao: "Porção de batata frita carinha (na air fryer) e um potinho de maionese da casa.\n        “Os pequenos adoram.”",
                imagem: "imagens/fritas-feliz.jpg",
                esgotado: false
            }
        ];

        for (const prod of produtosIniciais) {
            await addDoc(collection(db, "produtos"), prod);
        }
        return; // O snapshot atualiza sozinho logo após inserir
    }

    hamburgueresContainer.innerHTML = "";
    porcoesContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const p = docSnap.data();
        
        const artigo = document.createElement("article");
        artigo.className = "produto";
        if (p.esgotado) {
            artigo.style.filter = "grayscale(100%) opacity(0.5)";
        }

        artigo.innerHTML = `
            <div class="produto-imagem" style="position: relative;">
                <img src="${p.imagem}" alt="${p.nome}">
                ${p.esgotado ? '<span class="selo-esgotado" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.85); color: #fff; padding: 6px 14px; border-radius: 5px; font-weight: bold; font-size: 14px; z-index: 2;">ESGOTADO</span>' : ''}
            </div>
            <div class="produto-informacoes">
                <h3>${p.nome}</h3>
                <p class="descricao">${p.descricao.replace(/\n/g, '<br>')}</p>
                <p class="preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
                <button type="button" class="botao-adicionar" data-produto="${p.nome}" data-preco="${p.preco}" ${p.esgotado ? 'disabled style="background-color: #555555; cursor: not-allowed;"' : ''}>
                    ${p.esgotado ? 'ESGOTADO' : 'Adicionar'}
                </button>
            </div>
        `;

        if (p.categoria === "hamburgueres") {
            hamburgueresContainer.appendChild(artigo);
        } else {
            porcoesContainer.appendChild(artigo);
        }
    });

    reativarEventosBotoes();
});

function pedidosEstaoAbertos() {
    return statusLojaAdmin;
}

function mostrarAvisoForaDoExpediente() {
    mostrarMensagem("🍔 A loja está fechada no momento pelo painel administrativo. Burger 301 agradece a compreensão! ❤️");
}

function atualizarStatusHeader() {
    const statusLoja = document.querySelector(".status-loja");
    if (!statusLoja) return;
    const textoStatus = statusLoja.querySelector("span:last-child");

    if (pedidosEstaoAbertos()) {
        statusLoja.classList.remove("status-fechado");
        statusLoja.classList.add("status-aberto");
        if (textoStatus) textoStatus.textContent = "Aberto";
    } else {
        statusLoja.classList.remove("status-aberto");
        statusLoja.classList.add("status-fechado");
        if (textoStatus) textoStatus.textContent = "Fechado";
    }
}

// Elementos do DOM e Carrinho
const modal = document.getElementById("modal-produto");
const observacaoProduto = document.getElementById("observacao-produto");
const fecharModal = document.getElementById("fechar-modal");
const modalNomeProduto = document.getElementById("modal-nome-produto");
const modalDescricaoProduto = document.getElementById("modal-descricao-produto");
const modalPrecoProduto = document.getElementById("modal-preco-produto");
const modalTotal = document.getElementById("modal-total");
const quantidadeProduto = document.getElementById("quantidade-produto");
const diminuirQuantidade = document.getElementById("diminuir-quantidade");
const aumentarQuantidade = document.getElementById("aumentar-quantidade");
const adicionarCarrinhoModal = document.getElementById("adicionar-carrinho-modal");

const itensCarrinho = document.getElementById("itens-carrinho");
const quantidadeCarrinho = document.getElementById("quantidade-carrinho");
const valorTotal = document.getElementById("valor-total");
const finalizarPedido = document.getElementById("finalizar-pedido");
const continuarComprando = document.getElementById("continuar-comprando");
const carrinhoFlutuante = document.getElementById("carrinho-flutuante");
const abrirCarrinho = document.getElementById("abrir-carrinho");
const resumoCarrinho = document.getElementById("resumo-carrinho");
const formularioPedido = document.getElementById("formulario-pedido");
const painelCarrinho = document.getElementById("carrinho");
const dadosPedido = document.getElementById("dados-pedido");
const botaoVoltarDados = document.getElementById("voltar-cardapio-dados");

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mostrarMensagem(texto) {
    const mensagemAntiga = document.querySelector(".mensagem-sucesso");
    if (mensagemAntiga) mensagemAntiga.remove();
    const div = document.createElement("div");
    div.className = "mensagem-sucesso";
    div.textContent = texto;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function reativarEventosBotoes() {
    document.querySelectorAll(".botao-adicionar").forEach(function (botao) {
        botao.replaceWith(botao.cloneNode(true));
    });

    document.querySelectorAll(".botao-adicionar").forEach(function (botao) {
        botao.addEventListener("click", function () {
            if (!pedidosEstaoAbertos()) {
                mostrarAvisoForaDoExpediente();
                return;
            }

            const nome = botao.dataset.produto;
            const preco = parseFloat(botao.dataset.preco);
            const cardProduto = botao.closest(".produto");
            let descricaoCapturada = cardProduto ? cardProduto.querySelector(".descricao").innerText.trim() : "";

            produtoAtual = { nome, preco };
            quantidadeAtual = 1;
            observacaoProduto.value = "";

            modalNomeProduto.textContent = nome;
            modalDescricaoProduto.innerText = descricaoCapturada;
            modalPrecoProduto.textContent = formatarMoeda(preco);
            quantidadeProduto.textContent = quantidadeAtual;

            document.querySelectorAll('#modal-produto input[name="adicional"]').forEach(checkbox => checkbox.checked = false);
            ajustarAdicionaisPorPorcao(nome);
            atualizarTotalModal();

            modal.classList.add("ativo");
            modal.setAttribute("aria-hidden", "false");
        });
    });
}

fecharModal.addEventListener("click", fecharModalProduto);
function fecharModalProduto() {
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
    produtoAtual = null;
}

modal.addEventListener("click", function (e) {
    if (e.target === modal) fecharModalProduto();
});

aumentarQuantidade.addEventListener("click", () => {
    quantidadeAtual++;
    quantidadeProduto.textContent = quantidadeAtual;
    atualizarTotalModal();
});

diminuirQuantidade.addEventListener("click", () => {
    if (quantidadeAtual > 1) {
        quantidadeAtual--;
        quantidadeProduto.textContent = quantidadeAtual;
        atualizarTotalModal();
    }
});

function obterAdicionaisSelecionados() {
    const adicionais = [];
    document.querySelectorAll('#modal-produto input[name="adicional"]:checked').forEach(c => {
        adicionais.push({ nome: c.value, preco: parseFloat(c.dataset.preco) });
    });
    return adicionais;
}

function calcularTotalProduto() {
    if (!produtoAtual) return 0;
    let adicionaisTotal = 0;
    obterAdicionaisSelecionados().forEach(a => adicionaisTotal += a.preco);
    return (produtoAtual.preco + adicionaisTotal) * quantidadeAtual;
}

function atualizarTotalModal() {
    modalTotal.textContent = formatarMoeda(calcularTotalProduto());
}

document.querySelectorAll('#modal-produto input[name="adicional"]').forEach(c => {
    c.addEventListener("change", atualizarTotalModal);
});

function ajustarAdicionaisPorPorcao(nomeProduto) {
    const nomesPorcoes = new Set(["Porção de Fritas", "Porção de Onion Rings", "Fritas Feliz"]);
    const ehPorcao = nomesPorcoes.has(nomeProduto);
    document.querySelectorAll('#modal-produto .adicional').forEach(adicional => {
        const input = adicional.querySelector('input[type="checkbox"]');
        if (!input) return;
        const somentePorcao = input.dataset.apenasPorcao === "true";
        if (ehPorcao) {
            adicional.style.display = somentePorcao ? "" : "none";
            input.disabled = !somentePorcao;
            if (!somentePorcao) input.checked = false;
        } else {
            adicional.style.display = "";
            input.disabled = false;
        }
    });
}

adicionarCarrinhoModal.addEventListener("click", () => {
    if (!produtoAtual) return;
    const adicionais = obterAdicionaisSelecionados();
    const observacao = observacaoProduto.value.trim();
    let adicionaisTotal = 0;
    adicionais.forEach(a => adicionaisTotal += a.preco);

    carrinho.push({
        id: Date.now(),
        nome: produtoAtual.nome,
        precoBase: produtoAtual.preco,
        quantidade: quantidadeAtual,
        adicionais,
        observacao,
        valorUnitario: produtoAtual.preco + adicionaisTotal
    });

    atualizarCarrinho();
    fecharModalProduto();
    mostrarMensagem(`${quantidadeAtual}x ${produtoAtual.nome} adicionado ao pedido!`);
});

function atualizarCarrinho() {
    itensCarrinho.innerHTML = "";
    if (carrinho.length === 0) {
        itensCarrinho.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
        quantidadeCarrinho.textContent = "0 itens";
        valorTotal.textContent = formatarMoeda(0);
        resumoCarrinho.textContent = "0 itens • R$ 0,00";
        finalizarPedido.disabled = true;
        carrinhoFlutuante.classList.remove("visivel");
        return;
    }

    let total = 0, quantidadeItens = 0;
    carrinho.forEach(item => {
        const subtotal = item.valorUnitario * item.quantidade;
        total += subtotal;
        quantidadeItens += item.quantidade;

        const div = document.createElement("div");
        div.className = "item-carrinho";
        div.innerHTML = `
            <div class="item-carrinho-info">
                <h3>${item.nome}</h3>
                <p class="controle-quantidade">
                    <span>Qtd:</span>
                    <button type="button" class="botao-diminuir" data-id="${item.id}">−</button>
                    <strong>${item.quantidade}</strong>
                    <button type="button" class="botao-aumentar" data-id="${item.id}">+</button>
                </p>
                ${item.adicionais.map(a => `<span>+ ${a.nome} —${formatarMoeda(a.preco)}</span>`).join("")}
                ${item.observacao ? `<div>📝 ${item.observacao}</div>` : ""}
            </div>
            <div class="item-carrinho-acoes">
                <strong>${formatarMoeda(subtotal)}</strong>
                <button type="button" class="botao-remover" data-id="${item.id}">Remover</button>
            </div>
        `;
        itensCarrinho.appendChild(div);
    });

    quantidadeCarrinho.textContent = `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`;
    valorTotal.textContent = formatarMoeda(total);
    resumoCarrinho.textContent = `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"} • ${formatarMoeda(total)}`;
    finalizarPedido.disabled = false;
    if (!dadosPedido.classList.contains("visivel")) carrinhoFlutuante.classList.add("visivel");

    configurarBotoesCarrinho();
}

function configurarBotoesCarrinho() {
    document.querySelectorAll(".botao-remover").forEach(b => b.onclick = () => {
        carrinho = carrinho.filter(i => i.id !== Number(b.dataset.id));
        atualizarCarrinho();
    });
    document.querySelectorAll(".botao-aumentar").forEach(b => b.onclick = () => {
        const item = carrinho.find(i => i.id === Number(b.dataset.id));
        if (item) { item.quantidade++; atualizarCarrinho(); }
    });
    document.querySelectorAll(".botao-diminuir").forEach(b => b.onclick = () => {
        const item = carrinho.find(i => i.id === Number(b.dataset.id));
        if (item) {
            item.quantidade--;
            if (item.quantidade <= 0) carrinho = carrinho.filter(i => i.id !== Number(b.dataset.id));
            atualizarCarrinho();
        }
    });
}

abrirCarrinho.onclick = () => painelCarrinho.classList.add("aberto");
continuarComprando.onclick = () => painelCarrinho.classList.remove("aberto");

finalizarPedido.onclick = () => {
    if (carrinho.length === 0 || !pedidosEstaoAbertos()) return;
    painelCarrinho.classList.remove("aberto");
    carrinhoFlutuante.classList.remove("visivel");
    dadosPedido.classList.add("visivel");
    setTimeout(() => dadosPedido.scrollIntoView({ behavior: "smooth" }), 100);
};

if (botaoVoltarDados) {
    botaoVoltarDados.onclick = () => {
        dadosPedido.classList.remove("visivel");
        if (carrinho.length > 0) carrinhoFlutuante.classList.add("visivel");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
}

document.querySelectorAll('input[name="pagamento"]').forEach(r => {
    r.onchange = () => {
        document.getElementById("campo-troco").style.display = (r.value === "Dinheiro" && r.checked) ? "block" : "none";
    };
});

formularioPedido.onsubmit = (e) => {
    e.preventDefault();
    if (!pedidosEstaoAbertos()) return;

    const nome = document.getElementById("nome").value.trim();
    const torre = document.getElementById("torre").value.trim();
    const apartamento = document.getElementById("apartamento").value.trim();
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value;
    const troco = document.getElementById("troco").value.trim();
    const obs = document.getElementById("observacao").value.trim();

    if (!nome || !torre || !apartamento || !pagamento) {
        mostrarMensagem("Preencha todos os campos obrigatórios (*).");
        return;
    }

    let msg = `🍔 *NOVO PEDIDO - BURGER 301*\n\n👤 *Cliente:* ${nome}\n🏢 *Endereço:* Torre ${torre}, Apto ${apartamento}\n💳 *Pagamento:* ${pagamento}\n`;
    if (pagamento === "Dinheiro" && troco) msg += `💵 *Troco para:* ${troco}\n`;
    if (obs) msg += `📝 *Obs:* ${obs}\n`;
    msg += `\n🛒 *ITENS:*\n`;

    let total = 0;
    carrinho.forEach((item, i) => {
        const sub = item.valorUnitario * item.quantidade;
        total += sub;
        msg += `\n${i + 1}. ${item.quantidade}x ${item.nome} — ${formatarMoeda(sub)}\n`;
        item.adicionais.forEach(a => msg += `   + ${a.nome}\n`);
        if (item.observacao) msg += `   _Obs: ${item.observacao}_\n`;
    });

    msg += `\n💰 *TOTAL: ${formatarMoeda(total)}*\n📍 *Entrega na entrada da torre.*`;
    window.open(`https://wa.me/5551981061618?text=${encodeURIComponent(msg)}`, "_blank");
};
