import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path
import sys


# ============================================
# FUNCIONES DEL PROGRAMA
# ============================================

def ruta_archivo_mensajes():
    """
    Devuelve la ruta donde se guardan los mensajes generados.
    """

    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent / "mensajes_clientes.txt"

    return Path(__file__).resolve().parent / "mensajes_clientes.txt"

def generar_mensaje(nombre, pedido, tienda, tipo_mensaje):
    """
    Genera el mensaje según el tipo seleccionado.
    """

    if tipo_mensaje == "Pedido preparado para recoger":
        return f"""Hola {nombre.title()}, tu pedido nº {pedido} ya está preparado para recoger en {tienda}.

Muchas gracias por confiar en nosotros."""

    elif tipo_mensaje == "Reserva confirmada":
        return f"""Hola {nombre.title()}, te confirmamos que tu reserva nº {pedido} queda guardada en {tienda}.

Muchas gracias por confiar en nosotros."""

    elif tipo_mensaje == "Pedido pendiente de recibir":
        return f"""Hola {nombre.title()}, estamos esperando recibir uno de los artículos de tu pedido nº {pedido}.

En cuanto esté completo, te avisaremos para que puedas recogerlo. Disculpa las molestias."""

    elif tipo_mensaje == "Producto no disponible":
        return f"""Hola {nombre.title()}, sentimos informarte de que uno de los productos de tu pedido nº {pedido} no está disponible actualmente.

Puedes contactar con nosotros y te ayudaremos a buscar una alternativa similar."""


    elif tipo_mensaje == "Pedido preparado":
        return f"""Hola {nombre.title()}, tu pedido nº {pedido} ya está preparado en {tienda}.

Puedes pasar a recogerlo o contactar con nosotros para organizar la entrega. Muchas gracias."""

    else:
        return "No se ha podido generar el mensaje."


def boton_generar():
    """
    Recoge los datos de la ventana y muestra el mensaje generado.
    """

    nombre = entrada_nombre.get().strip().title()
    pedido = entrada_pedido.get().strip()
    tienda = combo_tienda.get()
    tipo_mensaje = combo_tipo.get()

    if nombre == "":
        messagebox.showwarning("Falta el nombre", "Introduce el nombre del cliente.")
        return

    if pedido == "":
        messagebox.showwarning("Falta el pedido", "Introduce el número de pedido o reserva.")
        return

    if tienda == "":
        messagebox.showwarning("Falta la tienda", "Selecciona una tienda.")
        return

    if tipo_mensaje == "":
        messagebox.showwarning("Falta el tipo de mensaje", "Selecciona el tipo de mensaje.")
        return

    mensaje = generar_mensaje(nombre, pedido, tienda, tipo_mensaje)

    caja_mensaje.delete("1.0", tk.END)
    caja_mensaje.insert(tk.END, mensaje)


def boton_copiar():
    """
    Copia el mensaje generado al portapapeles.
    """

    mensaje = caja_mensaje.get("1.0", tk.END).strip()

    if mensaje == "":
        messagebox.showwarning("Sin mensaje", "Primero genera un mensaje.")
        return

    ventana.clipboard_clear()
    ventana.clipboard_append(mensaje)
    ventana.update()

    messagebox.showinfo("Copiado", "Mensaje copiado al portapapeles.")


def boton_limpiar():
    """
    Limpia los campos de la ventana.
    """

    entrada_nombre.delete(0, tk.END)
    entrada_pedido.delete(0, tk.END)
    combo_tienda.set("")
    combo_tipo.set("")
    caja_mensaje.delete("1.0", tk.END)


def boton_guardar():
    """
    Guarda el mensaje generado en un archivo de texto.
    """

    nombre = entrada_nombre.get().strip()
    mensaje = caja_mensaje.get("1.0", tk.END).strip()

    if mensaje == "":
        messagebox.showwarning("Sin mensaje", "Primero genera un mensaje.")
        return

    ruta_mensajes = ruta_archivo_mensajes()

    with open(ruta_mensajes, "a", encoding="utf-8") as archivo:
        archivo.write("=" * 50 + "\n")
        archivo.write(f"Cliente: {nombre}\n")
        archivo.write(mensaje + "\n")
        archivo.write("=" * 50 + "\n\n")

    messagebox.showinfo("Guardado", "Mensaje guardado en mensajes_clientes.txt.")


# ============================================
# VENTANA PRINCIPAL
# ============================================

ventana = tk.Tk()
ventana.title("Generador de mensajes para clientes")
ventana.geometry("650x600")
ventana.resizable(False, False)

# ============================================
# TÍTULO
# ============================================

titulo = tk.Label(
    ventana,
    text="Generador de mensajes para clientes",
    font=("Arial", 20, "bold")
)
titulo.pack(pady=15)

subtitulo = tk.Label(
    ventana,
    text="Nombre de la empresa",
    font=("Arial", 12)
)
subtitulo.pack(pady=5)

# ============================================
# MARCO DE DATOS
# ============================================

frame_datos = tk.Frame(ventana)
frame_datos.pack(pady=15)

# Nombre cliente
label_nombre = tk.Label(frame_datos, text="Nombre del cliente:", font=("Arial", 11))
label_nombre.grid(row=0, column=0, padx=10, pady=8, sticky="e")

entrada_nombre = tk.Entry(frame_datos, width=35, font=("Arial", 11))
entrada_nombre.grid(row=0, column=1, padx=10, pady=8)

# Pedido
label_pedido = tk.Label(frame_datos, text="Nº pedido/reserva:", font=("Arial", 11))
label_pedido.grid(row=1, column=0, padx=10, pady=8, sticky="e")

entrada_pedido = tk.Entry(frame_datos, width=35, font=("Arial", 11))
entrada_pedido.grid(row=1, column=1, padx=10, pady=8)

# Tienda
label_tienda = tk.Label(frame_datos, text="Tienda:", font=("Arial", 11))
label_tienda.grid(row=2, column=0, padx=10, pady=8, sticky="e")

tiendas = [
    "Tienda 1",
    "Tienda 2",
    "Tienda 3"
]

combo_tienda = ttk.Combobox(
    frame_datos,
    values=tiendas,
    width=32,
    font=("Arial", 11),
    state="readonly"
)
combo_tienda.grid(row=2, column=1, padx=10, pady=8)

# Tipo de mensaje
label_tipo = tk.Label(frame_datos, text="Tipo de mensaje:", font=("Arial", 11))
label_tipo.grid(row=3, column=0, padx=10, pady=8, sticky="e")

tipos_mensaje = [
    "Pedido preparado para recoger",
    "Reserva confirmada",
    "Pedido pendiente de recibir",
    "Producto no disponible",
    "Pedido preparado"
]

combo_tipo = ttk.Combobox(
    frame_datos,
    values=tipos_mensaje,
    width=32,
    font=("Arial", 11),
    state="readonly"
)
combo_tipo.grid(row=3, column=1, padx=10, pady=8)

# ============================================
# BOTONES
# ============================================

frame_botones = tk.Frame(ventana)
frame_botones.pack(pady=10)

boton_generar_mensaje = tk.Button(
    frame_botones,
    text="Generar mensaje",
    command=boton_generar,
    width=18,
    font=("Arial", 11)
)
boton_generar_mensaje.grid(row=0, column=0, padx=5)

boton_copiar_mensaje = tk.Button(
    frame_botones,
    text="Copiar mensaje",
    command=boton_copiar,
    width=18,
    font=("Arial", 11)
)
boton_copiar_mensaje.grid(row=0, column=1, padx=5)

boton_guardar_mensaje = tk.Button(
    frame_botones,
    text="Guardar mensaje",
    command=boton_guardar,
    width=18,
    font=("Arial", 11)
)
boton_guardar_mensaje.grid(row=0, column=2, padx=5)

boton_limpiar_campos = tk.Button(
    ventana,
    text="Limpiar campos",
    command=boton_limpiar,
    width=18,
    font=("Arial", 11)
)
boton_limpiar_campos.pack(pady=5)

# ============================================
# CAJA DEL MENSAJE
# ============================================

label_mensaje = tk.Label(
    ventana,
    text="Mensaje generado:",
    font=("Arial", 12, "bold")
)
label_mensaje.pack(pady=10)

caja_mensaje = tk.Text(
    ventana,
    height=9,
    width=70,
    font=("Arial", 11),
    wrap="word"
)
caja_mensaje.pack(pady=5)

# ============================================
# INICIAR APLICACIÓN
# ============================================

ventana.mainloop()
