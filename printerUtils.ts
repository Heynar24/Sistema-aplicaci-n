// @ts-ignore
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { NativeModules } from 'react-native';
import { getNextPedido } from './utils/pedidoCounter'; // ajusta la ruta según tu proyecto

const { BluetoothEscposPrinter: PrinterModule } = NativeModules;

/* =======================
   UTILIDADES
======================= */

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Normaliza texto (POS no soporta ñ ni tildes)
function normalizarTexto(texto: string): string {
  return texto
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u');
}

// Fecha legible
function formatearFecha(fechaISO: string): string {
  const d = new Date(fechaISO);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min}`;
}

/* =======================
   TIPOS
======================= */

interface ProductoVenta {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Venta {
  id?: number;
  cliente: string;
  modalidad: string;
  productos: ProductoVenta[];
  total: number;
  fecha: string;
}

/* =======================
   IMPRESIÓN
======================= */

// Función auxiliar para imprimir una copia del ticket
async function imprimirCopiaTicket(venta: Venta, pedidoNum: number, tipoCopia: string, esParaCocina: boolean = false): Promise<void> {
  console.log(`🔍 Imprimiendo copia: ${tipoCopia}, esParaCocina: ${esParaCocina}`); // Log para verificar

  // -------- RESET --------
  await PrinterModule.printBytes([0x1B, 0x40]);

  // Mensaje de tipo de copia (opcional, para diferenciar)
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // centrar
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]); // negrita ON
  await BluetoothEscposPrinter.printText(
    `${tipoCopia}\n\n`, // Ej. "Copia para cliente" o "Copia para cocina"
    {}
  );
  await PrinterModule.printBytes([0x1B, 0x45, 0x00]); // negrita OFF

  // ======================
  // TITULO (GRANDE: DOBLE ANCHO Y ALTO, CENTRADO)
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // centrar
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]); // negrita ON

  await BluetoothEscposPrinter.printText(
    normalizarTexto("POLLOS EL SABROSITO\n"),
    {
      widthtimes: 1,   // ancho x2
      heigthtimes: 1,  // alto x2
      fonttype: 0
    }
  );

  // -------- PEDIDO (MISMO TAMAÑO GRANDE) --------
  await BluetoothEscposPrinter.printText(
    `PEDIDO N#${pedidoNum}\n`,
    {
      widthtimes: 1,   // ancho x2
      heigthtimes: 1,  // alto x2
      fonttype: 0
    }
  );

  // ======================
  // SUBTITULO (NORMAL, CENTRADO)
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // centrar
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]); // tamaño normal
  await PrinterModule.printBytes([0x1B, 0x45, 0x00]); // negrita OFF

  await BluetoothEscposPrinter.printText(
    "Telf. 64432226\n",
    {}
  );
  await BluetoothEscposPrinter.printText(
    normalizarTexto("Doble via La Guardia, Km20\n\n"),
    {}
  );

  // ======================
  // CUERPO (IZQUIERDA, CON TEXTO AGRANDADO PARA CLIENTE, MODALIDAD Y PAGO)
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x00]); // izquierda

  await BluetoothEscposPrinter.printText(
    "------------------------------\n",
    {}
  );

  // Cliente agrandado
  await PrinterModule.printBytes([0x1D, 0x21, 0x11]); // doble ancho y alto
  await BluetoothEscposPrinter.printText(
    `Cliente: ${normalizarTexto(venta.cliente)}\n`,
    {}
  );
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]); // reset a normal

  // Modalidad agrandada
  await PrinterModule.printBytes([0x1D, 0x21, 0x11]); // doble ancho y alto
  await BluetoothEscposPrinter.printText(
    `Modalidad: ${venta.modalidad}\n`,
    {}
  );
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]); // reset a normal

  await BluetoothEscposPrinter.printText(
    "------------------------------\n",
    {}
  );

  // ======================
  // PRODUCTOS (TAMAÑO CONDICIONAL: TRIPLE PARA COCINA, DOBLE PARA CLIENTE)
  // ======================
  if (esParaCocina) {
    console.log("🔍 Aplicando tamaño triple para cocina"); // Log para verificar
    await PrinterModule.printBytes([0x1D, 0x21, 0x22]); // triple ancho y alto para cocina
  } else {
    console.log("🔍 Aplicando tamaño doble para cliente"); // Log para verificar
    await PrinterModule.printBytes([0x1D, 0x21, 0x11]); // doble ancho y alto para cliente
  }

  for (const p of venta.productos) {
    await BluetoothEscposPrinter.printText(
      `${normalizarTexto(p.nombre)} x${p.cantidad}  Bs ${p.precio * p.cantidad}\n`,
      {}
    );
  }

  // ======================
  // TOTAL (NORMAL, NEGRITA)
  // ======================
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]); // normal
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]); // negrita

  await BluetoothEscposPrinter.printText(
    "------------------------------\n",
    {}
  );
  await BluetoothEscposPrinter.printText(
    `TOTAL: Bs ${venta.total}\n`,
    {}
  );

  await PrinterModule.printBytes([0x1B, 0x45, 0x00]); // negrita OFF

  // ======================
  // FECHA (NORMAL)
  // ======================
  await BluetoothEscposPrinter.printText(
    `Fecha: ${formatearFecha(venta.fecha)}\n`,
    {}
  );

  // ======================
  // CORTE (COMPLETO)
  // ======================
  await BluetoothEscposPrinter.printText("\n\n", {});
  await sleep(400);
  await PrinterModule.printBytes([0x1D, 0x56, 0x42, 0x00]);  //eliminar el 0x42
}

export async function imprimirVenta(venta: Venta): Promise<void> {
  try {
    console.log("🔍 Iniciando impresión de venta"); // Log para verificar
    // Generar ID una vez para ambas copias
    const pedidoNum = await getNextPedido();
    console.log(`🔍 ID de pedido generado: ${pedidoNum}`); // Log para verificar

    // Imprimir primera copia (para cliente, tamaño normal)
    await imprimirCopiaTicket(venta, pedidoNum, "Copia para cliente", false);

    // Pausa entre copias para evitar solapamiento
    await sleep(500);

    // Imprimir segunda copia (para cocina, tamaño grande)
    await imprimirCopiaTicket(venta, pedidoNum, "Copia para cocina", true);

    console.log("🔍 Impresión completada"); // Log para verificar
  } catch (e) {
    console.log("🛑 Error imprimiendo:", e);
  }
}