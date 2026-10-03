function mostrarMensagem(texto) {
    const mensagemAntiga = document.querySelector(".mensagem-sucesso");
    if (mensagemAntiga) mensagemAntiga.remove();
    
    const div = document.createElement("div");
    div.className = "mensagem-sucesso";
    div.style.cssText = "position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #f28c28; color: #fff; padding: 14px 24px; border-radius: 8px; font-weight: bold; font-size: 15px; z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.7); text-align: center; max-width: 90%;";
    div.textContent = texto;
    
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 6500); // 6,5 segundos na tela (3 segundos a mais)
}
