
// @ts-ignore
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { NativeModules } from 'react-native';
import { getNextPedido } from './utils/pedidoCounter'; // Ajusta la ruta según tu proyecto

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
  id?: number;
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
// Se conserva el formato original del ticket.
async function imprimirCopiaTicket(
  venta: Venta,
  pedidoNum: number,
  tipoCopia: string,
  esParaCocina: boolean = false
): Promise<void> {
  console.log(
    `🔍 Imprimiendo copia: ${tipoCopia}, esParaCocina: ${esParaCocina}`
  );

  // -------- RESET --------
  await PrinterModule.printBytes([0x1B, 0x40]);

  // Mensaje de tipo de copia
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // Centrar
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]); // Negrita ON

  await BluetoothEscposPrinter.printText(
    `${tipoCopia}\n\n`,
    {}
  );

  await PrinterModule.printBytes([0x1B, 0x45, 0x00]); // Negrita OFF

  // ======================
  // TITULO
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // Centrar
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]); // Negrita ON

  await BluetoothEscposPrinter.printText(
    normalizarTexto('POLLOS EL SABROSITO\n'),
    {
      widthtimes: 1,
      heigthtimes: 1,
      fonttype: 0
    }
  );

  // -------- PEDIDO --------
  await BluetoothEscposPrinter.printText(
    `PEDIDO N#${pedidoNum}\n`,
    {
      widthtimes: 1,
      heigthtimes: 1,
      fonttype: 0
    }
  );

  // ======================
  // SUBTITULO
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x01]); // Centrar
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]); // Tamaño normal
  await PrinterModule.printBytes([0x1B, 0x45, 0x00]); // Negrita OFF

  await BluetoothEscposPrinter.printText(
    'Telf. 64432226\n',
    {}
  );

  await BluetoothEscposPrinter.printText(
    normalizarTexto('Doble via La Guardia, Km20\n\n'),
    {}
  );

  // ======================
  // CUERPO
  // ======================
  await PrinterModule.printBytes([0x1B, 0x61, 0x00]); // Izquierda

  await BluetoothEscposPrinter.printText(
    '------------------------------\n',
    {}
  );

  // Cliente agrandado
  await PrinterModule.printBytes([0x1D, 0x21, 0x11]);

  await BluetoothEscposPrinter.printText(
    `Cliente: ${normalizarTexto(venta.cliente)}\n`,
    {}
  );

  await PrinterModule.printBytes([0x1D, 0x21, 0x00]);

  // Modalidad agrandada
  await PrinterModule.printBytes([0x1D, 0x21, 0x11]);

  await BluetoothEscposPrinter.printText(
    `Modalidad: ${venta.modalidad}\n`,
    {}
  );

  await PrinterModule.printBytes([0x1D, 0x21, 0x00]);

  await BluetoothEscposPrinter.printText(
    '------------------------------\n',
    {}
  );

  // ======================
  // PRODUCTOS
  // ======================
  if (esParaCocina) {
    console.log('🔍 Aplicando tamaño triple para cocina');

    await PrinterModule.printBytes([0x1D, 0x21, 0x22]);
  } else {
    console.log('🔍 Aplicando tamaño doble para cliente');

    await PrinterModule.printBytes([0x1D, 0x21, 0x11]);
  }

  for (const p of venta.productos) {
    await BluetoothEscposPrinter.printText(
      `${normalizarTexto(p.nombre)} x${p.cantidad}  Bs ${p.precio * p.cantidad}\n`,
      {}
    );
  }

  // ======================
  // TOTAL
  // ======================
  await PrinterModule.printBytes([0x1D, 0x21, 0x00]);
  await PrinterModule.printBytes([0x1B, 0x45, 0x01]);

  await BluetoothEscposPrinter.printText(
    '------------------------------\n',
    {}
  );

  await BluetoothEscposPrinter.printText(
    `TOTAL: Bs ${venta.total}\n`,
    {}
  );

  await PrinterModule.printBytes([0x1B, 0x45, 0x00]);

  // ======================
  // FECHA
  // ======================
  await BluetoothEscposPrinter.printText(
    `Fecha: ${formatearFecha(venta.fecha)}\n`,
    {}
  );

  // ======================
  // CORTE
  // ======================
  await BluetoothEscposPrinter.printText('\n\n', {});

  await sleep(400);

  await PrinterModule.printBytes([0x1D, 0x56, 0x42, 0x00]);
}

/* =======================
   FUNCIÓN PRINCIPAL
======================= */

export async function imprimirVenta(venta: Venta): Promise<void> {
  try {
    console.log('🔍 Iniciando impresión de venta');

    // ---------------------------------
    // VALIDAR PRODUCTOS
    // ---------------------------------

    if (!venta.productos || venta.productos.length === 0) {
      console.log('⚠️ No hay productos para imprimir');
      return;
    }

    // ---------------------------------
    // DETECTAR PRODUCTOS SIN COCINA
    // ---------------------------------

    // IDs 18 al 48: Sodas.
    // IDs 49 al 76: Helados.
    //
    // Si TODOS los productos pertenecen a estos
    // rangos, solamente se imprime una copia.
    //
    // Si existe comida u otro ID desconocido,
    // se imprime también la copia de cocina.

    const esSoloProductosSinCocina = venta.productos.every(
      (producto) =>
        typeof producto.id === 'number' &&
        producto.id >= 18 &&
        producto.id <= 76
    );

    console.log(
      '🥤🍦 ¿El pedido contiene solamente sodas y/o helados?:',
      esSoloProductosSinCocina
    );

    // ---------------------------------
    // GENERAR NÚMERO DE PEDIDO
    // ---------------------------------

    // Se genera una sola vez y se utiliza
    // el mismo número en todas las copias.
    const pedidoNum = await getNextPedido();

    console.log(`🔍 ID de pedido generado: ${pedidoNum}`);

    // ---------------------------------
    // PRIMERA COPIA: CLIENTE
    // ---------------------------------

    await imprimirCopiaTicket(
      venta,
      pedidoNum,
      'Copia para cliente',
      false
    );

    // ---------------------------------
    // SEGUNDA COPIA: COCINA
    // ---------------------------------

    // Si el pedido contiene comida,
    // se imprime también la copia de cocina.
    if (!esSoloProductosSinCocina) {
      console.log('🍗 Pedido con comida: preparando segunda copia');

      await sleep(500);

      await imprimirCopiaTicket(
        venta,
        pedidoNum,
        'Copia para cocina',
        true
      );

      console.log('✅ Impresión doble completada');
    } else {
      console.log(
        '✅ Pedido de sodas y/o helados: impresión única completada'
      );
    }

  } catch (e) {
    console.log('🛑 Error imprimiendo:', e);
  }
}
