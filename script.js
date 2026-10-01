/* =========================================
   BURGER 301 - SISTEMA DE PEDIDOS COM FIREBASE
========================================= */

// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Configuração do Firebase
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

// Variável que guarda o estado vindo do painel admin em tempo real
let statusLojaAdmin = true; 

// Ouve em tempo real as alterações feitas no painel admin
const docRefConfig = doc(db, "configuracoes", "loja");
onSnapshot(docRefConfig, (docSnap) => {
    if (docSnap.exists()) {
        statusLojaAdmin = docSnap.data().aberto;
        atualizarStatusHeader();
        atualizarEstoqueGeral();
    }
});

/* =========================================
   CONTROLE RÁPIDO DO SITE
========================================= */

const bloqueioHorarioAtivo = false;

const produtosEsgotados = [];
const adicionaisEsgotados = [];

/* =========================================
   FUNÇÃO AUTOMÁTICA DE ATUALIZAÇÃO DE ESTOQUE
========================================= */

function atualizarEstoqueGeral() {
    
    /* --- A. BLOQUEIO / RESTAURAÇÃO DE PRODUTOS --- */
    document.querySelectorAll(".produto").forEach(produto => {
        const botao = produto.querySelector(".botao-adicionar");
        if (!botao) return;

        const nomeProduto = botao.dataset.produto;
        const conteinerImagem = produto.querySelector(".produto-imagem");

        if (produtosEsgotados.includes(nomeProduto)) {
            // Marca como ESGOTADO
            botao.disabled = true;
            botao.textContent = "ESGOTADO";
            botao.style.backgroundColor = "#555555";
            botao.style.cursor = "not-allowed";

            if (conteinerImagem && !conteinerImagem.querySelector(".selo-esgotado")) {
                conteinerImagem.style.position = "relative";
                conteinerImagem.style.filter = "grayscale(100%) opacity(0.5)";

                const selo = document.createElement("span");
                selo.className = "selo-esgotado";
                selo.textContent = "ESGOTADO";
                selo.style.position = "absolute";
                selo.style.top = "50%";
                selo.style.left = "50%";
                selo.style.transform = "translate(-50%, -50%)";
                selo.style.backgroundColor = "rgba(0,0,0,0.85)";
                selo.style.color = "#fff";
                selo.style.padding = "6px 14px";
                selo.style.borderRadius = "5px";
                selo.style.fontWeight = "bold";
                selo.style.fontSize = "14px";
                selo.style.letterSpacing = "1px";
                selo.style.zIndex = "2";

                conteinerImagem.appendChild(selo);
            }
        } else {
            // Restaura para DISPONÍVEL
            botao.disabled = false;
            botao.textContent = "Adicionar";
            botao.style.backgroundColor = "";
            botao.style.cursor = "";

            if (conteinerImagem) {
                conteinerImagem.style.filter = "";
                const selo = conteinerImagem.querySelector(".selo-esgotado");
                if (selo) selo.remove();
            }
        }
    });

    /* --- B. BLOQUEIO / RESTAURAÇÃO DE ADICIONAIS --- */
    document.querySelectorAll('#modal-produto input[name="adicional"]').forEach(checkbox => {
        const nomeAdicional = checkbox.value;
        const labelAdicional = checkbox.closest(".adicional");

        if (adicionaisEsgotados.includes(nomeAdicional)) {
            checkbox.disabled = true;
            checkbox.checked = false;

            if (labelAdicional) {
                labelAdicional.style.opacity = "0.5";
                labelAdicional.style.cursor = "not-allowed";

                const spanNome = labelAdicional.querySelector("span");
                if (spanNome && !spanNome.textContent.includes("(ESGOTADO)")) {
                    spanNome.textContent += " (ESGOTADO)";
                    spanNome.style.textDecoration = "line-through";
                }
            }
        } else {
            checkbox.disabled = false;

            if (labelAdicional) {
                labelAdicional.style.opacity = "";
                labelAdicional.style.cursor = "";

                const spanNome = labelAdicional.querySelector("span");
                if (spanNome && spanNome.textContent.includes(" (ESGOTADO)")) {
                    spanNome.textContent = spanNome.textContent.replace(" (ESGOTADO)", "");
                    spanNome.style.textDecoration = "";
                }
            }
        }
    });
}

/* =========================================
   CONTROLE DE ABERTURA (BASEADO NO PAINEL ADMIN)
========================================= */

function pedidosEstaoAbertos() {
    if (!statusLojaAdmin) {
        return false;
    }
    return true;
}

function mostrarAvisoForaDoExpediente() {
    mostrarMensagem("🍔 A loja está fechada no momento pelo painel administrativo. Burger 301 agradece a compreensão! ❤️");
}

/* =========================================
   ATUALIZAÇÃO AUTOMÁTICA DO STATUS NO CABEÇALHO
========================================= */

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

// Executa as verificações ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    atualizarEstoqueGeral();
    atualizarStatusHeader();
});

document.addEventListener("click", function (e) {
    if (e.target.closest(".botao-adicionar")) {
        setTimeout(atualizarEstoqueGeral, 50);
    }
});

/* =========================================
   ELEMENTOS DO DOM
========================================= */

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

/* =========================================
   AUXILIARES
========================================= */

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function mostrarMensagem(texto) {
    const mensagemAntiga = document.querySelector(".mensagem-sucesso");
    if (mensagemAntiga) mensagemAntiga.remove();

    const div = document.createElement("div");
    div.className = "mensagem-sucesso";
    div.textContent = texto;
    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

/* =========================================
   MODAL DE PRODUTO
========================================= */

const botoesAdicionar = document.querySelectorAll(".botao-adicionar");

botoesAdicionar.forEach(function (botao) {
    botao.addEventListener("click", function () {
        if (!pedidosEstaoAbertos()) {
            mostrarAvisoForaDoExpediente();
            return;
        }

        const nome = botao.dataset.produto;
        const preco = parseFloat(botao.dataset.preco);

        const cardProduto = botao.closest(".produto");
        let descricaoCapturada = "";
        if (cardProduto) {
            const elDescricao = cardProduto.querySelector(".descricao");
            if (elDescricao) {
                descricaoCapturada = elDescricao.innerText.trim();
            }
        }

        produtoAtual = { nome, preco };
        quantidadeAtual = 1;
        observacaoProduto.value = "";

        modalNomeProduto.textContent = nome;
        modalDescricaoProduto.innerText = descricaoCapturada;
        modalPrecoProduto.textContent = formatarMoeda(preco);
        quantidadeProduto.textContent = quantidadeAtual;

        document.querySelectorAll('#modal-produto input[name="adicional"]').forEach(checkbox => checkbox.checked = false);

        ajustarAdicionaisPorPorcao(nome);
        atualizarEstoqueGeral();
        atualizarTotalModal();

        modal.classList.add("ativo");
        modal.setAttribute("aria-hidden", "false");
    });
});

fecharModal.addEventListener("click", fecharModalProduto);

function fecharModalProduto() {
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
    produtoAtual = null;
}

modal.addEventListener("click", function (evento) {
    if (evento.target === modal) fecharModalProduto();
});

aumentarQuantidade.addEventListener("click", function () {
    quantidadeAtual++;
    quantidadeProduto.textContent = quantidadeAtual;
    atualizarTotalModal();
});

diminuirQuantidade.addEventListener("click", function () {
    if (quantidadeAtual > 1) {
        quantidadeAtual--;
        quantidadeProduto.textContent = quantidadeAtual;
        atualizarTotalModal();
    }
});

function obterAdicionaisSelecionados() {
    const adicionais = [];
    document.querySelectorAll('#modal-produto input[name="adicional"]:checked').forEach(function (checkbox) {
        adicionais.push({
            nome: checkbox.value,
            preco: parseFloat(checkbox.dataset.preco)
        });
    });
    return adicionais;
}

function calcularTotalProduto() {
    if (!produtoAtual) return 0;
    let adicionaisTotal = 0;
    obterAdicionaisSelecionados().forEach(adicional => adicionaisTotal += adicional.preco);
    return (produtoAtual.preco + adicionaisTotal) * quantidadeAtual;
}

function atualizarTotalModal() {
    modalTotal.textContent = formatarMoeda(calcularTotalProduto());
}

document.querySelectorAll('#modal-produto input[name="adicional"]').forEach(checkbox => {
    checkbox.addEventListener("change", atualizarTotalModal);
});

/* FILTRO DE ADICIONAIS DE PORÇÕES */
function ajustarAdicionaisPorPorcao(nomeProduto) {
    const nomesPorcoes = new Set(["Porção de Fritas", "Porção de Onion Rings", "Fritas Feliz"]);
    const ehPorcao = nomesPorcoes.has(nomeProduto);

    document.querySelectorAll('#modal-produto .adicional').forEach(adicional => {
        const input = adicional.querySelector('input[type="checkbox"]');
        if (!input) return;

        const somentePorcao = input.dataset.apenasPorcao === "true";

        if (ehPorcao) {
            if (somentePorcao) {
                adicional.style.display = "";
                input.disabled = false;
            } else {
                adicional.style.display = "none";
                input.checked = false;
                input.disabled = true;
            }
        } else {
            adicional.style.display = "";
            input.disabled = false;
        }
    });
}

/* =========================================
   INSERIR NO CARRINHO
========================================= */

adicionarCarrinhoModal.addEventListener("click", function () {
    if (!produtoAtual) return;

    const adicionais = obterAdicionaisSelecionados();
    const observacao = observacaoProduto.value.trim();
    let adicionaisTotal = 0;
    adicionais.forEach(adicional => adicionaisTotal += adicional.preco);

    const valorUnitario = produtoAtual.preco + adicionaisTotal;

    const novoItem = {
        id: Date.now(),
        nome: produtoAtual.nome,
        precoBase: produtoAtual.preco,
        quantidade: quantidadeAtual,
        adicionais: adicionais,
        observacao: observacao,
        valorUnitario: valorUnitario
    };

    carrinho.push(novoItem);
    atualizarCarrinho();
    fecharModalProduto();
    mostrarMensagem(`${quantidadeAtual}x ${novoItem.nome} adicionado ao pedido!`);
});

/* =========================================
   GESTÃO DO CARRINHO
========================================= */

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

    let total = 0;
    let quantidadeItens = 0;

    carrinho.forEach(function (item) {
        const subtotal = item.valorUnitario * item.quantidade;
        total += subtotal;
        quantidadeItens += item.quantidade;

        const divItem = document.createElement("div");
        divItem.className = "item-carrinho";

        let adicionaisHTML = "";
        if (item.adicionais.length > 0) {
            adicionaisHTML = `
                <div class="item-adicionais">
                    ${item.adicionais.map(adicional => `<span>+ ${adicional.nome} —${formatarMoeda(adicional.preco)}</span>`).join("")}
                </div>
            `;
        }

        divItem.innerHTML = `
            <div class="item-carrinho-info">
                <h3>${item.nome}</h3>
                <p class="controle-quantidade">
                    <span>Qtd:</span>
                    <button type="button" class="botao-diminuir" data-id="${item.id}">−</button>
                    <strong>${item.quantidade}</strong>
                    <button type="button" class="botao-aumentar" data-id="${item.id}">+</button>
                </p>
                ${adicionaisHTML}
                ${item.observacao ? `<div class="item-observacao">📝 ${item.observacao}</div>` : ""}
            </div>
            <div class="item-carrinho-acoes">
                <strong>${formatarMoeda(subtotal)}</strong>
                <button type="button" class="botao-remover" data-id="${item.id}">Remover</button>
            </div>
        `;

        itensCarrinho.appendChild(divItem);
    });

    quantidadeCarrinho.textContent = `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`;
    valorTotal.textContent = formatarMoeda(total);
    resumoCarrinho.textContent = `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"} • ${formatarMoeda(total)}`;
    finalizarPedido.disabled = false;
    
    if (!dadosPedido.classList.contains("visivel")) {
        carrinhoFlutuante.classList.add("visivel");
    }

    configurarBotoesCarrinho();
}

function configurarBotoesCarrinho() {
    document.querySelectorAll(".botao-remover").forEach(botao => {
        botao.addEventListener("click", function () {
            const id = Number(botao.dataset.id);
            carrinho = carrinho.filter(item => item.id !== id);
            atualizarCarrinho();
        });
    });

    document.querySelectorAll(".botao-aumentar").forEach(botao => {
        botao.addEventListener("click", function () {
            const id = Number(botao.dataset.id);
            const item = carrinho.find(item => item.id === id);
            if (item) {
                item.quantidade++;
                atualizarCarrinho();
            }
        });
    });

    document.querySelectorAll(".botao-diminuir").forEach(botao => {
        botao.addEventListener("click", function () {
            const id = Number(botao.dataset.id);
            const item = carrinho.find(item => item.id === id);
            if (item) {
                item.quantidade--;
                if (item.quantidade <= 0) {
                    carrinho = carrinho.filter(item => item.id !== id);
                }
                atualizarCarrinho();
            }
        });
    });
}

abrirCarrinho.addEventListener("click", () => painelCarrinho.classList.add("aberto"));
continuarComprando.addEventListener("click", () => painelCarrinho.classList.remove("aberto"));

finalizarPedido.addEventListener("click", function () {
    if (carrinho.length === 0) return;

    if (!pedidosEstaoAbertos()) {
        mostrarAvisoForaDoExpediente();
        return;
    }

    painelCarrinho.classList.remove("aberto");
    
    if (carrinhoFlutuante) {
        carrinhoFlutuante.classList.remove("visivel");
    }

    dadosPedido.classList.add("visivel");

    setTimeout(() => dadosPedido.scrollIntoView({ behavior: "smooth" }), 100);
});

if (botaoVoltarDados) {
    botaoVoltarDados.addEventListener("click", function () {
        dadosPedido.classList.remove("visivel");

        if (carrinho.length > 0 && carrinhoFlutuante) {
            carrinhoFlutuante.classList.add("visivel");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
    radio.addEventListener("change", function () {
        const campoTroco = document.getElementById("campo-troco");
        if (this.value === "Dinheiro") {
            campoTroco.style.display = "block";
        } else {
            campoTroco.style.display = "none";
        }
    });
});

/* =========================================
   ENVIAR PEDIDO VIA WHATSAPP
========================================= */

formularioPedido.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!pedidosEstaoAbertos()) {
        mostrarAvisoForaDoExpediente();
        return;
    }

    const nome = document.getElementById("nome").value.trim();
    const torre = document.getElementById("torre").value.trim();
    const apartamento = document.getElementById("apartamento").value.trim();
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value;
    const troco = document.getElementById("troco").value.trim();
    const observacaoGeral = document.getElementById("observacao").value.trim();

    if (!nome || !torre || !apartamento || !pagamento) {
        mostrarMensagem("Por favor, preencha todos os campos obrigatórios (*).");
        return;
    }

    let mensagem = `🍔 *NOVO PEDIDO - BURGER 301*\n\n`;
    mensagem += `👤 *Cliente:* ${nome}\n`;
    mensagem += `🏢 *Endereço:* Torre ${torre}, Apto ${apartamento}\n`;
    mensagem += `💳 *Pagamento:* ${pagamento}\n`;

    if (pagamento === "Dinheiro" && troco) {
        mensagem += `💵 *Troco para:* ${troco}\n`;
    }

    if (observacaoGeral) {
        mensagem += `📝 *Obs. Geral:* ${observacaoGeral}\n`;
    }

    mensagem += `\n🛒 *ITENS DO PEDIDO:*\n`;

    let totalGeral = 0;

    carrinho.forEach((item, index) => {
        const subtotalItem = item.valorUnitario * item.quantidade;
        totalGeral += subtotalItem;

        mensagem += `\n${index + 1}. *${item.quantidade}x ${item.nome}* — ${formatarMoeda(subtotalItem)}\n`;

        if (item.adicionais && item.adicionais.length > 0) {
            item.adicionais.forEach(adicional => {
                mensagem += `   + ${adicional.nome} (${formatarMoeda(adicional.preco)})\n`;
            });
        }

        if (item.observacao) {
            mensagem += `   _Obs: ${item.observacao}_\n`;
        }
    });

    mensagem += `\n💰 *VALOR TOTAL: ${formatarMoeda(totalGeral)}*\n`;
    mensagem += `📍 *Entrega na entrada da torre.*`;

    const numeroWhatsApp = "5551981061618";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(urlWhatsApp, "_blank");
});
