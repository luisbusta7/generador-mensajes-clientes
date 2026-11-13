export function validState(data) {
  const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
  if (!data || typeof data !== "object" || data.version !== 1 ||
      typeof data.company !== "string" || typeof data.autoCopy !== "boolean" ||
      !Array.isArray(data.stores) || !data.stores.length ||
      !data.stores.every(nonempty) || new Set(data.stores).size !== data.stores.length ||
      !Array.isArray(data.templates) || !data.templates.length ||
      !data.templates.every((item) => item && nonempty(item.id) && nonempty(item.name) && nonempty(item.text)) ||
      new Set(data.templates.map((item) => item.id)).size !== data.templates.length ||
      !Array.isArray(data.history)) return false;
  return new Set(data.history.map((item) => item && item.id)).size === data.history.length &&
    data.history.every((item) => item && nonempty(item.id) &&
      typeof item.customer === "string" && typeof item.order === "string" &&
      (item.store === undefined || typeof item.store === "string") &&
      (item.templateId === undefined || typeof item.templateId === "string") &&
      nonempty(item.message) && nonempty(item.date) && !Number.isNaN(Date.parse(item.date)));
}

export function formatName(name) {
  return name.trim().toLocaleLowerCase("es").replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("es"));
}

export function renderTemplate(text, values) {
  return text.replace(/\{(nombre|pedido|tienda|empresa)\}/g, (_, key) => values[key]);
}

export async function persistState(storage, locks, key, expected, next) {
  if (!locks) {
    throw new Error("Este navegador no permite guardar de forma segura entre pestañas. Usa un navegador actualizado en HTTPS o localhost.");
  }
  const serialized = JSON.stringify(next);
  return locks.request(key, () => {
    if (storage.getItem(key) !== expected) {
      throw new Error("Los datos cambiaron en otra pestaña. Copia cualquier texto sin guardar y recarga la página antes de volver a intentarlo.");
    }
    storage.setItem(key, serialized);
    return serialized;
  });
}
