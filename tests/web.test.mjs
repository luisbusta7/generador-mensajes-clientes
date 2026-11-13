import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { formatName, persistState, renderTemplate, validState } from "../web/assets/js/core.mjs";

function backup() {
  return {
    version: 1,
    company: "Mi tienda",
    stores: ["Centro"],
    templates: [{ id: "1", name: "Pedido", text: "Hola {nombre}" }],
    history: [{ id: "2", customer: "Ana", order: "123", message: "Hola Ana", date: "2026-01-01T10:00:00.000Z" }],
    autoCopy: false
  };
}

test("sustituye variables y conserva el texto introducido literalmente", () => {
  const text = renderTemplate("Hola {nombre}: {pedido}, {tienda}, {empresa}. {nombre}", {
    nombre: formatName("  mARÍA DEL mAR  "),
    pedido: "$& 123",
    tienda: "Centro",
    empresa: "Mi tienda"
  });
  assert.equal(text, "Hola María Del Mar: $& 123, Centro, Mi tienda. María Del Mar");
});

test("acepta una copia completa y rechaza datos inválidos", () => {
  assert.equal(validState(backup()), true);
  for (const change of [
    { version: 2 },
    { stores: [] },
    { stores: ["Centro", "Centro"] },
    { templates: [] },
    { templates: [{ id: "1", name: "Pedido", text: "Hola" }, { id: "1", name: "Otro", text: "Hola" }] },
    { history: [{ id: "2", customer: "Ana", order: "123", message: "Hola", date: "inválida" }] },
    { autoCopy: "sí" }
  ]) {
    assert.equal(validState({ ...backup(), ...change }), false);
  }
});

test("evita que dos pestañas sobrescriban cambios basados en la misma versión", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  let queue = Promise.resolve();
  const locks = {
    request: (_key, callback) => {
      const result = queue.then(callback);
      queue = result.catch(() => {});
      return result;
    }
  };
  const first = { history: ["Ana"] };
  const second = { history: ["Luis"] };
  const results = await Promise.allSettled([
    persistState(storage, locks, "datos", null, first),
    persistState(storage, locks, "datos", null, second)
  ]);
  assert.equal(results[0].status, "fulfilled");
  assert.equal(results[1].status, "rejected");
  assert.match(results[1].reason.message, /otra pestaña/);
  assert.deepEqual(JSON.parse(values.get("datos")), first);

  const current = values.get("datos");
  await persistState(storage, locks, "datos", current, { history: ["Ana", "Luis"] });
  assert.deepEqual(JSON.parse(values.get("datos")).history, ["Ana", "Luis"]);
});

test("rechaza el guardado si no se pueden proteger los datos entre pestañas", async () => {
  await assert.rejects(
    persistState({}, undefined, "datos", null, {}),
    /no permite guardar de forma segura/
  );
});

test("recupera la tienda y plantilla del historial sin reutilizar selecciones ajenas", async () => {
  class Element {
    constructor() {
      this.value = "";
      this.children = [];
      this.handlers = {};
      this.classList = { toggle() {} };
    }
    add() {}
    replaceChildren() { this.children = []; }
    append(...children) { this.children.push(...children); }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    focus() {}
    reportValidity() { return true; }
    fire(type, target = this) { return this.handlers[type]({ target, preventDefault() {} }); }
  }
  const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
  const elements = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)]
    .map((match) => [match[1], Object.assign(new Element(), { id: match[1] })]));
  const saved = backup();
  saved.templates[0].text = "Hola {nombre}, pedido {pedido}";
  saved.templates.push({ id: "otro", name: "Agotado", text: "Producto agotado {pedido}" });
  saved.history[0].store = "Centro";
  saved.history[0].templateId = "1";
  saved.history.push({ ...saved.history[0], id: "antiguo", store: undefined, templateId: undefined });
  saved.history.push({ ...saved.history[0], id: "eliminado", store: "Tienda eliminada", templateId: "eliminada" });
  let stored = JSON.stringify(saved);
  const context = vm.createContext({
    formatName, persistState, renderTemplate, validState, structuredClone,
    document: { getElementById: (id) => elements[id], createElement: () => new Element() },
    Option: class {},
    localStorage: { getItem: () => stored, setItem: (_key, value) => { stored = value; } },
    navigator: { locks: { request: async (_key, callback) => callback() } },
    window: { addEventListener() {} }
  });
  const app = readFileSync(new URL("../web/assets/js/app.js", import.meta.url), "utf8");
  vm.runInContext(app.replace(/^import .*;\n/, ""), context);
  const useHistory = (index) => elements.history.children[index].children[3].children[0].fire("click");

  elements.template.value = "otro";
  elements.phone.value = "+34 600 000 000";
  useHistory(0);
  assert.equal(elements.store.value, "Centro");
  assert.equal(elements.template.value, "1");
  assert.equal(elements.phone.value, "");
  assert.equal(elements.message.value, "Hola Ana");
  elements.order.value = "124";
  elements["message-form"].fire("input", elements.order);
  assert.equal(elements.message.value, "Hola Ana, pedido 124");
  await elements["save-message"].fire("click");
  assert.equal(JSON.parse(stored).history[0].store, "Centro");
  assert.equal(JSON.parse(stored).history[0].templateId, "1");

  for (const index of [2, 3]) {
    elements.store.value = "Centro";
    elements.template.value = "otro";
    useHistory(index);
    assert.equal(elements.store.value, "");
    assert.equal(elements.template.value, "");
    assert.equal(elements.message.value, "Hola Ana");
    assert.match(elements.status.textContent, /Selecciona la tienda/);
  }
});

test("acepta historiales antiguos y valida los nuevos campos opcionales", () => {
  const data = backup();
  assert.equal(validState(data), true);
  Object.assign(data.history[0], { store: "Centro", templateId: "1" });
  assert.equal(validState(data), true);
  data.history[0].store = 123;
  assert.equal(validState(data), false);
  data.history[0].store = "Centro";
  data.history[0].templateId = {};
  assert.equal(validState(data), false);
});
