# Generador de mensajes para clientes

Aplicación sencilla de escritorio creada con Python y Tkinter para generar mensajes personalizados para clientes de una empresa.

## Descripción

Este programa permite generar mensajes listos para copiar y enviar por SMS, email o cualquier red social de mensajería.

Está pensado para una empresa del sector de ventas, facilitando la comunicación con clientes sobre pedidos, reservas y avisos.

En mi caso particular, administro una empresa de venta de juguetes y regalos, y uso la aplicación a diario en mis tiendas para optimizar la comuniacion con los clientes que compran online.

## Funciones principales

- Generar mensajes personalizados con el nombre del cliente.
- Añadir número de pedido o reserva.
- Seleccionar tienda.
- Seleccionar tipo de mensaje.
- Copiar el mensaje al portapapeles.
- Guardar mensajes en un archivo de texto.

## Tipos de mensajes disponibles

- Pedido preparado para recoger.
- Reserva confirmada.
- Pedido pendiente de recibir.
- Producto no disponible.
- Pedido preparado.

## Tecnologías utilizadas

- Python
- Tkinter

## Cómo ejecutar el proyecto

Clona el repositorio o descarga los archivos.

Después ejecuta:

```bash
python3 code/generador_mensajes_tkinter.py
```

## Cómo crear el ejecutable

Instala las dependencias:

```bash
python3 -m pip install -r requirements.txt
```

Genera el ejecutable:

```bash
python3 -m PyInstaller --windowed --name GeneradorMensajes code/generador_mensajes_tkinter.py
```

El resultado se creará en la carpeta `dist/`.

## Notas

Los mensajes guardados se escriben en `mensajes_clientes.txt`, junto al script cuando se ejecuta con Python y junto al ejecutable cuando se usa la versión empaquetada.
