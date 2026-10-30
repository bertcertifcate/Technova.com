const panels = [...document.querySelectorAll("[data-panel]")];
const navigationButtons = [...document.querySelectorAll("[data-view]")];
const navItems = [...document.querySelectorAll(".nav-item")];
const aboutSubnav = document.querySelector("#about-subnav");
const contactRail = document.querySelector("#contact-rail");
const menuToggle = document.querySelector(".menu-toggle");
const siteShell = document.querySelector(".site-shell");
const albumView = document.querySelector("#album-view");
const ownerDashboardLink = document.querySelector('.nav-item[data-view="dashboard"]');
const themeToggle = document.querySelector("#theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themePreferenceKey = "technova-color-theme";

function isOwnerAuthenticated() {
  return sessionStorage.getItem(ownerSessionStorageKey) === "authenticated";
}

function updateOwnerAccess() {
  ownerDashboardLink.hidden = !isOwnerAuthenticated();
  document.querySelector("#owner-dashboard-content").hidden = !isOwnerAuthenticated();
}

function setTheme(theme, savePreference = false) {
  const selectedTheme = theme === "light" ? "light" : "dark";
  const isLightTheme = selectedTheme === "light";
  document.documentElement.dataset.theme = selectedTheme;
  themeToggle.setAttribute("aria-pressed", String(isLightTheme));
  themeToggle.setAttribute("aria-label", `Switch to ${isLightTheme ? "dark" : "light"} mode`);
  themeToggle.title = `Switch to ${isLightTheme ? "dark" : "light"} mode`;
  themeColorMeta.content = isLightTheme ? "#ffffff" : "#08111f";
  if (savePreference) localStorage.setItem(themePreferenceKey, selectedTheme);
}

const savedTheme = localStorage.getItem(themePreferenceKey);
setTheme(savedTheme === "light" ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme, true);
});

function showView(view, { closeMenu = true, focusHeading = true, updateHistory = true } = {}) {
  if (view === "dashboard" && !isOwnerAuthenticated()) view = "home";
  const selectedPanel = panels.find((panel) => panel.dataset.panel === view);
  if (!selectedPanel) return;
  if (updateHistory && location.hash !== `#${view}`) {
    history.pushState({ view }, "", `#${view}`);
  }

  for (const panel of panels) {
    const isSelected = panel === selectedPanel;
    panel.hidden = !isSelected;
    panel.classList.toggle("is-visible", isSelected);
  }

  const activeNav = ["history", "organization", "profile"].includes(view) ? "about" : view;
  for (const item of navItems) {
    const isActive = item.dataset.view === activeNav;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
    if (item.dataset.view === "about") item.setAttribute("aria-expanded", String(isActive));
  }
  aboutSubnav.hidden = activeNav !== "about";
  for (const item of aboutSubnav.querySelectorAll("[data-view]")) {
    const isActive = item.dataset.view === view;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  }

  contactRail.hidden = view !== "contacts";
  siteShell.classList.toggle("has-contact-rail", view === "contacts");
  if (view === "dashboard") renderOwnerDashboard();
  if (closeMenu) closeNavigation();
  if (focusHeading) {
    const heading = selectedPanel.querySelector("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  });
  if (view !== "portfolio") closeAlbum();
}

function closeNavigation() {
  siteShell.classList.remove("has-menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

for (const button of navigationButtons) {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    if (button.classList.contains("nav-item") && view === "about") {
      const expanded = button.getAttribute("aria-expanded") === "true";
      if (expanded) {
        button.setAttribute("aria-expanded", "false");
        aboutSubnav.hidden = true;
      } else {
        showView("about", { closeMenu: false, focusHeading: false });
      }
      return;
    }
    showView(view);
  });
}

for (const button of document.querySelectorAll("[data-scroll-to]")) {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTo);
    if (!target) return;
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  });
}

menuToggle.addEventListener("click", () => {
  const isOpen = siteShell.classList.toggle("has-menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("click", (event) => {
  if (
    siteShell.classList.contains("has-menu-open") &&
    !event.target.closest(".sidebar, .menu-toggle")
  ) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (siteShell.classList.contains("has-menu-open")) {
    closeNavigation();
    menuToggle.focus();
  } else if (activeAlbum) {
    closeAlbum();
    document.querySelector(".folder-card")?.focus();
  } else if (shoppingDialog.open) {
    shoppingDialog.close();
  }
});

document.querySelector(".back-top").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  });
});

const portfolioAlbums = {
  activities: {
    title: "Activities",
    description: "Class activities and creative work.",
    items: [
      { title: "About Myself", file: "ACT1_DEGAMO.html", kind: "Personal introduction page" },
      { title: "Sa Aking Mga Kabata", file: "ACT2_DEGAMO.html", kind: "Poem & text styling" },
      { title: "HTML Quiz", file: "ACT4_DEGAMO.html", kind: "HTML knowledge quiz" },
      { title: "My Gallery", file: "ACT4_DEGAMO1.html", kind: "Linked image gallery" }
    ]
  },
  exercises: {
    title: "Exercises",
    description: "HTML practice exercises.",
    items: [
      { title: "My First Webpage", file: "EXE1 DEGAMO1.html", kind: "Getting started with HTML" },
      { title: "Personal Information", file: "EXE2 DEGAMO.html", kind: "HTML text and paragraph practice" },
      { title: "About Myself", file: "EXE3 DEGAMO1.html", kind: "Personal introduction page" },
      { title: "Font Tag Attributes", file: "EXE4 DEGAMO1.html", kind: "Fonts, colors & sizes" },
      { title: "Sa Aking Mga Kabata", file: "EXE5 2.0_DEGAMO.html", kind: "Poem with image albums" },
      { title: "My Favorite Quotes", file: "EXE6 DEGAMO1.html", kind: "Text alignment & formatting" },
      { title: "Popular Search Engines", file: "EXE7_DEGAMO 1.html", kind: "HTML links and layout" },
      { title: "My Gallery", file: "EXE8_DEGAMO 1.html", kind: "Image gallery links" }
    ]
  }
};

const portfolioCards = [...document.querySelectorAll(".folder-card")];
const albumGrid = document.querySelector("#album-grid");
const albumControls = document.querySelector("#album-controls");
const albumStatus = document.querySelector("#album-status");
const albumAnnouncement = document.querySelector("#album-announcement");
let activeAlbum = null;
let albumPage = 0;
const albumPageSize = 6;

function renderAlbum() {
  const album = portfolioAlbums[activeAlbum];
  const pageCount = Math.ceil(album.items.length / albumPageSize);
  const firstItem = albumPage * albumPageSize;
  const items = album.items.slice(firstItem, firstItem + albumPageSize);

  albumGrid.replaceChildren();
  items.forEach((item, index) => {
    const link = document.createElement("a");
    link.className = "album-card";
    link.href = `portfolio/${activeAlbum}/${encodeURI(item.file)}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", `Open ${item.title}`);

    const cover = document.createElement("span");
    cover.className = `album-cover ${activeAlbum === "activities" ? "cover-activity" : "cover-exercise"} cover-variant-${index % 6}`;
    cover.setAttribute("aria-hidden", "true");
    const coverMark = document.createElement("span");
    coverMark.className = "album-cover-mark";
    coverMark.textContent = activeAlbum === "activities" ? "✳" : "</>";
    const coverLabel = document.createElement("span");
    coverLabel.className = "album-cover-label";
    coverLabel.textContent = album.title;
    cover.append(coverMark, coverLabel);

    const info = document.createElement("span");
    info.className = "album-card-info";
    const title = document.createElement("strong");
    title.textContent = item.title;
    const kind = document.createElement("span");
    kind.textContent = item.kind;
    const file = document.createElement("small");
    file.textContent = item.file;
    info.append(title, kind, file);

    const arrow = document.createElement("span");
    arrow.className = "album-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    link.append(cover, info, arrow);
    albumGrid.append(link);
  });

  const hasMultiplePages = pageCount > 1;
  albumControls.hidden = false;
  albumControls.classList.toggle("has-pages", hasMultiplePages);
  albumStatus.textContent = hasMultiplePages ? "More items" : "";
  document.querySelector("#album-previous").disabled = albumPage === 0;
  document.querySelector("#album-next").disabled = albumPage >= pageCount - 1;
  albumAnnouncement.textContent = `${album.title}: showing ${items.length} of ${album.items.length} items.`;
}

function openAlbum(folder) {
  activeAlbum = folder;
  albumPage = 0;
  const album = portfolioAlbums[folder];
  document.querySelector("#album-title").textContent = album.title;
  document.querySelector(".album-eyebrow").textContent = album.description;
  albumView.hidden = false;
  portfolioCards.forEach((card) => {
    const isSelected = card.dataset.folder === folder;
    card.setAttribute("aria-pressed", String(isSelected));
  });
  renderAlbum();
}

function closeAlbum() {
  activeAlbum = null;
  albumView.hidden = true;
  albumControls.hidden = true;
  portfolioCards.forEach((card) => card.setAttribute("aria-pressed", "false"));
}

for (const card of portfolioCards) {
  card.addEventListener("click", () => openAlbum(card.dataset.folder));
}

document.querySelector("#album-back").addEventListener("click", closeAlbum);
document.querySelector("#album-previous").addEventListener("click", () => {
  if (!activeAlbum || albumPage === 0) return;
  albumPage -= 1;
  renderAlbum();
});
document.querySelector("#album-next").addEventListener("click", () => {
  if (!activeAlbum) return;
  const pageCount = Math.ceil(portfolioAlbums[activeAlbum].items.length / albumPageSize);
  if (albumPage >= pageCount - 1) return;
  albumPage += 1;
  renderAlbum();
});

document.querySelector("#feedback-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim();
  const message = String(formData.get("message")).trim();
  const subject = `Technova website message from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const mailtoUrl = `${form.action}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const feedback = document.querySelector("#form-feedback");
  feedback.textContent = "Your email app should open with your message ready. If it does not, email albertodegamo60@gmail.com directly.";
  window.location.href = mailtoUrl;
});

const shoppingDialog = document.querySelector("#shopping-dialog");
const shoppingContent = document.querySelector("#shopping-content");
const shoppingTitle = document.querySelector("#shopping-title");
const cartTrigger = document.querySelector("#cart-trigger");
const accountTrigger = document.querySelector("#account-trigger");
const ordersTrigger = document.querySelector("#my-orders-trigger");
const cartCount = document.querySelector("#cart-count");
const cartStorageKey = "dgmx-demo-cart-v1";
const userStorageKey = "dgmx-demo-user-v1";
const legacyUserStorageKey = "dgmx-demo-user-v1";
const ordersStorageKey = "dgmx-demo-orders-v1";
const deliveryProfileStoragePrefix = "dgmx-demo-delivery-v1:";
const inventoryStorageKey = "dgmx-demo-inventory-v1";
const ownerSessionStorageKey = "dgmx-owner-session-v2";
const demoOwnerEmail = "owner@technova.demo";
const demoOwnerPassword = "TechNovaDemo2026!";
const philippineLocalities = [
  { city: "Manila", province: "Metro Manila", postal: "1000", aliases: ["City of Manila"] },
  { city: "Quezon City", province: "Metro Manila", postal: "1100", aliases: ["QC"] },
  { city: "Makati", province: "Metro Manila", postal: "1200", aliases: ["Makati City"] },
  { city: "Pasig", province: "Metro Manila", postal: "1600", aliases: ["Pasig City"] },
  { city: "Taguig", province: "Metro Manila", postal: "1630", aliases: ["Taguig City"] },
  { city: "Caloocan", province: "Metro Manila", postal: "1400", aliases: ["Caloocan City"] },
  { city: "Las Piñas", province: "Metro Manila", postal: "1740", aliases: ["Las Pinas", "Las Piñas City"] },
  { city: "Muntinlupa", province: "Metro Manila", postal: "1770", aliases: ["Muntinlupa City"] },
  { city: "Parañaque", province: "Metro Manila", postal: "1700", aliases: ["Paranaque", "Parañaque City"] },
  { city: "Marikina", province: "Metro Manila", postal: "1800", aliases: ["Marikina City"] },
  { city: "Pasay", province: "Metro Manila", postal: "1300", aliases: ["Pasay City"] },
  { city: "Mandaluyong", province: "Metro Manila", postal: "1550", aliases: ["Mandaluyong City"] },
  { city: "San Juan", province: "Metro Manila", postal: "1500", aliases: ["San Juan City"] },
  { city: "Valenzuela", province: "Metro Manila", postal: "1440", aliases: ["Valenzuela City"] },
  { city: "Pateros", province: "Metro Manila", postal: "1620", aliases: ["Municipality of Pateros"] },
  { city: "Cebu City", province: "Cebu", postal: "6000", aliases: ["Cebu"] },
  { city: "Lapu-Lapu City", province: "Cebu", postal: "6015", aliases: ["Lapu Lapu City", "Opon"] },
  { city: "Mandaue City", province: "Cebu", postal: "6014", aliases: ["Mandaue"] },
  { city: "Davao City", province: "Davao del Sur", postal: "8000", aliases: ["Davao"] },
  { city: "Iloilo City", province: "Iloilo", postal: "5000", aliases: ["Iloilo"] },
  { city: "Bacolod City", province: "Negros Occidental", postal: "6100", aliases: ["Bacolod"] },
  { city: "Cagayan de Oro", province: "Misamis Oriental", postal: "9000", aliases: ["Cagayan de Oro City", "CDO"] },
  { city: "Baguio City", province: "Benguet", postal: "2600", aliases: ["Baguio"] },
  { city: "Antipolo City", province: "Rizal", postal: "1870", aliases: ["Antipolo"] },
  { city: "Zamboanga City", province: "Zamboanga del Sur", postal: "7000", aliases: ["Zamboanga"] },
  { city: "General Santos City", province: "South Cotabato", postal: "9500", aliases: ["General Santos", "GenSan"] },
  { city: "Bacoor City", province: "Cavite", postal: "4102", aliases: ["Bacoor"] },
  { city: "Imus City", province: "Cavite", postal: "4103", aliases: ["Imus"] },
  { city: "Dasmariñas City", province: "Cavite", postal: "4114", aliases: ["Dasmarinas", "Dasmariñas"] },
  { city: "Santa Rosa City", province: "Laguna", postal: "4026", aliases: ["Santa Rosa"] },
  { city: "Calamba City", province: "Laguna", postal: "4027", aliases: ["Calamba"] },
  { city: "Angeles City", province: "Pampanga", postal: "2009", aliases: ["Angeles"] },
  { city: "San Fernando City", province: "Pampanga", postal: "2000", aliases: ["San Fernando, Pampanga"] }
];
const products = [...document.querySelectorAll(".product-card")].map((card, index) => {
  const priceText = card.querySelector(".product-price").textContent;
  const product = {
    index,
    card,
    name: card.querySelector("h3").textContent.trim(),
    category: card.querySelector(".product-category").textContent.split("·")[0].trim(),
    image: card.querySelector(".product-image").src,
    price: Number(priceText.replace(/[^\d]/g, ""))
  };
  const addButton = document.createElement("button");
  addButton.className = "add-to-cart";
  addButton.type = "button";
  addButton.dataset.addToCart = String(index);
  addButton.textContent = "Add to cart";
  addButton.setAttribute("aria-label", `Add ${product.name} to cart`);
  card.querySelector(".product-card-content").append(addButton);
  return product;
});
const categoryKeyByName = new Map([
  ["COMPUTING", "computing"],
  ["MOBILE", "mobile"],
  ["AUDIO", "audio"],
  ["WEARABLES", "wearables"],
  ["COMPUTER ACCESSORIES", "accessories"],
  ["DISPLAYS", "displays"],
  ["CAMERAS", "cameras"]
]);
const productFilterStatus = document.querySelector("#product-filter-status");
const productSearch = document.querySelector("#product-search");
const productEmptyState = document.querySelector("#product-empty-state");

function filterProducts(selectedCategory) {
  const query = productSearch.value.trim().toLocaleLowerCase();
  const visibleCount = products.reduce((count, product) => {
    const matchesCategory = selectedCategory === "all" || categoryKeyByName.get(product.category) === selectedCategory;
    const matchesSearch = !query || product.card.textContent.toLocaleLowerCase().includes(query);
    const isVisible = matchesCategory && matchesSearch;
    product.card.hidden = !isVisible;
    return count + Number(isVisible);
  }, 0);

  for (const section of document.querySelectorAll(".product-section")) {
    section.hidden = section.id !== "shop" &&
      ![...section.querySelectorAll(".product-card")].some((card) => !card.hidden);
  }

  productEmptyState.hidden = visibleCount > 0;
  productFilterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "product" : "products"} shown.`;
}

for (const filter of document.querySelectorAll("[data-category-filter]")) {
  filter.addEventListener("click", () => {
    const selectedCategory = filter.dataset.categoryFilter;
    for (const button of document.querySelectorAll("[data-category-filter]")) {
      const isSelected = button === filter;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    }
    for (const button of document.querySelectorAll("[data-shop-category]")) {
      button.classList.toggle("is-active", button.dataset.shopCategory === selectedCategory);
    }
    filterProducts(selectedCategory);
  });
}

for (const card of document.querySelectorAll("[data-shop-category]")) {
  card.addEventListener("click", () => {
    const selectedCategory = card.dataset.shopCategory;
    const filter = document.querySelector(`[data-category-filter="${selectedCategory}"]`);
    filter.click();
    document.querySelector("#shop").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  });
}

productSearch.addEventListener("input", () => {
  const selectedCategory = document.querySelector(".category-filter.is-active").dataset.categoryFilter;
  filterProducts(selectedCategory);
});

let cart = readCart();
let demoUser = readDemoUser();
let inventory = readInventory();
let activeShoppingScreen = "cart";
let pendingShoppingScreen = "checkout";
let lastOrder = null;
let lastCartAnnouncement = "";

function readCart() {
  const savedCart = localStorage.getItem(cartStorageKey);
  if (!savedCart) return [];
  try {
    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) throw new TypeError("Saved cart is not a list.");
    return parsedCart.filter((item) =>
      Number.isInteger(item.productIndex) &&
      item.productIndex >= 0 &&
      item.productIndex < document.querySelectorAll(".product-card").length &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch (error) {
    console.error("Could not read the saved demo cart. Starting with an empty cart.", error);
    localStorage.removeItem(cartStorageKey);
    return [];
  }
}

function readOrders() {
  const savedOrders = localStorage.getItem(ordersStorageKey);
  if (!savedOrders) return [];
  try {
    const orders = JSON.parse(savedOrders);
    if (!Array.isArray(orders)) throw new TypeError("Saved demo orders are not a list.");
    return orders.filter((order) =>
      order &&
      typeof order.id === "string" &&
      typeof order.email === "string" &&
      Number.isFinite(order.total) &&
      Array.isArray(order.items)
    );
  } catch (error) {
    console.error("Could not read saved demo orders.", error);
    localStorage.removeItem(ordersStorageKey);
    return [];
  }
}

function readInventory() {
  const savedInventory = localStorage.getItem(inventoryStorageKey);
  if (!savedInventory) return products.map(() => 10);
  try {
    const stock = JSON.parse(savedInventory);
    if (!Array.isArray(stock) || stock.length !== products.length ||
        stock.some((quantity) => !Number.isInteger(quantity) || quantity < 0)) {
      throw new TypeError("Saved demo inventory is invalid.");
    }
    return stock;
  } catch (error) {
    console.error("Could not read saved demo inventory. Starting with sample stock.", error);
    localStorage.removeItem(inventoryStorageKey);
    return products.map(() => 10);
  }
}

function saveInventory() {
  localStorage.setItem(inventoryStorageKey, JSON.stringify(inventory));
}

function readDemoUser() {
  const savedUser = localStorage.getItem(userStorageKey) || sessionStorage.getItem(legacyUserStorageKey);
  if (!savedUser) return null;
  try {
    const user = JSON.parse(savedUser);
    if (typeof user.email !== "string" || !user.email.includes("@")) {
      localStorage.removeItem(userStorageKey);
      sessionStorage.removeItem(legacyUserStorageKey);
      return null;
    }
    localStorage.setItem(userStorageKey, JSON.stringify({ email: user.email }));
    sessionStorage.removeItem(legacyUserStorageKey);
    return { email: user.email };
  } catch (error) {
    console.error("Could not read the saved demo account.", error);
    localStorage.removeItem(userStorageKey);
    sessionStorage.removeItem(userStorageKey);
    return null;
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateCartCount();
}

function deliveryProfileKey(email) {
  return `${deliveryProfileStoragePrefix}${encodeURIComponent(email.toLocaleLowerCase())}`;
}

function readDeliveryProfile(email) {
  const key = deliveryProfileKey(email);
  const savedProfile = localStorage.getItem(key);
  if (!savedProfile) return {};
  try {
    const profile = JSON.parse(savedProfile);
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new TypeError("Saved delivery profile is not an object.");
    }
    return Object.fromEntries(
      ["name", "phone", "address", "city", "province", "postal", "payment"]
        .filter((field) => typeof profile[field] === "string")
        .map((field) => [field, profile[field]])
    );
  } catch (error) {
    console.error("Could not read the saved delivery profile.", error);
    localStorage.removeItem(key);
    return {};
  }
}

function saveDeliveryProfile(email, profile) {
  localStorage.setItem(deliveryProfileKey(email), JSON.stringify(profile));
}

function updateCartCount() {
  const quantity = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = String(quantity);
  cartTrigger.setAttribute("aria-label", `Shopping cart, ${quantity} ${quantity === 1 ? "item" : "items"}`);
  accountTrigger.textContent = demoUser ? `Account · ${demoUser.email}` : "Sign in";
  accountTrigger.setAttribute("aria-label", demoUser ? `Signed in as ${demoUser.email}. Open account` : "Sign in to your demo account");
}

function formatPrice(amount) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-PH");
}

function buildOrderCard(order, showCustomer = false) {
  const card = makeShoppingElement("article", "order-card");
  const heading = makeShoppingElement("div", "order-card-heading");
  const identity = makeShoppingElement("div", "order-card-identity");
  identity.append(
    makeShoppingElement("strong", "", order.id),
    makeShoppingElement("span", "", formatOrderDate(order.placedAt))
  );
  heading.append(identity, makeShoppingElement("strong", "order-card-total", formatPrice(order.total)));
  card.append(heading);

  if (showCustomer) {
    card.append(makeShoppingElement("p", "order-card-customer", order.email));
  }
  const items = makeShoppingElement("ul", "order-item-list");
  for (const item of order.items) {
    const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;
    const line = makeShoppingElement(
      "li",
      "",
      `${item.name || "Product"} × ${quantity}`
    );
    items.append(line);
  }
  card.append(items);

  if (order.delivery) {
    const delivery = makeShoppingElement("p", "order-card-delivery");
    delivery.textContent = [
      order.delivery.name,
      order.delivery.address,
      [order.delivery.city, order.delivery.province, order.delivery.postal].filter(Boolean).join(", ")
    ].filter(Boolean).join(" · ");
    if (delivery.textContent) card.append(delivery);
  }
  card.append(makeShoppingElement("span", "order-demo-status", "Demo order · Not submitted to a seller"));
  return card;
}

function renderMyOrders() {
  shoppingTitle.textContent = "My orders";
  shoppingContent.replaceChildren();
  if (!demoUser) {
    const intro = makeShoppingElement("p", "shopping-intro", "Sign in with the email used at checkout to see your saved orders.");
    const signIn = makeShoppingElement("button", "shopping-primary", "Sign in to view orders");
    signIn.type = "button";
    signIn.dataset.shoppingAction = "login";
    shoppingContent.append(intro, signIn);
    return;
  }

  shoppingContent.append(
    makeShoppingElement("p", "signed-in-note", `Orders for ${demoUser.email}`),
    makeShoppingElement("p", "demo-notice", "Orders are saved only in this browser. They are not available on other devices.")
  );
  const orders = readOrders()
    .filter((order) => order.email.toLocaleLowerCase() === demoUser.email.toLocaleLowerCase())
    .sort((first, second) => new Date(second.placedAt).getTime() - new Date(first.placedAt).getTime());
  if (!orders.length) {
    shoppingContent.append(makeShoppingElement("p", "cart-empty", "No orders yet for this account."));
    return;
  }
  const orderList = makeShoppingElement("div", "order-list");
  for (const order of orders) orderList.append(buildOrderCard(order));
  shoppingContent.append(orderList);
}

function renderOwnerDashboard() {
  const dashboardContent = document.querySelector("#owner-dashboard-content");
  if (!isOwnerAuthenticated()) {
    dashboardContent.hidden = true;
    return;
  }
  dashboardContent.hidden = false;
  document.querySelector("#owner-session-label").textContent = `Signed in as ${demoOwnerEmail}`;

  const orders = readOrders().sort(
    (first, second) => new Date(second.placedAt).getTime() - new Date(first.placedAt).getTime()
  );
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const unitsSold = orders.reduce((sum, order) =>
    sum + order.items.reduce((itemSum, item) => itemSum + (Number.isInteger(item.quantity) ? item.quantity : 0), 0), 0);
  const stats = document.querySelector("#dashboard-stats");
  stats.replaceChildren();
  [
    ["Demo sales", formatPrice(revenue)],
    ["Orders", String(orders.length)],
    ["Units sold", String(unitsSold)],
    ["Units in stock", String(inventory.reduce((sum, quantity) => sum + quantity, 0))]
  ].forEach(([label, value]) => {
    const card = makeShoppingElement("article", "dashboard-stat");
    card.append(makeShoppingElement("span", "", label), makeShoppingElement("strong", "", value));
    stats.append(card);
  });

  const inventoryList = document.querySelector("#inventory-list");
  inventoryList.replaceChildren();
  products.forEach((product, index) => {
    const row = makeShoppingElement("div", "inventory-row");
    row.dataset.inventoryIndex = String(index);
    const details = makeShoppingElement("div", "inventory-product");
    details.append(
      makeShoppingElement("strong", "", product.name),
      makeShoppingElement("span", "", `${product.category} · ${formatPrice(product.price)} each`)
    );
    const label = makeShoppingElement("label", "inventory-stock-label", "Stock");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.required = true;
    input.name = "stock";
    input.value = String(inventory[index]);
    input.setAttribute("aria-label", `${product.name} stock quantity`);
    label.append(input);
    row.append(details, label);
    inventoryList.append(row);
  });

  const ownerOrders = document.querySelector("#owner-orders");
  ownerOrders.replaceChildren();
  if (!orders.length) {
    ownerOrders.append(makeShoppingElement("p", "cart-empty", "No demo sales yet."));
    return;
  }
  const orderList = makeShoppingElement("div", "order-list");
  for (const order of orders) orderList.append(buildOrderCard(order, true));
  ownerOrders.append(orderList);
}

function openShoppingDialog(screen = "cart") {
  activeShoppingScreen = screen;
  renderShoppingScreen();
  if (!shoppingDialog.open) shoppingDialog.showModal();
}

function addToCart(productIndex) {
  const existingItem = cart.find((item) => item.productIndex === productIndex);
  if (inventory[productIndex] === 0 || (existingItem && existingItem.quantity >= inventory[productIndex])) {
    lastCartAnnouncement = `${products[productIndex].name} is at its available demo stock limit.`;
    openShoppingDialog("cart");
    return;
  }
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ productIndex, quantity: 1 });
  saveCart();
  lastCartAnnouncement = `${products[productIndex].name} added to your cart.`;
  openShoppingDialog("cart");
}

function makeShoppingElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function cartSubtotal() {
  return cart.reduce((total, item) => total + products[item.productIndex].price * item.quantity, 0);
}

function renderCart() {
  shoppingTitle.textContent = "Your cart";
  shoppingContent.replaceChildren();
  if (demoUser) {
    const accountLine = makeShoppingElement("div", "cart-account-line");
    accountLine.append(makeShoppingElement("span", "signed-in-note", `Signed in as ${demoUser.email}`));
    const signOut = makeShoppingElement("button", "sign-out-button", "Sign out");
    signOut.type = "button";
    signOut.dataset.shoppingAction = "sign-out";
    accountLine.append(signOut);
    shoppingContent.append(accountLine);
  }
  if (lastCartAnnouncement) {
    const announcement = makeShoppingElement("p", "shopping-feedback", lastCartAnnouncement);
    announcement.setAttribute("role", "status");
    shoppingContent.append(announcement);
    lastCartAnnouncement = "";
  }

  if (cart.length === 0) {
    shoppingContent.append(
      makeShoppingElement("p", "cart-empty", "Your cart is empty. Add a sample product to get started."),
      makeShoppingElement("p", "demo-notice", "Demo shop only · No payment will be collected.")
    );
    return;
  }

  const list = makeShoppingElement("div", "cart-lines");
  for (const item of cart) {
    const product = products[item.productIndex];
    const row = makeShoppingElement("article", "cart-line");
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";
    const details = makeShoppingElement("div", "cart-line-details");
    details.append(
      makeShoppingElement("strong", "cart-product-name", product.name),
      makeShoppingElement("span", "cart-product-price", `${formatPrice(product.price)} each`)
    );
    const controls = makeShoppingElement("div", "cart-line-controls");
    const decrease = makeShoppingElement("button", "quantity-button", "−");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.productIndex = String(item.productIndex);
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);
    const quantity = makeShoppingElement("span", "cart-quantity", String(item.quantity));
    quantity.setAttribute("aria-label", `Quantity ${item.quantity}`);
    const increase = makeShoppingElement("button", "quantity-button", "+");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.productIndex = String(item.productIndex);
    increase.setAttribute("aria-label", `Add one ${product.name}`);
    increase.disabled = item.quantity >= inventory[item.productIndex];
    controls.append(decrease, quantity, increase);
    row.append(image, details, controls);
    list.append(row);
  }

  const summary = makeShoppingElement("div", "cart-summary");
  summary.append(
    makeShoppingElement("span", "", "Subtotal"),
    makeShoppingElement("strong", "", formatPrice(cartSubtotal()))
  );
  const checkout = makeShoppingElement("button", "shopping-primary", "Proceed to checkout");
  checkout.type = "button";
  checkout.dataset.shoppingAction = "checkout";
  const notice = makeShoppingElement(
    "p",
    "demo-notice",
    "Sign in is required to place an order. Demo checkout only · No payment will be collected."
  );
  shoppingContent.append(list, summary, checkout, notice);
}

function renderSignIn() {
  shoppingTitle.textContent = "Sign in";
  shoppingContent.replaceChildren();
  const intro = makeShoppingElement("p", "shopping-intro", "Choose a customer or owner account to continue.");
  const demoCredentials = makeShoppingElement("div", "demo-credentials");
  const form = document.createElement("form");
  form.id = "demo-sign-in-form";
  form.className = "shopping-form";
  const accountTypeLabel = makeShoppingElement("label", "", "Account type");
  accountTypeLabel.htmlFor = "account-type";
  const accountType = document.createElement("select");
  accountType.id = "account-type";
  accountType.name = "accountType";
  accountType.append(
    new Option("Customer", "customer"),
    new Option("Owner", "owner")
  );
  const emailLabel = makeShoppingElement("label", "", "Email address");
  emailLabel.htmlFor = "demo-email";
  const email = document.createElement("input");
  email.id = "demo-email";
  email.name = "email";
  email.type = "email";
  email.autocomplete = "username";
  email.required = true;
  email.value = demoUser?.email || "";
  const passwordLabel = makeShoppingElement("label", "", "Password");
  passwordLabel.htmlFor = "demo-password";
  const password = document.createElement("input");
  password.id = "demo-password";
  password.name = "password";
  password.type = "password";
  password.autocomplete = "current-password";
  password.minLength = 6;
  password.required = true;
  const feedback = makeShoppingElement("p", "owner-auth-feedback");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  const notice = makeShoppingElement(
    "p",
    "demo-notice",
    "Customer demo sign-in keeps your email in this browser. Owner sign-in only unlocks the local demo dashboard. No password is sent to a server."
  );
  const actions = makeShoppingElement("div", "shopping-actions");
  const back = makeShoppingElement("button", "shopping-secondary", "Back to cart");
  back.type = "button";
  back.dataset.shoppingAction = "cart";
  const submit = makeShoppingElement("button", "shopping-primary", "Sign in and continue");
  submit.type = "submit";
  actions.append(back, submit);
  form.append(accountTypeLabel, accountType, emailLabel, email, passwordLabel, password, feedback, notice, actions);
  shoppingContent.append(intro, demoCredentials, form);

  const updateAccountType = () => {
    const isOwner = accountType.value === "owner";
    email.value = isOwner ? demoOwnerEmail : (demoUser?.email || "demo@example.com");
    password.value = isOwner ? demoOwnerPassword : "demo1234";
    submit.textContent = isOwner ? "Sign in as owner" : "Sign in and continue";
    demoCredentials.replaceChildren();
    demoCredentials.append(
      makeShoppingElement("strong", "", isOwner ? "Demo owner account" : "Demo customer account"),
      makeShoppingElement("span", "", `Email: ${email.value}`),
      makeShoppingElement("span", "", `Password: ${password.value}`)
    );
    if (isOwner) {
      demoCredentials.append(
        makeShoppingElement("span", "", "Demo access only; this static site does not provide secure authentication.")
      );
    }
    feedback.textContent = "";
  };
  accountType.addEventListener("change", updateAccountType);
  updateAccountType();
  email.focus();
}

function renderCheckout() {
  if (!demoUser) {
    renderSignIn();
    return;
  }
  shoppingTitle.textContent = "Delivery details";
  shoppingContent.replaceChildren();
  const signedIn = makeShoppingElement("p", "signed-in-note", `Signed in as ${demoUser.email}`);
  const summary = makeShoppingElement("div", "checkout-summary");
  summary.append(makeShoppingElement("strong", "", `${cart.reduce((total, item) => total + item.quantity, 0)} items`));
  for (const item of cart) {
    const product = products[item.productIndex];
    summary.append(makeShoppingElement(
      "p",
      "checkout-item",
      `${product.name} × ${item.quantity} — ${formatPrice(product.price * item.quantity)}`
    ));
  }
  summary.append(makeShoppingElement("p", "checkout-total", `Total · ${formatPrice(cartSubtotal())}`));

  const form = document.createElement("form");
  form.id = "demo-checkout-form";
  form.className = "shopping-form";
  const deliveryProfile = readDeliveryProfile(demoUser.email);
  const fields = [
    { id: "delivery-name", label: "Full name", name: "name", type: "text", autocomplete: "name" },
    { id: "delivery-phone", label: "Phone number", name: "phone", type: "tel", autocomplete: "tel" },
    { id: "delivery-address", label: "House no., street, barangay", name: "address", type: "text", autocomplete: "street-address" }
  ];
  for (const field of fields) {
    const label = makeShoppingElement("label", "", field.label);
    label.htmlFor = field.id;
    const input = document.createElement("input");
    Object.assign(input, field);
    input.required = true;
    input.value = deliveryProfile[field.name] || "";
    form.append(label, input);
  }
  const cityLabel = makeShoppingElement("label", "", "City / municipality");
  cityLabel.htmlFor = "delivery-city";
  const city = document.createElement("input");
  city.id = "delivery-city";
  city.name = "city";
  city.type = "text";
  city.autocomplete = "address-level2";
  city.setAttribute("list", "philippine-localities");
  city.placeholder = "Type and choose a city";
  city.required = true;
  city.value = deliveryProfile.city || "";
  const localityOptions = document.createElement("datalist");
  localityOptions.id = "philippine-localities";
  for (const locality of philippineLocalities) {
    localityOptions.append(new Option(`${locality.city}, ${locality.province} · ${locality.postal}`, locality.city));
  }
  form.append(cityLabel, city, localityOptions);

  const provinceLabel = makeShoppingElement("label", "", "Province / region");
  provinceLabel.htmlFor = "delivery-province";
  const province = document.createElement("input");
  province.id = "delivery-province";
  province.name = "province";
  province.type = "text";
  province.readOnly = true;
  province.placeholder = "Filled from city selection";
  province.value = deliveryProfile.province || "";
  form.append(provinceLabel, province);

  const postalLabel = makeShoppingElement("label", "", "Postal code");
  postalLabel.htmlFor = "delivery-postal";
  const postal = document.createElement("input");
  postal.id = "delivery-postal";
  postal.name = "postal";
  postal.type = "text";
  postal.inputMode = "numeric";
  postal.autocomplete = "postal-code";
  postal.placeholder = "Filled from city selection; editable";
  postal.required = true;
  postal.value = deliveryProfile.postal || "";
  form.append(postalLabel, postal);

  const localityNote = makeShoppingElement(
    "p",
    "locality-note",
    "Choose a listed city, or include one in the address, to fill its province and commonly used postal code. For unlisted cities, enter the city and postal code manually. Codes can vary by barangay, so verify or edit the suggestion."
  );
  const paymentLabel = makeShoppingElement("label", "", "Demo payment method");
  paymentLabel.htmlFor = "demo-payment-method";
  const payment = document.createElement("select");
  payment.id = "demo-payment-method";
  payment.name = "payment";
  payment.append(
    new Option("Cash on delivery (demo)", "Cash on delivery"),
    new Option("E-wallet (demo, not charged)", "E-wallet demo")
  );
  if ([...payment.options].some((option) => option.value === deliveryProfile.payment)) {
    payment.value = deliveryProfile.payment;
  }
  const notice = makeShoppingElement("p", "demo-notice", "Your delivery details are remembered on this browser for your next checkout. Nothing is sent to a seller and no payment is processed.");
  const actions = makeShoppingElement("div", "shopping-actions");
  const back = makeShoppingElement("button", "shopping-secondary", "Back to cart");
  back.type = "button";
  back.dataset.shoppingAction = "cart";
  const submit = makeShoppingElement("button", "shopping-primary", "Place demo order");
  submit.type = "submit";
  actions.append(back, submit);
  form.append(localityNote, paymentLabel, payment, notice, actions);
  shoppingContent.append(signedIn, summary, form);
  city.addEventListener("input", () => updateLocalityFields(city.value, province, postal));
  city.addEventListener("change", () => updateLocalityFields(city.value, province, postal));
  form.querySelector("#delivery-address").addEventListener("input", (event) => {
    const address = normalizeLocality(event.currentTarget.value);
    const match = [...philippineLocalities]
      .sort((first, second) => [...second.aliases, second.city].reduce((length, name) => Math.max(length, name.length), 0) -
        [...first.aliases, first.city].reduce((length, name) => Math.max(length, name.length), 0))
      .find((locality) => [locality.city, ...locality.aliases]
        .some((name) => address.includes(normalizeLocality(name))));
    if (match) {
      city.value = match.city;
      updateLocalityFields(match.city, province, postal);
    }
  });
  form.addEventListener("input", () => {
    saveDeliveryProfile(demoUser.email, Object.fromEntries(new FormData(form)));
  });
  form.addEventListener("change", () => {
    saveDeliveryProfile(demoUser.email, Object.fromEntries(new FormData(form)));
  });
}

function normalizeLocality(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

function updateLocalityFields(value, provinceInput, postalInput) {
  const normalizedValue = normalizeLocality(value);
  const locality = philippineLocalities.find((item) =>
    [item.city, ...item.aliases].some((name) => normalizeLocality(name) === normalizedValue)
  );
  provinceInput.value = locality?.province || "";
  postalInput.value = locality?.postal || "";
  postalInput.readOnly = false;
  postalInput.placeholder = locality ? "Check your barangay's postal code" : "Enter postal code";
}

function renderOrderConfirmation(order) {
  shoppingTitle.textContent = "Order placed";
  shoppingContent.replaceChildren();
  shoppingContent.append(
    makeShoppingElement("p", "order-success-mark", "✓"),
    makeShoppingElement("h3", "order-success-title", "Your demo order is confirmed."),
    makeShoppingElement("p", "shopping-intro", `Order ${order.id} · ${formatPrice(order.total)}`),
    makeShoppingElement("p", "demo-notice", "This is a sample order for demonstration only. No seller was notified and no payment was collected.")
  );
  const close = makeShoppingElement("button", "shopping-primary", "Continue browsing");
  close.type = "button";
  close.dataset.shoppingAction = "close";
  shoppingContent.append(close);
}

function renderShoppingScreen() {
  if (activeShoppingScreen === "login") renderSignIn();
  else if (activeShoppingScreen === "checkout") renderCheckout();
  else if (activeShoppingScreen === "confirmation") renderOrderConfirmation(lastOrder);
  else if (activeShoppingScreen === "orders") renderMyOrders();
  else renderCart();
}

cartTrigger.addEventListener("click", () => openShoppingDialog("cart"));
ordersTrigger.addEventListener("click", () => {
  pendingShoppingScreen = "orders";
  openShoppingDialog(demoUser ? "orders" : "login");
});
accountTrigger.addEventListener("click", () => {
  pendingShoppingScreen = "cart";
  openShoppingDialog("login");
});
document.querySelector("#shopping-close").addEventListener("click", () => shoppingDialog.close());
shoppingDialog.addEventListener("click", (event) => {
  if (event.target === shoppingDialog) shoppingDialog.close();
});
document.querySelector("#owner-sign-out").addEventListener("click", () => {
  sessionStorage.removeItem(ownerSessionStorageKey);
  updateOwnerAccess();
  showView("home");
});

for (const grid of document.querySelectorAll(".product-grid")) {
  grid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) addToCart(Number(addButton.dataset.addToCart));
  });
}

shoppingContent.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-shopping-action], [data-cart-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.shoppingAction;
  if (action === "close") {
    shoppingDialog.close();
    return;
  }
  if (action === "checkout") {
    pendingShoppingScreen = "checkout";
    activeShoppingScreen = demoUser ? "checkout" : "login";
    renderShoppingScreen();
    return;
  }
  if (action === "login") {
    pendingShoppingScreen = "orders";
    activeShoppingScreen = "login";
    renderShoppingScreen();
    return;
  }
  if (action === "cart") {
    activeShoppingScreen = "cart";
    renderShoppingScreen();
    return;
  }
  if (action === "sign-out") {
    demoUser = null;
    localStorage.removeItem(userStorageKey);
    sessionStorage.removeItem(userStorageKey);
    updateCartCount();
    renderCart();
    return;
  }
  const productIndex = Number(actionButton.dataset.productIndex);
  const item = cart.find((cartItem) => cartItem.productIndex === productIndex);
  if (!item) return;
  if (actionButton.dataset.cartAction === "increase") {
    if (item.quantity >= inventory[productIndex]) {
      lastCartAnnouncement = `${products[productIndex].name} is at its available demo stock limit.`;
      renderCart();
      return;
    }
    item.quantity += 1;
  }
  else if (actionButton.dataset.cartAction === "decrease") {
    if (item.quantity <= 1) cart = cart.filter((cartItem) => cartItem !== item);
    else item.quantity -= 1;
  }
  saveCart();
  renderCart();
});

shoppingContent.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "demo-sign-in-form") {
    const formData = new FormData(event.target);
    const accountType = String(formData.get("accountType"));
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    const feedback = event.target.querySelector(".owner-auth-feedback");
    if (accountType === "owner") {
      if (email.toLocaleLowerCase() !== demoOwnerEmail || password !== demoOwnerPassword) {
        feedback.textContent = "That email and password do not match the demo owner account.";
        event.target.querySelector("#demo-password").value = "";
        event.target.querySelector("#demo-password").focus();
        return;
      }
      sessionStorage.setItem(ownerSessionStorageKey, "authenticated");
      updateOwnerAccess();
      shoppingDialog.close();
      showView("dashboard");
      return;
    }

    sessionStorage.removeItem(ownerSessionStorageKey);
    updateOwnerAccess();
    demoUser = { email };
    localStorage.setItem(userStorageKey, JSON.stringify(demoUser));
    sessionStorage.removeItem(legacyUserStorageKey);
    updateCartCount();
    if (document.querySelector('[data-panel="dashboard"]').hidden === false) {
      showView("home");
    }
    activeShoppingScreen = pendingShoppingScreen;
    renderShoppingScreen();
    return;
  }
  if (event.target.id !== "demo-checkout-form") return;
  if (!demoUser || cart.length === 0) {
    activeShoppingScreen = demoUser ? "cart" : "login";
    renderShoppingScreen();
    return;
  }
  const unavailableItem = cart.find((item) => item.quantity > inventory[item.productIndex]);
  if (unavailableItem) {
    const errorMessage = makeShoppingElement(
      "p",
      "shopping-error",
      `Only ${inventory[unavailableItem.productIndex]} ${products[unavailableItem.productIndex].name} available in demo stock. Update your cart before checkout.`
    );
    errorMessage.setAttribute("role", "status");
    errorMessage.setAttribute("aria-live", "polite");
    shoppingContent.prepend(errorMessage);
    return;
  }
  const formData = new FormData(event.target);
  const order = {
    id: `DGMX-${Date.now().toString(36).toUpperCase()}`,
    email: demoUser.email,
    items: cart.map((item) => ({
      name: products[item.productIndex].name,
      quantity: item.quantity,
      price: products[item.productIndex].price
    })),
    total: cartSubtotal(),
    delivery: {
      name: String(formData.get("name")).trim(),
      phone: String(formData.get("phone")).trim(),
      address: String(formData.get("address")).trim(),
      city: String(formData.get("city")).trim(),
      province: String(formData.get("province")).trim(),
      postal: String(formData.get("postal")).trim()
    },
    payment: String(formData.get("payment")),
    placedAt: new Date().toISOString()
  };
  const orders = readOrders();
  orders.push(order);
  localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
  cart.forEach((item) => {
    inventory[item.productIndex] -= item.quantity;
  });
  saveInventory();
  cart = [];
  saveCart();
  lastOrder = order;
  activeShoppingScreen = "confirmation";
  renderShoppingScreen();
});

document.querySelector("#inventory-list").addEventListener("change", (event) => {
  const input = event.target.closest('input[name="stock"]');
  if (!input) return;
  const row = input.closest("[data-inventory-index]");
  const productIndex = Number(row.dataset.inventoryIndex);
  const quantity = Number(input.value);
  if (!Number.isInteger(productIndex) || productIndex < 0 || productIndex >= inventory.length ||
      !Number.isInteger(quantity) || quantity < 0) {
    input.setCustomValidity("Enter a whole number of zero or more.");
    input.reportValidity();
    return;
  }
  input.setCustomValidity("");
  inventory[productIndex] = quantity;
  saveInventory();
  renderOwnerDashboard();
});

shoppingDialog.addEventListener("close", () => {
  activeShoppingScreen = "cart";
  pendingShoppingScreen = "checkout";
});
updateOwnerAccess();
updateCartCount();

function viewFromLocation() {
  const view = location.hash.slice(1);
  if (view === "dashboard" && !isOwnerAuthenticated()) {
    history.replaceState({ view: "home" }, "", "#home");
    return "home";
  }
  return panels.some((panel) => panel.dataset.panel === view) ? view : "home";
}

window.addEventListener("popstate", () => {
  showView(viewFromLocation(), { updateHistory: false });
});

showView(viewFromLocation(), { updateHistory: false });
