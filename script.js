// Número do WhatsApp
const WHATSAPP_NUMBER = "556192435990";
const WHATSAPP_PREFIX = "Olá! Gostaria de fazer o pedido dos seguintes itens:\n";

let cart = [];

/*
 Estrutura do item no carrinho:
 {
   id: 'conj1|M',
   baseId: 'conj1',
   name: 'Conjunto de Renda Vermelho',
   size: 'M',
   quantity: 1
 }
*/

// =======================
// CARRINHO
// =======================
function addItem(id, baseId, name, size, quantity = 1) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.push({
      id,
      baseId,
      name,
      size,
      quantity: Number(quantity)
    });
  }

  updateCartUI();
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

// =======================
// UI DO CARRINHO
// =======================
function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badgeMobile = document.getElementById("cartCountBadge");
  const badgeDesktop = document.getElementById("cartCountBadgeDesktop");

  if (badgeMobile) badgeMobile.textContent = count;
  if (badgeDesktop) badgeDesktop.textContent = count;

  const list = document.getElementById("cartItemsList");
  list.innerHTML = "";

  const whatsBtn = document.getElementById("whatsappBtn");

  if (cart.length === 0) {
    list.innerHTML = `<p class="text-muted">Seu carrinho está vazio.</p>`;
    if (whatsBtn) whatsBtn.disabled = true;
    return;
  }

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-start mb-2 border-bottom pb-2";

    div.innerHTML = `
      <div>
        <div class="fw-semibold">${item.name}</div>
        <div class="small text-muted">Tamanho: ${item.size}</div>
      </div>
      <div class="text-end">
        <div class="small text-muted mb-1">Qtd: ${item.quantity}</div>
        <button class="btn btn-sm btn-link text-danger remove-item-btn p-0"
                data-id="${item.id}">
          Remover
        </button>
      </div>
    `;

    list.appendChild(div);
  });

  if (whatsBtn) whatsBtn.disabled = false;
}

// =======================
// WHATSAPP
// =======================
function generateWhatsappMessage() {
  const lines = cart.map(item =>
    `- ${item.name} (Tam: ${item.size}) x${item.quantity}`
  );

  return encodeURIComponent(WHATSAPP_PREFIX + lines.join("\n"));
}

function redirectToWhatsapp() {
  if (cart.length === 0) return;

  const message = generateWhatsappMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank");
}

// =======================
// MODAL DE PRODUTO
// =======================
const productModalEl = document.getElementById("productModal");
let productModal = productModalEl
  ? new bootstrap.Modal(productModalEl)
  : null;

let currentProduct = null;
const AVAILABLE_SIZES = ["P", "M", "G", "GG"];

function openProductModalFromElement(el) {
  if (!productModal) return;

  currentProduct = {
    id: el.dataset.id,
    name: el.dataset.name,
    images: (el.dataset.images || "").split(",").map(i => i.trim()),
    desc: el.dataset.desc || ""
  };

  document.getElementById("productModalTitle").textContent = currentProduct.name;
  document.getElementById("productModalDesc").textContent = currentProduct.desc;

  const carousel = document.getElementById("productCarouselInner");
  carousel.innerHTML = "";

  if (currentProduct.images.length === 0) {
    carousel.innerHTML = `
      <div class="carousel-item active">
        <img src="https://via.placeholder.com/800x1000"
             class="d-block w-100">
      </div>
    `;
  } else {
    currentProduct.images.forEach((src, i) => {
      carousel.innerHTML += `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
          <img src="${src}" class="d-block w-100">
        </div>
      `;
    });
  }

  const sizes = document.getElementById("sizeCheckboxes");
  sizes.innerHTML = "";

  AVAILABLE_SIZES.forEach(size => {
    sizes.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${size}">
        <label class="form-check-label">${size}</label>
      </div>
    `;
  });

  document.getElementById("productQuantity").value = 1;
  productModal.show();
}

// =======================
// EVENTOS
// =======================
document.addEventListener("click", e => {
  const product = e.target.closest(".container-produto");
  const addBtn = e.target.closest(".add-to-cart-btn");
  const removeBtn = e.target.closest(".remove-item-btn");

  if (product && !addBtn) {
    openProductModalFromElement(product);
    return;
  }

  if (addBtn) {
    const id = addBtn.dataset.id;
    const name = addBtn.dataset.name;
    const size = "M";
    addItem(`${id}|${size}`, id, name, size, 1);
  }

  if (removeBtn) {
    removeItem(removeBtn.dataset.id);
  }
});

document.getElementById("modalAddToCartBtn")?.addEventListener("click", () => {
  if (!currentProduct) return;

  const quantity = Math.max(
    1,
    Number(document.getElementById("productQuantity").value)
  );

  const sizes = [...document.querySelectorAll("#sizeCheckboxes input:checked")]
    .map(i => i.value);

  if (sizes.length === 0) {
    alert("Selecione pelo menos um tamanho.");
    return;
  }

  sizes.forEach(size => {
    addItem(
      `${currentProduct.id}|${size}`,
      currentProduct.id,
      currentProduct.name,
      size,
      quantity
    );
  });

  productModal.hide();
});

document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);
document.getElementById("whatsappBtn")?.addEventListener("click", redirectToWhatsapp);

document.getElementById("year").textContent = new Date().getFullYear();
updateCartUI();
