/* =========================================================
   app.jsx — shell del quadern interactiu
   ========================================================= */
const { useState, useEffect, useMemo, useRef } = React;
const W = window.QWidgets, Ic = window.QIcons;
const DATA = window.QUADERN;
const LS = 'pds_quadern_prehistoria_v1';

/* ---- icones de bloc ---- */
const BIcons = {
  clock:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  users:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>,
  flame:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C9 9 9 11 11 11c0-2-1-3 1-9Z"/><path d="M5 14a7 7 0 1 0 14 0c0-2-1-4-2.5-5.5"/></svg>,
  palette:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><circle cx="8" cy="9.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16" cy="9.5" r="1.2" fill="currentColor"/><path d="M12 21.5a3 3 0 0 1 0-6c1.5 0 2-1 2-2"/></svg>,
  wheat:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8M12 8c0-2 1.5-3.5 3.5-3.5C15.5 6.5 14 8 12 8ZM12 8c0-2-1.5-3.5-3.5-3.5C8.5 6.5 10 8 12 8ZM12 13c0-2 1.5-3.5 3.5-3.5C15.5 11.5 14 13 12 13ZM12 13c0-2-1.5-3.5-3.5-3.5C8.5 11.5 10 13 12 13Z"/></svg>,
  hammer:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 6.4 14 10l-2-2 3.6-3.6a2.8 2.8 0 0 1 4 4L16 12"/></svg>,
};

function loadState(){ try{ return JSON.parse(localStorage.getItem(LS))||{}; }catch(e){ return {}; } }
function saveState(s){ try{ localStorage.setItem(LS, JSON.stringify(s)); }catch(e){} }

/* =========================================================
   Exercise wrapper — gestiona valor, comprovació, pista, resolt
   ========================================================= */
function Exercise({act, n, state, setState}){
  const open = window.QOpen(act);
  const value = state.value!==undefined ? state.value : window.QInit(act);
  const checked = !!state.checked;
  const solved = !!state.solved;
  const [hint,setHint]=useState(false);

  function update(patch){ setState({...state, value, ...patch}); }
  function onChange(v){ setState({...state, value:v, checked:false, solved: open?false:solved}); }

  function comprova(){
    const ok = window.QEval(act, value);
    setState({...state, value, checked:true, solved: ok});
  }
  function reintenta(){ setState({...state, value, checked:false, solved:false}); }
  function desa(){ setState({...state, value, solved:true}); } // open-ended
  function reinicia(){ setState({value: window.QInit(act), checked:false, solved:false}); }

  const answered = window.QAnswered(act, value);
  const Widget = {
    fill:W.FillWidget, match:W.MatchWidget, single:W.ChoiceWidget, multi:W.ChoiceWidget,
    order:W.OrderWidget, truefalse:W.TrueFalseWidget, sketch:W.SketchWidget, describe:W.DescribeWidget
  }[act.type];

  return (
    <div className={"ex"+(solved?" solved":"")}>
      <div className="ex-top">
        <span className="qn">{n}</span>
        <p className="q-text">{act.prompt}</p>
      </div>
      <div className="ex-body">
        <Widget act={act} value={value} onChange={onChange} checked={checked}/>
      </div>

      {/* feedback */}
      {checked && !open && (
        window.QEval(act,value)
          ? <div className="fb good">{Ic.check()}<span><b>Molt bé!</b> Resposta correcta.</span></div>
          : <div className="fb bad">{Ic.x()}<span><b>Gairebé.</b> Repassa les marques en vermell i torna-ho a provar.</span></div>
      )}
      {hint && <div className="fb hint">{Ic.bulb()}<span><b>Pista.</b> {act.hint}</span></div>}

      {/* accions */}
      <div className="ex-foot">
        {!open && !solved && (
          checked
            ? <button className="btn btn-primary" onClick={reintenta}>{Ic.refresh()} Torna-ho a provar</button>
            : <button className="btn btn-primary" onClick={comprova} disabled={!answered}>{Ic.check()} Comprova</button>
        )}
        {!open && solved && <button className="btn btn-ghost" onClick={reinicia}>{Ic.refresh()} Repeteix</button>}
        {open && (
          solved
            ? <button className="btn btn-ghost" onClick={()=>setState({...state, value, solved:false})}>{Ic.pencil()} Continua editant</button>
            : <button className="btn btn-mark" onClick={desa} disabled={!answered}>{Ic.check()} Marca com a fet</button>
        )}
        {!solved && <button className="btn btn-ghost" onClick={()=>setHint(h=>!h)}>{Ic.bulb()} {hint?'Amaga la pista':'Pista'}</button>}
      </div>
    </div>
  );
}

/* =========================================================
   App
   ========================================================= */
function App(){
  const [store,setStore]=useState(loadState);
  const [active,setActive]=useState(()=> loadState()._active||0);
  const colRef=useRef(null);

  useEffect(()=>{ saveState({...store, _active:active}); },[store,active]);

  function setEx(exId, val){ setStore(s=>({...s, [exId]: val})); }

  // progress
  const allEx = useMemo(()=> DATA.blocs.flatMap(b=> b.activitats.map(a=>a.id)), []);
  const solvedCount = allEx.filter(id=> store[id] && store[id].solved).length;
  const totalEx = allEx.length;
  const pct = Math.round(solvedCount/totalEx*100);

  function blocSolved(b){ return b.activitats.every(a=> store[a.id] && store[a.id].solved); }
  function blocProgress(b){ const s=b.activitats.filter(a=> store[a.id] && store[a.id].solved).length; return {s, t:b.activitats.length}; }

  const allDone = solvedCount===totalEx;
  const showDone = active==='done';
  const bloc = typeof active==='number' ? DATA.blocs[active] : null;

  function go(i){ setActive(i); if(colRef.current) colRef.current.scrollTop=0; window.scrollTo({top:0}); }

  // ring geometry
  const R=14, C=2*Math.PI*R, off=C*(1-pct/100);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="hdr">
        <a className="brand" href={window.QUADERN_HOME_URL || "../index.html"} title="Tornar a l'inici">
          <span className="mk">?</span>
          <span className="nm">professordesocials<span className="dom">.cat</span></span>
        </a>
        <span className="crumbs"><b>{DATA.title}</b> · {DATA.subtitle}</span>
        {window.QUADERN_PDF_URL && (
          <a className="hbtn" href={window.QUADERN_PDF_URL} target="_blank" rel="noopener" title="Descarrega la versió imprimible">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
            PDF
          </a>
        )}
        <div className="ring" title={solvedCount+" de "+totalEx+" activitats"}>
          <svg viewBox="0 0 34 34">
            <circle cx="17" cy="17" r={R} fill="none" stroke="var(--stone-200)" strokeWidth="4"/>
            <circle cx="17" cy="17" r={R} fill="none" stroke="var(--blue-600)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={off} style={{transition:'stroke-dashoffset .5s var(--ease)'}}/>
          </svg>
          <span className="rt"><b>{solvedCount}</b>/{totalEx}</span>
        </div>
      </header>

      <div className="main">
        {/* RAIL */}
        <aside className="rail">
          <p className="rl-h">Activitats</p>
          <ul className="steps">
            {DATA.blocs.map((b,i)=>{
              const done=blocSolved(b); const prog=blocProgress(b);
              return (
                <li key={b.id} className={"step"+(active===i?" active":"")+(done?" done":"")} onClick={()=>go(i)}>
                  <span className="dot">{done?Ic.check():b.n}</span>
                  <span className="st-tx">
                    <span className="st-tt">{b.titol}</span>
                    <span className="st-mt">
                      <span>{b.durada}</span>
                      {prog.s>0 && !done && <span className="pc">· {prog.s}/{prog.t}</span>}
                      {done && <span className="pc">· fet</span>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* MOBILE selector */}
        <div className="mobsel">
          {DATA.blocs.map((b,i)=>{
            const done=blocSolved(b);
            return (
              <button key={b.id} className={(active===i?"active":"")+(done?" done":"")} onClick={()=>go(i)}>
                <span className="mn">{done?'✓':b.n}</span>{b.titol.split(':')[0].split('·')[0].trim().slice(0,18)}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <main className="col" ref={colRef}>
          {showDone ? (
            <div className="done-card">
              <div className="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
              <h2>Quadern completat</h2>
              <p>Has acabat les {totalEx} activitats dels 6 blocs de <b>La prehistòria</b>.</p>
              <p className="score">{solvedCount}/{totalEx} activitats · {pct}%</p>
              <div className="actions">
                <button className="btn btn-primary" onClick={()=>go(0)}>Torna al principi</button>
                <button className="btn btn-ghost" onClick={()=>{ if(confirm('Vols esborrar totes les respostes i començar de nou?')){ localStorage.removeItem(LS); location.reload(); } }}>{Ic.refresh()} Comença de nou</button>
              </div>
            </div>
          ) : (
            <>
              <div className="bloc-head">
                <span className="tag"><span className="d"></span>Bloc {bloc.n} de 6</span>
                <h1>{bloc.titol}</h1>
                <div className="sub">
                  <span className="chip">{BIcons[bloc.icona]}{bloc.tipus}</span>
                  <span className="dotsep"></span>
                  <span className="chip">{BIcons.clock}{bloc.durada}</span>
                </div>
              </div>

              {bloc.activitats.map((a,idx)=>(
                <Exercise key={a.id} act={a} n={idx+1}
                  state={store[a.id]||{}} setState={(v)=>setEx(a.id,v)}/>
              ))}
            </>
          )}
        </main>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottomnav">
        <div className="bn-prog">
          <span className="lab"><span>Progrés del quadern</span><b>{pct}%</b></span>
          <span className="track"><span className="fillb" style={{width:pct+'%'}}></span></span>
        </div>
        <div className="spacer"></div>
        {!showDone && (
          <button className="navbtn" disabled={active===0} onClick={()=>go(Math.max(0,active-1))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Anterior
          </button>
        )}
        {showDone ? (
          <button className="navbtn primary" onClick={()=>go(5)}>Revisa les activitats</button>
        ) : active<5 ? (
          <button className="navbtn primary" onClick={()=>go(active+1)}>
            Següent
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ) : (
          <button className="navbtn primary" onClick={()=>go('done')}>
            Finalitza
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
        )}
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
