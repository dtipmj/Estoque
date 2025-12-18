import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "storage", "os-saida");

export async function generateExitOS({
  movements,
  client_name,
  client_document,
  declaration,
  operator_name,
}) {
  if (!Array.isArray(movements) || !movements.length) {
    throw new Error("Nenhum movimento informado para gerar OS.");
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const first = movements[0];
  const fileName = `OS-SAIDA-${first.id}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const marginLeft = doc.page.margins.left;
  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // ===== Cabeçalho =====
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("ORDEM DE SAÍDA DE MATERIAL", { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Sistema de Controle de Estoque", { align: "center" });
  doc.moveDown();

  doc.moveTo(marginLeft, doc.y).lineTo(doc.page.width - marginLeft, doc.y).stroke();
  doc.moveDown();

  // ===== Dados da OS / Cliente =====
  doc.fontSize(11).font("Helvetica-Bold").text("Dados da OS", {
    underline: true,
    align: "left",
  });
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(10.5);
  doc.text(`OS: ${first.id}`);
  if (operator_name) doc.text(`Entregador: ${operator_name}`);
  doc.text(`---------------------------------------`);
  doc.text(`Data: ${new Date(first.created_at).toLocaleString("pt-BR")}`);
  doc.text(`Cliente: ${client_name}`);
  if (client_document) doc.text(`Documento: ${client_document}`);


  doc.moveDown();

  // ===== Tabela de Itens =====
  doc.fontSize(11).font("Helvetica-Bold").text("Itens da saída", {
    underline: true,
    align: "left",
  });
  doc.moveDown(0.5);

  // Config da tabela
  const tableTop = doc.y;
  const tableWidth = usableWidth;
  const rowHeight = 20;

  const colProdutoWidth = tableWidth * 0.55;
  const colQtdWidth = tableWidth * 0.15;
  const colEstoqueWidth = tableWidth * 0.30;

  const colProdutoX = marginLeft;
  const colQtdX = marginLeft + colProdutoWidth;
  const colEstoqueX = marginLeft + colProdutoWidth + colQtdWidth;

  function drawTableHeader(y) {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#ffffff")
      .rect(marginLeft, y, tableWidth, rowHeight)
      .fillAndStroke("#374151", "#111827");

    const textY = y + 6;

    doc
      .fillColor("#ffffff")
      .text("Produto", colProdutoX + 4, textY, {
        width: colProdutoWidth - 8,
      })
      .text("Qtd", colQtdX, textY, {
        width: colQtdWidth,
        align: "center",
      })
      .text("Estoque", colEstoqueX + 4, textY, {
        width: colEstoqueWidth - 8,
      });

    doc.fillColor("#000000");
  }

  // Cabeçalho inicial
  drawTableHeader(tableTop);

  let y = tableTop + rowHeight;

  doc.font("Helvetica").fontSize(10);

  function checkNewPage() {
    if (y + rowHeight * 2 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      // reposiciona para o topo da nova página
      y = doc.y;
      drawTableHeader(y);
      y += rowHeight;
    }
  }

  movements.forEach((mov) => {
    checkNewPage();

    // linha de fundo / borda da linha
    doc
      .lineWidth(0.5)
      .rect(marginLeft, y, tableWidth, rowHeight)
      .stroke("#d1d5db");

    const textY = y + 5;

    // Produto
    doc.text(mov.product, colProdutoX + 4, textY, {
      width: colProdutoWidth - 8,
    });

    // Quantidade
    doc.text(
      Number(mov.quantity).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colQtdX,
      textY,
      {
        width: colQtdWidth,
        align: "center",
      }
    );

    // Estoque
    doc.text(mov.warehouse, colEstoqueX + 4, textY, {
      width: colEstoqueWidth - 8,
    });

    y += rowHeight;
  });

  // posiciona o cursor logo abaixo da tabela
  doc.y = y + 15;
  doc.x = marginLeft;

  // ===== Declaração =====
  doc.fontSize(11).font("Helvetica-Bold");
  doc.text("Declaração de responsabilidade:", marginLeft, doc.y, {
    underline: true,
    width: usableWidth,
    align: "left",
  });
  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .text(declaration, marginLeft, doc.y, {
      width: usableWidth,
      align: "left",
    });

  doc.moveDown(3);

  // se estiver perto do fim da página, quebra antes da assinatura
  if (doc.y + 80 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  // ===== Assinatura (campo centralizado) =====
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("________________________________________", {
      align: "center",
    });
  doc.text(client_name, { align: "center" });
  doc.text("Assinatura do responsável", { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return { filePath, fileName };
}

// ================== OS ASSINADA (com desenho) ==================

export async function addSignatureToPdf({ order, signatureDataUrl }) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fileName = `OS-SAIDA-${order.movement_id}-assinado.pdf`;
  const newFilePath = path.join(OUTPUT_DIR, fileName);

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(newFilePath);
  doc.pipe(writeStream);

  const marginLeft = doc.page.margins.left;
  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const date = order.movement_created_at
    ? new Date(order.movement_created_at)
    : new Date(order.created_at);

  const operatorName =
    order.operator_name ||
    order.user_name ||
    "";

  // ===== Itens da saída (pega do items_json ou fallback) =====
  let items = [];
  try {
    if (order.items_json) {
      if (typeof order.items_json === "string") {
        items = JSON.parse(order.items_json);
      } else if (Array.isArray(order.items_json)) {
        items = order.items_json;
      }
    }
  } catch (_) {
    items = [];
  }

  // ===== Cabeçalho =====
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("ORDEM DE SAÍDA DE MATERIAL", { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Sistema de Controle de Estoque", { align: "center" });
  doc.moveDown();

  doc.moveTo(marginLeft, doc.y).lineTo(doc.page.width - marginLeft, doc.y).stroke();
  doc.moveDown();

  // ===== Dados da OS / Cliente =====
  doc.fontSize(11).font("Helvetica-Bold").text("Dados da OS", {
    underline: true,
    align: "left",
  });
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(10.5);
  doc.text(`OS: ${order.movement_id}`);
  if (operatorName) doc.text(`Entregador: ${operatorName}`);
  doc.text(`---------------------------------------`);
  doc.text(`Data: ${date.toLocaleString("pt-BR")}`);
  doc.text(`Cliente: ${order.client_name}`);
  if (order.client_document) doc.text(`Documento: ${order.client_document}`);
  doc.moveDown();

  // ===== Tabela de Itens =====
  doc.fontSize(11).font("Helvetica-Bold").text("Itens da saída", {
    underline: true,
    align: "left",
  });
  doc.moveDown(0.5);

  const tableWidth = usableWidth;
  const rowHeight = 20;

  const colProdutoWidth = tableWidth * 0.55;
  const colQtdWidth = tableWidth * 0.15;
  const colEstoqueWidth = tableWidth * 0.30;

  const colProdutoX = marginLeft;
  const colQtdX = marginLeft + colProdutoWidth;
  const colEstoqueX = marginLeft + colProdutoWidth + colQtdWidth;

  function drawTableHeaderSigned(y) {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#ffffff")
      .rect(marginLeft, y, tableWidth, rowHeight)
      .fillAndStroke("#374151", "#111827");

    const textY = y + 6;

    doc
      .fillColor("#ffffff")
      .text("Produto", colProdutoX + 4, textY, {
        width: colProdutoWidth - 8,
      })
      .text("Qtd", colQtdX, textY, {
        width: colQtdWidth,
        align: "center",
      })
      .text("Estoque", colEstoqueX + 4, textY, {
        width: colEstoqueWidth - 8,
      });

    doc.fillColor("#000000");
  }

  let y = doc.y;
  drawTableHeaderSigned(y);
  y += rowHeight;

  doc.font("Helvetica").fontSize(10);

  function checkNewPageSigned() {
    if (y + rowHeight * 2 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.y;
      drawTableHeaderSigned(y);
      y += rowHeight;
    }
  }

  const list = items.length
    ? items
    : [
      {
        product: order.product,
        quantity: order.movement_quantity,
        warehouse: order.warehouse,
      },
    ];

  list.forEach((it) => {
    checkNewPageSigned();

    doc
      .lineWidth(0.5)
      .rect(marginLeft, y, tableWidth, rowHeight)
      .stroke("#d1d5db");

    const textY = y + 5;

    doc.text(it.product, colProdutoX + 4, textY, {
      width: colProdutoWidth - 8,
    });

    doc.text(
      Number(it.quantity).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colQtdX,
      textY,
      {
        width: colQtdWidth,
        align: "center",
      }
    );

    doc.text(it.warehouse, colEstoqueX + 4, textY, {
      width: colEstoqueWidth - 8,
    });

    y += rowHeight;
  });

  doc.y = y + 15;
  doc.x = marginLeft;

  // ===== Declaração =====
  const declaration =
    order.declaration ||
    "Declaro que recebi os materiais acima descritos, assumindo total responsabilidade pelo uso e conservação, comprometendo-me a devolvê-los em perfeitas condições ou ressarcir eventuais danos/avarias.";

  doc.fontSize(11).font("Helvetica-Bold");
  doc.text("Declaração de responsabilidade:", marginLeft, doc.y, {
    underline: true,
    width: usableWidth,
    align: "left",
  });
  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .text(declaration, marginLeft, doc.y, {
      width: usableWidth,
      align: "left",
    });

  doc.moveDown(2);

  // se estiver muito perto do fim da página, quebra antes da assinatura
  if (doc.y + 120 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  // ===== Assinatura desenhada (imagem) =====
  const base64 = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const sigPath = path.join(OUTPUT_DIR, `signature-${order.movement_id}.png`);
  fs.writeFileSync(sigPath, buffer);

  const sigWidth = 220;
  const sigHeight = 80;
  const xSig = (doc.page.width - sigWidth) / 2; // centraliza horizontal
  const ySig = doc.y + 25;

  doc.image(sigPath, xSig, ySig, { width: sigWidth, height: sigHeight });

  // espaço depois da assinatura
  doc.y = ySig + sigHeight - 5;

  // ===== Linha / texto da assinatura (centralizado) =====
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("________________________________________", { align: "center" });
  doc.text(order.client_name, { align: "center" });
  doc.text("Assinatura do responsável", { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return { newFilePath };
}
