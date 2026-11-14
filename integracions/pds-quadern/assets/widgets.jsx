/* =========================================================
   widgets.jsx — components interactius del quadern
   Exporta a window: Widget components + helpers (initValue, isAnswered, evaluate)
   ========================================================= */
const { useState, useRef, useEffect, useCallback } = React;

/* ---------- icones inline ---------- */
const I = {
  check:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  x:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  bulb:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg>,
  refresh:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>,
  eraser:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4L13 4.7a1 1 0 0 1 1.4 0l5.9 5.9a1 1 0 0 1 0 1.4L13 19H7Z"/><path d="m22 21-7 0M5 11l6 6"/></svg>,
  trash:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  pencil:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
};

/* =========================================================
   HELPERS
   ========================================================= */
function countBlanks(act){ let n=0; act.lines.forEach(l=> l.forEach(s=>{ if(typeof s==='number') n++; })); return n; }

window.QInit = function(act){
  switch(act.type){
    case 'fill': return Array(act.answers.length).fill(null);
    case 'match': return Array(act.rows.length).fill(null);
    case 'single': return null;
    case 'multi': return [];
    case 'order': return [];
    case 'truefalse': return Array(act.statements.length).fill(null);
    case 'sketch': return { img:null, checks:[] };
    case 'describe': return { text:'' };
    default: return null;
  }
};

window.QAnswered = function(act, v){
  if(v==null) return false;
  switch(act.type){
    case 'fill': return v.every(x=> x!=null);
    case 'match': return v.every(x=> x!=null);
    case 'single': return v!=null;
    case 'multi': return v.length>0;
    case 'order': return v.length===act.items.length;
    case 'truefalse': return v.every(x=> x!=null);
    case 'sketch': return !!v.img;
    case 'describe': return (v.text||'').trim().length>=8;
    default: return false;
  }
};

window.QEval = function(act, v){
  switch(act.type){
    case 'fill': return v.every((x,i)=> x===act.answers[i]);
    case 'match': return v.every((x,i)=> x===act.rows[i].answer);
    case 'single': return v!=null && act.options[v].correct;
    case 'multi': {
      const correct = act.options.map((o,i)=>o.correct?i:-1).filter(i=>i>=0);
      const sel=[...v].sort(); const cor=[...correct].sort();
      return sel.length===cor.length && sel.every((x,i)=>x===cor[i]);
    }
    case 'order': return v.every((itemIdx,pos)=> act.items[itemIdx]===act.order[pos]);
    case 'truefalse': return v.every((x,i)=> x===(act.statements[i].answer?'V':'F'));
    default: return true; // open-ended
  }
};
window.QOpen = function(act){ return act.type==='sketch' || act.type==='describe'; };

/* =========================================================
   FILL — banc de paraules + buits
   ========================================================= */
function FillWidget({act, value, onChange, checked}){
  const [sel,setSel]=useState(null); // chip text selected
  // used words
  const used = value.filter(x=>x!=null);
  const remaining = [];
  const usedCount={};
  used.forEach(w=> usedCount[w]=(usedCount[w]||0)+1);
  const tmp={...usedCount};
  act.bank.forEach(w=>{ if(tmp[w]>0){ tmp[w]--; } else remaining.push(w); });

  function placeInBlank(bi){
    if(checked) return;
    const nv=[...value];
    if(sel!=null){
      // if this word already placed elsewhere, remove it there
      const prev=nv.indexOf(sel); if(prev>=0) nv[prev]=null;
      nv[bi]=sel; onChange(nv); setSel(null);
    } else if(nv[bi]!=null){
      nv[bi]=null; onChange(nv);
    }
  }
  function clickChip(w){
    if(checked) return;
    setSel(sel===w?null:w);
  }
  let bi=-1;
  return (
    <div className="fill">
      <div className={"bank"+(remaining.length===0?" empty":"")}>
        {remaining.length===0
          ? <span style={{font:'500 13px/1 var(--font-body)',color:'var(--ink-3)'}}>Totes les paraules col·locades</span>
          : remaining.map((w,i)=>(
            <span key={w+i} className={"chip"+(sel===w?" sel":"")} onClick={()=>clickChip(w)}>{w}</span>
          ))}
      </div>
      <div className="fill-lines">
        {act.lines.map((line,li)=>(
          <div key={li}>
            {line.map((seg,si)=>{
              if(typeof seg==='string') return <span key={si}>{seg}</span>;
              bi++; const myBi=bi; const val=value[myBi];
              let cls="blank"; if(val==null) cls+=" empty";
              if(checked){ cls+= (val===act.answers[myBi])?" ok":" bad"; }
              else if(sel!=null) cls+=" target";
              return <span key={si} className={cls} onClick={()=>placeInBlank(myBi)}>{val||"___"}</span>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MATCH — files amb opcions
   ========================================================= */
function MatchWidget({act, value, onChange, checked}){
  function pick(ri,opt){ if(checked) return; const nv=[...value]; nv[ri]= nv[ri]===opt?null:opt; onChange(nv); }
  return (
    <div className="match">
      {act.rows.map((row,ri)=>{
        let cls="mrow"; if(checked) cls+= (value[ri]===row.answer)?" ok":" bad";
        return (
          <div key={ri} className={cls}>
            <div className="ml"><span>{row.label}</span><span className="ar">→</span></div>
            <div className="mopts">
              {act.options.map(opt=>(
                <span key={opt} className={"mopt"+(value[ri]===opt?" sel":"")} onClick={()=>pick(ri,opt)}>{opt}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   SINGLE / MULTI choice
   ========================================================= */
function ChoiceWidget({act, value, onChange, checked}){
  const multi = act.type==='multi';
  function toggle(i){
    if(checked) return;
    if(multi){ const s=new Set(value); s.has(i)?s.delete(i):s.add(i); onChange([...s]); }
    else onChange(value===i?null:i);
  }
  const sel = multi ? new Set(value) : null;
  return (
    <div className={"opts"+(act.layout==='inline'?" inline":"")}>
      {act.options.map((o,i)=>{
        const isSel = multi ? sel.has(i) : value===i;
        let cls="opt "+(multi?"multi":"single"); if(isSel) cls+=" sel";
        let showMiss=false;
        if(checked){
          if(multi){
            if(isSel) cls+= o.correct?" ok":" bad";
            else if(o.correct){ cls+=" ok"; showMiss=true; }
          } else {
            if(isSel) cls+= o.correct?" ok":" bad";
            else if(o.correct) cls+=" ok";
          }
        }
        return (
          <div key={i} className={cls} onClick={()=>toggle(i)}>
            <span className="box">{I.check()}</span>
            <span>{o.text}</span>
            {showMiss && <span className="miss">Faltava</span>}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   ORDER — clic en seqüència
   ========================================================= */
function OrderWidget({act, value, onChange, checked}){
  function click(i){
    if(checked) return;
    const idx=value.indexOf(i);
    if(idx>=0){ const nv=[...value]; nv.splice(idx,1); onChange(nv); }
    else onChange([...value,i]);
  }
  return (
    <div className="order">
      {act.items.map((it,i)=>{
        const pos=value.indexOf(i);
        let cls="oitem"; if(pos>=0) cls+=" picked";
        let correctNum=null;
        if(checked && pos>=0){
          const ok = act.items[i]===act.order[pos];
          cls+= ok?" ok":" bad";
          if(!ok){ correctNum = act.order.indexOf(act.items[i])+1; }
        }
        return (
          <div key={i} className={cls} onClick={()=>click(i)}>
            <span className="seq">{pos>=0?pos+1:""}</span>
            <span>{it}</span>
            {correctNum && <span className="correctpos">va en {correctNum}r/è</span>}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   TRUE / FALSE
   ========================================================= */
function TrueFalseWidget({act, value, onChange, checked}){
  function set(ri,val){ if(checked) return; const nv=[...value]; nv[ri]= nv[ri]===val?null:val; onChange(nv); }
  return (
    <div className="tf">
      {act.statements.map((s,ri)=>{
        const correct = s.answer?'V':'F';
        let cls="tfrow"; if(checked) cls+= (value[ri]===correct)?" ok":" bad";
        return (
          <div key={ri} className={cls}>
            <span className="tft">{s.text}</span>
            <div className="tfbtns">
              <button className={"tfb v"+(value[ri]==='V'?" sel":"")} onClick={()=>set(ri,'V')}>V</button>
              <button className={"tfb f"+(value[ri]==='F'?" sel":"")} onClick={()=>set(ri,'F')}>F</button>
              {checked && value[ri]!==correct && <span className="sol">és {correct}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   SKETCH — pissarra de dibuix
   ========================================================= */
const SK_COLORS=[
  {name:'Carbó', c:'#2B2B2B'},
  {name:'Ocre',  c:'#C8772E'},
  {name:'Almagre', c:'#A8392A'},
  {name:'Verd', c:'#3C6E47'},
];
function SketchWidget({act, value, onChange}){
  const canRef=useRef(null), drawing=useRef(false), last=useRef(null);
  const [color,setColor]=useState(SK_COLORS[0].c);
  const [erase,setErase]=useState(false);
  const W=900,H=420;

  // restore
  useEffect(()=>{
    const cv=canRef.current; if(!cv) return; const ctx=cv.getContext('2d');
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(value.img){ const img=new Image(); img.onload=()=>ctx.drawImage(img,0,0,W,H); img.src=value.img; }
  },[]);

  function pos(e){
    const cv=canRef.current; const r=cv.getBoundingClientRect();
    const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    const cy=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
    return { x:cx*(W/r.width), y:cy*(H/r.height) };
  }
  function down(e){ e.preventDefault(); drawing.current=true; last.current=pos(e); dot(last.current); }
  function move(e){ if(!drawing.current) return; e.preventDefault(); const p=pos(e); stroke(last.current,p); last.current=p; }
  function up(){ if(!drawing.current) return; drawing.current=false; save(); }
  function ctxSet(ctx){ ctx.strokeStyle=erase?'#ffffff':color; ctx.fillStyle=erase?'#ffffff':color; ctx.lineWidth=erase?22:3.5; }
  function dot(p){ const ctx=canRef.current.getContext('2d'); ctxSet(ctx); ctx.beginPath(); ctx.arc(p.x,p.y,(erase?11:1.75),0,7); ctx.fill(); }
  function stroke(a,b){ const ctx=canRef.current.getContext('2d'); ctxSet(ctx); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
  function save(){ onChange({...value, img:canRef.current.toDataURL('image/png')}); }
  function clear(){ const ctx=canRef.current.getContext('2d'); ctx.clearRect(0,0,W,H); onChange({...value, img:null}); }
  function toggleCheck(item){ const s=new Set(value.checks); s.has(item)?s.delete(item):s.add(item); onChange({...value, checks:[...s]}); }

  return (
    <div className="sketch-wrap">
      <div className="sk-tools">
        {SK_COLORS.map(sc=>(
          <span key={sc.c} className={"sk-sw"+(!erase&&color===sc.c?" on":"")} title={sc.name}
                style={{background:sc.c}} onClick={()=>{setColor(sc.c); setErase(false);}}></span>
        ))}
        <span className={"sk-tool"+(erase?" on":"")} onClick={()=>setErase(e=>!e)}>{I.eraser()} Esborrar</span>
        <span className="sk-tool" onClick={clear}>{I.trash()} Buida</span>
      </div>
      <div className="sk-canvas-box">
        <canvas ref={canRef} width={W} height={H}
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up}></canvas>
      </div>
      <div className="checklist">
        {act.checklist.map(item=>{
          const on=value.checks.includes(item);
          return (
            <span key={item} className={"cl-item"+(on?" on":"")} onClick={()=>toggleCheck(item)}>
              <span className="cb">{I.check()}</span>{item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   DESCRIBE — imatge + text
   ========================================================= */
function DescribeWidget({act, value, onChange}){
  return (
    <div className="describe">
      {act.image && (
        <div className="imgslot-wrap">
          <image-slot id={"slot-"+act.id} shape="rounded" radius="14" placeholder={"Arrossega una imatge · "+(act.imageLabel||'')}></image-slot>
        </div>
      )}
      <textarea value={value.text} placeholder={act.placeholder||'Escriu aquí la teva resposta…'}
        onChange={e=>onChange({...value, text:e.target.value})}></textarea>
    </div>
  );
}

/* ---------- registre ---------- */
window.QWidgets = { FillWidget, MatchWidget, ChoiceWidget, OrderWidget, TrueFalseWidget, SketchWidget, DescribeWidget };
window.QIcons = I;
