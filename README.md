# Generador de mensajes para clientes

Aplicación web adaptable e instalable para generar mensajes personalizados para clientes.

**Aplicación:** [Abrir el generador de mensajes](https://luisbusta7.github.io/generador-mensajes-clientes/)

## Descripción

Este programa permite generar mensajes listos para copiar y enviar por SMS, email o cualquier red social de mensajería.

Está pensado para una empresa del sector de ventas, facilitando la comunicación con clientes sobre pedidos, reservas y avisos.

## Funciones principales

- Generar y editar mensajes con el nombre, pedido y tienda del cliente.
- Personalizar las tiendas y las plantillas de mensajes.
- Copiar el mensaje o abrir WhatsApp con el texto preparado.
- Guardar y buscar mensajes en un historial local.
- Exportar e importar una copia de seguridad.
- Instalar la aplicación y usarla sin conexión tras la primera visita.

## Tipos de mensajes disponibles

- Pedido preparado para recoger.
- Reserva confirmada.
- Pedido pendiente de recibir.
- Producto no disponible.
- Pedido preparado.

## Tecnologías utilizadas

- HTML, CSS y JavaScript.
- Web App Manifest y service worker para la PWA.

## Ejecutar la aplicación

Desde la raíz del proyecto, inicia un servidor local:

```bash
python3 -m http.server 18765 --directory web
```

Abre <http://127.0.0.1:18765> en el mismo ordenador. Pulsa Ctrl+C en la terminal para detener el servidor. Si el puerto ya está ocupado, puedes elegir otro, teniendo en cuenta que cada dirección tiene su propio almacenamiento.

Para usarla en el móvil, abre el enlace de la aplicación en el navegador. También puedes publicar el contenido de `web/` en otro servidor HTTPS. Una dirección HTTP de la red local no es suficiente para instalarla, utilizar el portapapeles o activar el funcionamiento sin conexión en la mayoría de los navegadores.

En navegadores compatibles aparecerá el botón **Instalar aplicación**. En iPhone, utiliza Safari y selecciona **Compartir → Añadir a pantalla de inicio**. Para que funcione sin conexión, abre la aplicación al menos una vez con conexión y espera a que se complete la instalación de sus recursos; WhatsApp requiere conexión. Al actualizar la aplicación, cambia la versión de la caché en `web/sw.js` para que se descarguen los recursos nuevos.

Los datos se guardan en el almacenamiento local del navegador y no se sincronizan entre dispositivos. Pueden desaparecer al borrar los datos del navegador o desinstalar la aplicación, según el navegador. Utiliza **Exportar datos** para crear copias de seguridad y **Importar datos** para restaurarlas; importar reemplaza los datos actuales. Las copias incluyen información de clientes: guárdalas en un lugar seguro. WhatsApp recibe el teléfono y el texto cuando decides abrirlo; revisa el destinatario y el mensaje antes de enviarlo.

El almacenamiento depende de la dirección exacta: `localhost`, `127.0.0.1` y los distintos puertos tienen datos separados. Para trasladarlos, exporta una copia desde la dirección anterior e impórtala en la nueva.

Si cambian los datos en otra pestaña, la aplicación impide sobrescribirlos y pide recargar; copia antes cualquier texto que no hayas guardado. Para proteger los datos entre pestañas, el guardado requiere un navegador actualizado con Web Locks y una página servida por HTTPS o localhost.

Para abrir WhatsApp, introduce el número con `+` y el prefijo internacional, por ejemplo `+34 600 000 000`. El teléfono se borra al cambiar el nombre del cliente o cargar un mensaje del historial.

La copia automática intenta copiar el mensaje cuando terminas de editar un dato obligatorio y todos están completos. El navegador puede solicitar permisos o impedir la copia; en ese caso, usa el botón de copia o copia el texto manualmente. La vista previa se regenera al cambiar los datos del formulario y reemplaza las ediciones manuales; al guardar la configuración o las plantillas se conserva el texto editado.

Para ejecutar las pruebas de la lógica web con Node.js:

```bash
node --test tests/web.test.mjs
```

## Estructura

- `web/`: aplicación, estilos, iconos y archivos de la PWA.
- `tests/`: pruebas de la lógica web.
- `.github/workflows/`: publicación automática en GitHub Pages al actualizar `main`.
