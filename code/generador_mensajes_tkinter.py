import tkinter as tk
from tkinter import messagebox
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
    tienda = tienda_var.get()
    tipo_mensaje = tipo_var.get()

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
    tienda_var.set("")
    tipo_var.set("")
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
ventana.geometry("720x620")
ventana.resizable(False, False)
ventana.configure(bg="#f2f2f2")

def crear_interfaz():
    global entrada_nombre, entrada_pedido, tienda_var, tipo_var, caja_mensaje

    contenedor = tk.Frame(ventana, bg="#f2f2f2", padx=24, pady=20)
    contenedor.pack(fill="both", expand=True)

    titulo = tk.Label(
        contenedor,
        text="Generador de mensajes para clientes",
        font=("Arial", 20, "bold"),
        bg="#f2f2f2",
        fg="#222222"
    )
    titulo.pack(pady=(0, 8))

    subtitulo = tk.Label(
        contenedor,
        text="Nombre de la empresa",
        font=("Arial", 12),
        bg="#f2f2f2",
        fg="#333333"
    )
    subtitulo.pack(pady=(0, 16))

    frame_datos = tk.LabelFrame(
        contenedor,
        text="Datos del cliente",
        bg="#f2f2f2",
        fg="#222222",
        padx=15,
        pady=12,
        font=("Arial", 11, "bold")
    )
    frame_datos.pack(fill="x", pady=(0, 16))
    frame_datos.columnconfigure(0, weight=0)
    frame_datos.columnconfigure(1, weight=1)

    label_nombre = tk.Label(frame_datos, text="Nombre del cliente:", font=("Arial", 11), bg="#f2f2f2", fg="#222222")
    label_nombre.grid(row=0, column=0, padx=(0, 12), pady=8, sticky="e")

    entrada_nombre = tk.Entry(frame_datos, width=42, font=("Arial", 11), bg="white", fg="#111111")
    entrada_nombre.grid(row=0, column=1, pady=8, sticky="ew")

    label_pedido = tk.Label(frame_datos, text="Nº pedido/reserva:", font=("Arial", 11), bg="#f2f2f2", fg="#222222")
    label_pedido.grid(row=1, column=0, padx=(0, 12), pady=8, sticky="e")

    entrada_pedido = tk.Entry(frame_datos, width=42, font=("Arial", 11), bg="white", fg="#111111")
    entrada_pedido.grid(row=1, column=1, pady=8, sticky="ew")

    label_tienda = tk.Label(frame_datos, text="Tienda:", font=("Arial", 11), bg="#f2f2f2", fg="#222222")
    label_tienda.grid(row=2, column=0, padx=(0, 12), pady=8, sticky="e")

    tiendas = ["Tienda 1", "Tienda 2", "Tienda 3"]
    tienda_var = tk.StringVar(value="")
    menu_tienda = tk.OptionMenu(frame_datos, tienda_var, *tiendas)
    menu_tienda.config(width=38, font=("Arial", 11), bg="white", fg="#111111", anchor="w")
    menu_tienda.grid(row=2, column=1, pady=8, sticky="ew")

    label_tipo = tk.Label(frame_datos, text="Tipo de mensaje:", font=("Arial", 11), bg="#f2f2f2", fg="#222222")
    label_tipo.grid(row=3, column=0, padx=(0, 12), pady=8, sticky="e")

    tipos_mensaje = [
        "Pedido preparado para recoger",
        "Reserva confirmada",
        "Pedido pendiente de recibir",
        "Producto no disponible",
        "Pedido preparado"
    ]
    tipo_var = tk.StringVar(value="")
    menu_tipo = tk.OptionMenu(frame_datos, tipo_var, *tipos_mensaje)
    menu_tipo.config(width=38, font=("Arial", 11), bg="white", fg="#111111", anchor="w")
    menu_tipo.grid(row=3, column=1, pady=8, sticky="ew")

    frame_botones = tk.Frame(contenedor, bg="#f2f2f2")
    frame_botones.pack(pady=(0, 14))

    boton_generar_mensaje = tk.Button(frame_botones, text="Generar mensaje", command=boton_generar, width=16, font=("Arial", 11))
    boton_generar_mensaje.grid(row=0, column=0, padx=5)

    boton_copiar_mensaje = tk.Button(frame_botones, text="Copiar mensaje", command=boton_copiar, width=16, font=("Arial", 11))
    boton_copiar_mensaje.grid(row=0, column=1, padx=5)

    boton_guardar_mensaje = tk.Button(frame_botones, text="Guardar mensaje", command=boton_guardar, width=16, font=("Arial", 11))
    boton_guardar_mensaje.grid(row=0, column=2, padx=5)

    boton_limpiar_campos = tk.Button(frame_botones, text="Limpiar campos", command=boton_limpiar, width=16, font=("Arial", 11))
    boton_limpiar_campos.grid(row=0, column=3, padx=5)

    label_mensaje = tk.Label(contenedor, text="Mensaje generado:", font=("Arial", 12, "bold"), bg="#f2f2f2", fg="#222222")
    label_mensaje.pack(anchor="w", pady=(0, 8))

    caja_mensaje = tk.Text(contenedor, height=9, width=76, font=("Arial", 11), wrap="word", bg="white", fg="#111111")
    caja_mensaje.pack(fill="x")

    ventana.update_idletasks()

# ============================================
# INICIAR APLICACIÓN
# ============================================

ventana.after(100, crear_interfaz)
ventana.mainloop()
