import test from "node:test";
import assert from "node:assert/strict";
import { formatName, persistState, renderTemplate, validState } from "../web/core.mjs";

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
