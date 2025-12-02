export const emptyBoard4P = () =>
  Array(25).fill(null).map(() => ({
    symbol: "N",
    point: null
  }));

export const rc4 = (i) => ({
  r: Math.floor(i / 5),
  c: i % 5
});

export const idx4 = (r, c) => r * 5 + c;

export function isEdge4P(i) {
  const top = [0, 1, 2, 3, 4];
  const bottom = [20, 21, 22, 23, 24];
  const left = [5, 10, 15];
  const right = [9, 14, 19];
  return top.includes(i) || bottom.includes(i) || left.includes(i) || right.includes(i);
}

export function canPickCube4P(cell, subPlayer) {
  if (cell.symbol === "N") return true;
  return cell.point === subPlayer;
}

export function pushAndInsert4P(board, eje, index, extremo, symbol, point) {
  const b = JSON.parse(JSON.stringify(board));

  if (eje === "ROW") {
    const r = index;
    const row = [0, 1, 2, 3, 4].map((c) => b[idx4(r, c)]);
    if (extremo === "START") {
      row.pop();
      row.unshift({ symbol, point });
    } else {
      row.shift();
      row.push({ symbol, point });
    }
    [0, 1, 2, 3, 4].forEach((c, k) => (b[idx4(r, c)] = row[k]));
  } else {
    const c = index;
    const col = [0, 1, 2, 3, 4].map((r) => b[idx4(r, c)]);
    if (extremo === "START") {
      col.pop();
      col.unshift({ symbol, point });
    } else {
      col.shift();
      col.push({ symbol, point });
    }
    [0, 1, 2, 3, 4].forEach((r, k) => (b[idx4(r, c)] = col[k]));
  }

  return b;
}

export function hasFive4P(board, symbol) {
  const val = (r, c) => board[idx4(r, c)].symbol === symbol;

  for (let r = 0; r < 5; r++)
    if ([0, 1, 2, 3, 4].every((c) => val(r, c))) return true;

  for (let c = 0; c < 5; c++)
    if ([0, 1, 2, 3, 4].every((r) => val(r, c))) return true;

  if ([0, 1, 2, 3, 4].every((k) => val(k, k))) return true;
  if ([0, 1, 2, 3, 4].every((k) => val(k, 4 - k))) return true;

  return false;
}

export function board4PToXml(board) {
  let xml = `<Tablero>`;
  board.forEach((cell, i) => {
    xml += `<Celda i="${i}" simbolo="${cell.symbol}" />`;
  });
  xml += `</Tablero>`;
  return xml;
}

export function appendHistory4P(xml, jugada, board) {
  const tabXml = board4PToXml([...board]);
  const turno = (xml.match(/<Turno /g) || []).length + 1;
  const indice = jugada.indice ?? jugada.index ?? 0;

  const jugadaXml = `
    <Turno n="${turno}">
      <Jugada
        jugador="${jugada.jugador}"
        retiro="${jugada.retirado}"
        eje="${jugada.eje}"
        indice="${indice}"
        extremo="${jugada.extremo}"
        simbolo="${jugada.symbol}"
        punto="${jugada.point ?? ""}"
        horaUtc="${new Date().toISOString()}"
      />
      ${tabXml}
    </Turno>
  `.trim();

  return xml.trim() === "<Historial/>"
    ? `<Historial>${jugadaXml}</Historial>`
    : xml.replace("</Historial>", `${jugadaXml}</Historial>`);
}
