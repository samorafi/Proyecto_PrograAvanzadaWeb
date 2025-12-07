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

export function pushAndInsert4P(board, eje, index, extremo, symbol, point, retiroIndex) {
  const b = JSON.parse(JSON.stringify(board));

  if (eje === "ROW") {
    const r = index;
    const lineIdx = [0, 1, 2, 3, 4].map((c) => idx4(r, c));
    const line = lineIdx.map((i) => b[i]);

    const retiroPos = lineIdx.indexOf(retiroIndex);
    const from = extremo === "START" ? 0 : 4;

    if (retiroPos === -1) {
      if (extremo === "START") {
        line.pop();
        line.unshift({ symbol, point });
      } else {
        line.shift();
        line.push({ symbol, point });
      }
    } else if (from < retiroPos) {
      // Empuja desde START hacia la casilla retirada (0 -> retiroPos)
      for (let pos = retiroPos; pos > from; pos--) {
        line[pos] = line[pos - 1];
      }
      line[from] = { symbol, point };
    } else if (from > retiroPos) {
      // Empuja desde END hacia la casilla retirada (4 -> retiroPos)
      for (let pos = retiroPos; pos < from; pos++) {
        line[pos] = line[pos + 1];
      }
      line[from] = { symbol, point };
    } else {
      // Inserción exactamente donde se retiró
      line[retiroPos] = { symbol, point };
    }

    lineIdx.forEach((cellIdx, k) => (b[cellIdx] = line[k]));
  } else {
    const c = index;
    const lineIdx = [0, 1, 2, 3, 4].map((r) => idx4(r, c));
    const line = lineIdx.map((i) => b[i]);

    const retiroPos = lineIdx.indexOf(retiroIndex);
    const from = extremo === "START" ? 0 : 4;

    if (retiroPos === -1) {
      if (extremo === "START") {
        line.pop();
        line.unshift({ symbol, point });
      } else {
        line.shift();
        line.push({ symbol, point });
      }
    } else if (from < retiroPos) {
      for (let pos = retiroPos; pos > from; pos--) {
        line[pos] = line[pos - 1];
      }
      line[from] = { symbol, point };
    } else if (from > retiroPos) {
      for (let pos = retiroPos; pos < from; pos++) {
        line[pos] = line[pos + 1];
      }
      line[from] = { symbol, point };
    } else {
      line[retiroPos] = { symbol, point };
    }

    lineIdx.forEach((cellIdx, k) => (b[cellIdx] = line[k]));
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
