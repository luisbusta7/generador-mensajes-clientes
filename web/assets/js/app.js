import { validState, formatName, renderTemplate, persistState } from "./core.mjs";

const STORAGE_KEY = "generador-mensajes-v1";
const $ = (id) => document.getElementById(id);
const defaults = {
  version: 1,
  company: "Cash Bustamante",
  stores: ["Tienda 1", "Tienda 2", "Tienda 3"],
  templates: [
    { id: "recoger", name: "Pedido preparado para recoger", text: "Hola {nombre}, tu pedido nº {pedido} ya está preparado para recoger en {tienda}.\n\nMuchas gracias por confiar en nosotros." },
    { id: "reserva", name: "Reserva confirmada", text: "Hola {nombre}, te confirmamos que tu reserva nº {pedido} queda guardada en {tienda}.\n\nMuchas gracias por confiar en nosotros." },
    { id: "pendiente", name: "Pedido pendiente de recibir", text: "Hola {nombre}, estamos esperando recibir uno de los artículos de tu pedido nº {pedido}.\n\nEn cuanto esté completo, te avisaremos para que puedas recogerlo. Disculpa las molestias." },
    { id: "agotado", name: "Producto no disponible", text: "Hola {nombre}, sentimos informarte de que uno de los productos de tu pedido nº {pedido} no está disponible actualmente.\n\nPuedes contactar con nosotros y te ayudaremos a buscar una alternativa similar." },
    { id: "preparado", name: "Pedido preparado", text: "Hola {nombre}, tu pedido nº {pedido} ya está preparado en {tienda}.\n\nPuedes pasar a recogerlo o contactar con nosotros para organizar la entrega. Muchas gracias." }
  ],
  history: [],
  autoCopy: false
};

let state;
let storageBlocked = false;
let storedSnapshot;
let generatedPreview = "";
let installPrompt = null;

function notify(message, error = false) {
  const status = $("status");
  status.textContent = message;
  status.classList.toggle("error", error);
  status.hidden = false;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    storedSnapshot = saved;
    if (saved === null) return structuredClone(defaults);
    const parsed = JSON.parse(saved);
    if (!validState(parsed)) throw new Error("El formato de los datos guardados no es válido.");
    return parsed;
  } catch (error) {
    storageBlocked = true;
    notify(`No se han podido leer los datos locales: ${error.message} No se sobrescribirán; importa una copia válida para recuperarlos.`, true);
    return structuredClone(defaults);
  }
}

async function saveState(next, restoring = false) {
  if (storageBlocked && !restoring) {
    notify("No se pueden guardar cambios: los datos locales no se pudieron leer. Importa una copia válida para recuperarlos.", true);
    return false;
  }
  try {
    const expected = storedSnapshot;
    storedSnapshot = await persistState(localStorage, navigator.locks, STORAGE_KEY, expected, next);
    state = next;
    storageBlocked = false;
    return true;
  } catch (error) {
    notify(`No se han podido guardar los datos en este navegador: ${error.message}`, true);
    return false;
  }
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function fillSelect(select, options, selected, placeholder) {
  select.replaceChildren();
  if (placeholder) select.add(new Option(placeholder, ""));
  for (const [value, label] of options) select.add(new Option(label, value));
  select.value = options.some(([value]) => value === selected) ? selected : "";
}

function renderSelectors() {
  fillSelect($("store"), state.stores.map((store) => [store, store]), $("store").value, "Selecciona una tienda");
  fillSelect($("template"), state.templates.map((item) => [item.id, item.name]), $("template").value, "Selecciona un tipo de mensaje");
  fillSelect($("template-editor"), state.templates.map((item) => [item.id, item.name]), $("template-editor").value || state.templates[0].id, "Nueva plantilla");
}

function renderSettings() {
  $("company").value = state.company;
  $("stores-editor").value = state.stores.join("\n");
  $("auto-copy").checked = state.autoCopy;
}

function renderTemplateEditor() {
  const selected = state.templates.find((item) => item.id === $("template-editor").value);
  $("template-name").value = selected ? selected.name : "";
  $("template-text").value = selected ? selected.text : "";
  $("delete-template").hidden = !selected;
}

function updateCount() {
  const count = Array.from($("message").value).length;
  $("character-count").textContent = `${count} ${count === 1 ? "carácter" : "caracteres"}`;
}

function updatePreview() {
  const customer = $("customer").value.trim();
  const order = $("order").value.trim();
  const store = $("store").value;
  const template = state.templates.find((item) => item.id === $("template").value);
  const complete = Boolean(customer && order && store && template);
  if (complete) {
    const values = { nombre: formatName(customer), pedido: order, tienda: store, empresa: state.company };
    $("message").value = renderTemplate(template.text, values);
  } else {
    $("message").value = "";
  }
  generatedPreview = $("message").value;
  updateCount();
}

function updatePreviewIfUnedited() {
  if ($("message").value === generatedPreview) updatePreview();
}

async function copyMessage(automatic = false) {
  const message = $("message").value.trim();
  if (!message) {
    notify("Primero completa los datos o escribe un mensaje.", true);
    return;
  }
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("El portapapeles no está disponible; usa HTTPS o localhost.");
    }
    await navigator.clipboard.writeText(message);
    notify(automatic ? "Mensaje copiado automáticamente." : "Mensaje copiado al portapapeles.");
  } catch (error) {
    notify(`No se ha podido copiar el mensaje: ${error.message} Puedes seleccionarlo y copiarlo manualmente.`, true);
  }
}

function renderHistory() {
  const container = $("history");
  const query = $("history-search").value.trim().toLocaleLowerCase("es");
  const matches = state.history.filter((item) =>
    `${item.customer} ${item.order} ${item.message}`.toLocaleLowerCase("es").includes(query));
  container.replaceChildren();
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = query ? "No hay resultados para esta búsqueda." : "Todavía no hay mensajes guardados.";
    container.append(empty);
    return;
  }
  for (const item of matches) {
    const article = document.createElement("article");
    article.className = "history-item";
    const heading = document.createElement("h3");
    heading.textContent = `${item.customer} · Pedido ${item.order}`;
    const date = document.createElement("time");
    date.dateTime = item.date;
    date.textContent = new Date(item.date).toLocaleString("es-ES");
    const text = document.createElement("p");
    text.textContent = item.message;
    const actions = document.createElement("div");
    actions.className = "inline-actions";
    const use = document.createElement("button");
    use.type = "button";
    use.className = "text-button";
    use.textContent = "Usar mensaje";
    use.addEventListener("click", () => {
      $("customer").value = item.customer;
      $("order").value = item.order;
      $("phone").value = "";
      $("store").value = state.stores.includes(item.store) ? item.store : "";
      $("template").value = state.templates.some((template) => template.id === item.templateId)
        ? item.templateId : "";
      $("message").value = item.message;
      generatedPreview = "";
      updateCount();
      $("message").focus();
      notify($("store").value && $("template").value
        ? "Mensaje cargado con su tienda y tipo de mensaje. Introduce el teléfono del cliente antes de usar WhatsApp."
        : "Mensaje cargado. Selecciona la tienda y el tipo de mensaje antes de cambiar los datos para regenerarlo. Introduce el teléfono antes de usar WhatsApp.");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "text-button danger";
    remove.textContent = "Eliminar";
    remove.addEventListener("click", async () => {
      if (!confirm("¿Eliminar este mensaje del historial?")) return;
      const next = structuredClone(state);
      next.history = next.history.filter((entry) => entry.id !== item.id);
      if (await saveState(next)) {
        renderHistory();
        notify("Mensaje eliminado del historial.");
      }
    });
    actions.append(use, remove);
    article.append(heading, date, text, actions);
    container.append(article);
  }
}

function renderAll() {
  renderSelectors();
  renderSettings();
  renderTemplateEditor();
  renderHistory();
  updatePreviewIfUnedited();
}

state = loadState();
renderAll();

$("message-form").addEventListener("input", (event) => {
  if (event.target.id === "customer" && $("phone").value) {
    $("phone").value = "";
    notify("El teléfono se ha borrado al cambiar de cliente.");
  }
  if (["customer", "order", "store", "template"].includes(event.target.id)) updatePreview();
});
$("message-form").addEventListener("change", (event) => {
  if (["customer", "order", "store", "template"].includes(event.target.id) &&
      state.autoCopy && $("message").value.trim()) copyMessage(true);
});
$("message-form").addEventListener("submit", (event) => event.preventDefault());
$("message-form").addEventListener("reset", () => {
  setTimeout(() => {
    $("store").value = "";
    $("template").value = "";
    updatePreview();
  }, 0);
});
$("message").addEventListener("input", updateCount);
$("copy").addEventListener("click", () => copyMessage());
$("whatsapp").addEventListener("click", () => {
  const message = $("message").value.trim();
  if (!message) {
    notify("Primero completa los datos o escribe un mensaje.", true);
    return;
  }
  const phone = $("phone").value.trim();
  const digits = phone.replace(/[\s()+.-]/g, "");
  if (!/^\+[\d\s().-]+$/.test(phone) || !/^\d{8,15}$/.test(digits)) {
    notify("Introduce un teléfono válido con prefijo internacional, por ejemplo +34 600 000 000.", true);
    $("phone").focus();
    return;
  }
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
  notify("Comprueba el destinatario y el mensaje en WhatsApp antes de enviarlo.");
});

$("save-message").addEventListener("click", async () => {
  if (!$("message-form").reportValidity()) return;
  for (const [id, label] of [["customer", "nombre del cliente"], ["order", "número de pedido o reserva"]]) {
    if (!$(id).value.trim()) {
      notify(`Introduce un ${label} que no contenga solo espacios.`, true);
      $(id).focus();
      return;
    }
  }
  const message = $("message").value.trim();
  if (!message) {
    notify("No hay ningún mensaje que guardar.", true);
    return;
  }
  const next = structuredClone(state);
  next.history.unshift({
    id: newId(), customer: $("customer").value.trim(), order: $("order").value.trim(),
    store: $("store").value, templateId: $("template").value,
    message, date: new Date().toISOString()
  });
  if (await saveState(next)) {
    renderHistory();
    notify("Mensaje guardado en el historial de este dispositivo.");
  }
});
$("history-search").addEventListener("input", renderHistory);

$("auto-copy").addEventListener("change", async (event) => {
  const next = structuredClone(state);
  next.autoCopy = event.target.checked;
  if (!await saveState(next)) event.target.checked = state.autoCopy;
  else notify(next.autoCopy ? "Copia automática activada al terminar de editar los datos." : "Copia automática desactivada.");
});

$("settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const stores = $("stores-editor").value.split(/\r?\n/).map((store) => store.trim()).filter(Boolean);
  if (!stores.length || new Set(stores).size !== stores.length) {
    notify("Introduce al menos una tienda y evita nombres repetidos.", true);
    return;
  }
  const next = structuredClone(state);
  next.company = $("company").value.trim();
  next.stores = stores;
  if (await saveState(next)) {
    renderSelectors();
    updatePreviewIfUnedited();
    notify("Datos de empresa guardados.");
  }
});

$("template-editor").addEventListener("change", renderTemplateEditor);
$("new-template").addEventListener("click", () => {
  $("template-editor").value = "";
  renderTemplateEditor();
  $("template-name").focus();
});
$("template-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("template-name").value.trim();
  const text = $("template-text").value.trim();
  if (!name || !text) {
    notify("El nombre y el texto de la plantilla no pueden estar vacíos.", true);
    return;
  }
  const invalid = [...text.matchAll(/\{([^{}]+)\}/g)].find((match) =>
    !["nombre", "pedido", "tienda", "empresa"].includes(match[1]));
  if (invalid) {
    notify(`La variable ${invalid[0]} no es válida. Usa {nombre}, {pedido}, {tienda} o {empresa}.`, true);
    return;
  }
  const next = structuredClone(state);
  const id = $("template-editor").value || newId();
  const index = next.templates.findIndex((item) => item.id === id);
  if (index < 0) next.templates.push({ id, name, text });
  else next.templates[index] = { id, name, text };
  if (await saveState(next)) {
    renderSelectors();
    $("template-editor").value = id;
    renderTemplateEditor();
    updatePreviewIfUnedited();
    notify("Plantilla guardada.");
  }
});
$("delete-template").addEventListener("click", async () => {
  if (state.templates.length === 1) {
    notify("Debe quedar al menos una plantilla.", true);
    return;
  }
  if (!confirm("¿Eliminar esta plantilla?")) return;
  const next = structuredClone(state);
  next.templates = next.templates.filter((item) => item.id !== $("template-editor").value);
  if (await saveState(next)) {
    renderSelectors();
    $("template-editor").value = state.templates[0].id;
    renderTemplateEditor();
    updatePreviewIfUnedited();
    notify("Plantilla eliminada.");
  }
});

$("export").addEventListener("click", () => {
  if (storageBlocked) {
    notify("No se pueden exportar los datos porque no se han podido leer. Recupera una copia válida primero.", true);
    return;
  }
  try {
    if (localStorage.getItem(STORAGE_KEY) !== storedSnapshot) {
      notify("Los datos cambiaron en otra pestaña. Recarga la página antes de exportar una copia.", true);
      return;
    }
  } catch (error) {
    notify(`No se han podido leer los datos para exportar: ${error.message}`, true);
    return;
  }
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mensajes-copia-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Copia exportada. Recuerda que contiene datos de clientes.");
});
$("import").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!validState(imported)) throw new Error("El archivo no contiene una copia de seguridad válida.");
    if (!confirm("La importación reemplazará la configuración, las plantillas y el historial de este navegador. ¿Continuar?")) return;
    if (await saveState(imported, true)) {
      renderAll();
      notify("Copia de seguridad importada.");
    }
  } catch (error) {
    notify(`No se ha podido importar la copia: ${error.message}`, true);
  } finally {
    event.target.value = "";
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  $("install").hidden = false;
});
$("install").addEventListener("click", async () => {
  if (!installPrompt) return;
  try {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $("install").hidden = true;
  } catch (error) {
    notify(`No se ha podido abrir la instalación: ${error.message}`, true);
  }
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  $("install").hidden = true;
});
if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./sw.js").catch((error) =>
    notify(`No se ha podido activar el uso sin conexión: ${error.message}`, true));
}
