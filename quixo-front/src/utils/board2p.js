export const emptyBoard = ()=> Array(25).fill("N");
export const idx = (r,c)=> r*5+c;
export const rc = (i)=>({r:Math.floor(i/5), c:i%5});
export function pushAndInsert(b,eje,index,extremo,sym){
  const a=[...b];
  if(eje==="ROW"){
    const r=index, row=[0,1,2,3,4].map(c=>a[idx(r,c)]);
    (extremo==="START")? (row.pop(), row.unshift(sym)) : (row.shift(), row.push(sym));
    [0,1,2,3,4].forEach((c,k)=> a[idx(r,c)]=row[k]);
  }else{
    const c=index, col=[0,1,2,3,4].map(r=>a[idx(r,c)]);
    (extremo==="START")? (col.pop(), col.unshift(sym)) : (col.shift(), col.push(sym));
    [0,1,2,3,4].forEach((r,k)=> a[idx(r,c)]=col[k]);
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
