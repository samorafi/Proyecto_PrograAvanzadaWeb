export const emptyBoard = ()=> Array(25).fill("N");
export const idx = (r,c)=> r*5+c;
export const rc = (i)=>({r:Math.floor(i/5), c:i%5});

function slideLine(line, extremoIndex, retiroPos, sym) {
  const result = [...line];
  let current = sym;

  if (extremoIndex < retiroPos) {
    // Recorremos desde el extremo hacia la posición de retiro (izq -> der)
    for (let pos = extremoIndex; pos <= retiroPos; pos++) {
      const tmp = result[pos];
      result[pos] = current;
      current = tmp;
    }
  } else {
    // Recorremos desde el extremo hacia la posición de retiro (der -> izq)
    for (let pos = extremoIndex; pos >= retiroPos; pos--) {
      const tmp = result[pos];
      result[pos] = current;
      current = tmp;
    }
  }
  // 'current' sería la ficha expulsada del recorrido, que no nos interesa
  return result;
}

export function pushAndInsert(b, eje, index, extremo, sym, retiroIndex){
  const a = [...b];
  const extremoIndex = (extremo === "START") ? 0 : 4;

  if (eje === "ROW") {
    const r = index;
    const lineIdx = [0,1,2,3,4].map(c => idx(r, c));  // índices lineales de la fila
    const retiroPos = lineIdx.indexOf(retiroIndex);

    if (retiroPos === -1) {
      const row = lineIdx.map(i => a[i]);
      (extremo === "START") ? (row.pop(), row.unshift(sym)) : (row.shift(), row.push(sym));
      lineIdx.forEach((cellIdx, k) => a[cellIdx] = row[k]);
    } else {
      const row = lineIdx.map(i => a[i]);
      const newRow = slideLine(row, extremoIndex, retiroPos, sym);
      lineIdx.forEach((cellIdx, k) => a[cellIdx] = newRow[k]);
    }
  } else {
    const c = index;
    const lineIdx = [0,1,2,3,4].map(r => idx(r, c));  // índices lineales de la columna
    const retiroPos = lineIdx.indexOf(retiroIndex);

    if (retiroPos === -1) {
      const col = lineIdx.map(i => a[i]);
      (extremo === "START") ? (col.pop(), col.unshift(sym)) : (col.shift(), col.push(sym));
      lineIdx.forEach((cellIdx, k) => a[cellIdx] = col[k]);
    } else {
      const col = lineIdx.map(i => a[i]);
      const newCol = slideLine(col, extremoIndex, retiroPos, sym);
      lineIdx.forEach((cellIdx, k) => a[cellIdx] = newCol[k]);
    }
  }

  return a;
}

export function hasFive(b,sym){
  for(let r=0;r<5;r++) if([0,1,2,3,4].every(c=>b[idx(r,c)]===sym)) return true;
  for(let c=0;c<5;c++) if([0,1,2,3,4].every(r=>b[idx(r,c)]===sym)) return true;
  if([0,1,2,3,4].every(k=>b[idx(k,k)]===sym)) return true;
  if([0,1,2,3,4].every(k=>b[idx(k,4-k)]===sym)) return true;
  return false;
}
