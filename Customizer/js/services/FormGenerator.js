/**
 * services/FormGenerator.js
 * ──────────────────────────
 * Service class responsible for generating the standalone preview-form HTML
 * from a config object.  Pure input → output; no DOM access, no state.
 *
 * Consumed by: AppController
 */
class FormGenerator {
  /**
   * Generates a full standalone HTML document string for the given config.
   * @param   {object} cfg  - The form configuration object.
   * @returns {string}      - Complete HTML document.
   */
  generate(cfg) {
    const t                  = cfg.style            || {};
    const transition         = cfg.transition         || 'slide';
    const transitionDuration = cfg.transitionDuration || '0.4s';
    const transitionDelay    = cfg.transitionDelay    || '0s';
    const focusRgb           = ColorUtils.hexToRgb(t.accentColor);
    const focusShadow        = focusRgb
      ? `0 0 0 3px rgba(${focusRgb},0.18)`
      : '0 0 0 3px rgba(79,70,229,0.1)';
    const total              = cfg.pages.length;
    const pagesHTML          = cfg.pages.map((page, i) => this._buildPage(page, i, total)).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <style>${this._buildStyles(t, focusShadow)}</style>
  </head><body>
  <div class="form-wrapper">
    <h1>${cfg.formTitle || 'My Form'}</h1>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <form id="multi-step-form">
      <div class="form-pages-track">${pagesHTML}</div>
    </form>
    <div class="success-message">
      <h2>✅ Submitted!</h2>
      <p>Thank you for completing the form.</p>
    </div>
  </div>
  ${this._buildScript(total, transition, transitionDuration, transitionDelay)}
</body></html>`;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Builds the HTML for a single form page.
   * @private
   */
  _buildPage(page, index, total) {
    const isFirst    = index === 0;
    const isLast     = index === total - 1;
    const inputsHTML = page.inputs.map(inp => this._buildInput(inp)).join('');

    return `<div class="form-page" id="page-${index}"${isFirst ? '' : ' style="display:none"'}>
      <h2>${page.pageTitle}</h2>
      <p class="page-counter">Page ${index + 1} of ${total}</p>
      ${inputsHTML}
      <div class="nav-buttons">
        ${!isFirst ? `<button type="button" class="btn-prev" onclick="navigate(${index},-1)">← Previous</button>` : ''}
        ${!isLast  ? `<button type="button" class="btn-next" onclick="navigate(${index}, 1)">Next →</button>`     : ''}
        ${isLast   ? `<button type="submit"  class="btn-submit">Submit ✓</button>`                                : ''}
      </div>
    </div>`;
  }

  /**
   * Builds the HTML for a single form input field.
   * @private
   */
  _buildInput(inp) {
    const id        = (inp.name || 'field').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const labelText = inp.label || inp.name;
    const ph        = inp.placeholder || labelText;
    const req       = inp.required ? 'required' : '';
    const limit     = inp.type === 'number' ? `max="${inp.limit}"` : `maxlength="${inp.limit}"`;
    const hint      = inp.type === 'number' ? `Max value: ${inp.limit}` : `Max ${inp.limit} characters`;

    if (inp.type === 'textarea') {
      return `<div class="form-group">
        <label for="${id}">${labelText}</label>
        <textarea id="${id}" name="${id}" placeholder="${ph}" maxlength="${inp.limit}" ${req}></textarea>
        <small class="limit-hint">Max ${inp.limit} chars</small>
      </div>`;
    }

    return `<div class="form-group">
      <label for="${id}">${labelText}</label>
      <input type="${inp.type}" id="${id}" name="${id}" placeholder="${ph}" ${limit} ${req} />
      <small class="limit-hint">${hint}</small>
    </div>`;
  }

  /**
   * Returns the inline <style> block content for the generated form.
   * @private
   */
  _buildStyles(t, focusShadow) {
    return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${t.fontFamily||"'Segoe UI',sans-serif"};background:${t.bgColor||'#f0f4f8'};display:flex;justify-content:center;align-items:center;min-height:100vh;padding:2rem}
    .form-wrapper{background:${t.cardColor||'#fff'};border-radius:${t.cardRadius||'12px'};box-shadow:${t.cardShadow||'0 4px 24px rgba(0,0,0,.1)'};padding:2.5rem;width:100%;max-width:520px}
    h1{font-size:1.6rem;margin-bottom:1.5rem;color:${t.headingColor||'#1a1a2e'};text-align:center}
    h2{font-size:1.2rem;margin-bottom:.25rem;color:${t.headingColor||'#1a1a2e'}}
    .page-counter{font-size:.8rem;color:#888;margin-bottom:1.5rem}
    .progress-bar{width:100%;height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:1.5rem;overflow:hidden}
    .progress-fill{height:100%;background:${t.accentColor||'#4f46e5'};border-radius:3px;transition:width .3s ease}
    .form-group{margin-bottom:1.25rem}
    label{display:block;font-size:.85rem;font-weight:600;color:${t.labelColor||'#374151'};margin-bottom:.35rem}
    input,textarea,select{width:100%;padding:.6rem .85rem;border:1.5px solid ${t.inputBorder||'#d1d5db'};border-radius:7px;font-size:.95rem;transition:border-color .2s;outline:none;color:${t.inputColor||'#111'};background:${t.inputBg||'#fff'}}
    input:focus,textarea:focus{border-color:${t.accentColor||'#4f46e5'};box-shadow:${focusShadow}}
    textarea{resize:vertical;min-height:90px}
    .limit-hint{font-size:.75rem;color:#9ca3af;margin-top:.25rem;display:block}
    .nav-buttons{display:flex;justify-content:space-between;margin-top:1.75rem;gap:.75rem}
    button{flex:1;padding:.65rem 1.25rem;border:none;border-radius:7px;font-size:.95rem;font-weight:600;cursor:pointer;transition:background .2s,transform .1s}
    button:active{transform:scale(.98)}
    .btn-next,.btn-submit{background:${t.accentColor||'#4f46e5'};color:#fff}
    .btn-next:hover,.btn-submit:hover{background:${t.accentHover||'#4338ca'}}
    .btn-prev{background:#e5e7eb;color:#374151}
    .btn-prev:hover{background:#d1d5db}
    .success-message{text-align:center;padding:2rem;display:none}
    .success-message h2{color:#16a34a;font-size:1.4rem}
    .success-message p{color:#555;margin-top:.5rem}
    .form-pages-track{overflow:hidden;position:relative}
    .form-page{animation-duration:${t.animationSpeed||'0.4s'};animation-fill-mode:both;animation-timing-function:cubic-bezier(.4,0,.2,1)}
    @keyframes slideInRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes slideOutLeft{from{transform:translateX(0);opacity:1}to{transform:translateX(-110%);opacity:0}}
    @keyframes slideInLeft{from{transform:translateX(-110%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(110%);opacity:0}}
    .slide-in-right{animation-name:slideInRight}
    .slide-out-left{animation-name:slideOutLeft;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    .slide-in-left{animation-name:slideInLeft}
    .slide-out-right{animation-name:slideOutRight;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes fadeOut{from{opacity:1}to{opacity:0}}
    .fade-in{animation-name:fadeIn}
    .fade-out{animation-name:fadeOut;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    @keyframes slideInDown{from{transform:translateY(-110%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes slideOutUp{from{transform:translateY(0);opacity:1}to{transform:translateY(-110%);opacity:0}}
    @keyframes slideInUp{from{transform:translateY(110%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes slideOutDown{from{transform:translateY(0);opacity:1}to{transform:translateY(110%);opacity:0}}
    .slide-in-down{animation-name:slideInDown}
    .slide-out-up{animation-name:slideOutUp;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    .slide-in-up{animation-name:slideInUp}
    .slide-out-down{animation-name:slideOutDown;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    @keyframes zoomIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes zoomOut{from{transform:scale(1);opacity:1}to{transform:scale(1.1);opacity:0}}
    @keyframes zoomInBack{from{transform:scale(1.1);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes zoomOutBack{from{transform:scale(1);opacity:1}to{transform:scale(0.85);opacity:0}}
    .zoom-in{animation-name:zoomIn}
    .zoom-out{animation-name:zoomOut;pointer-events:none;position:absolute;top:0;left:0;width:100%}
    .zoom-in-back{animation-name:zoomInBack}
    .zoom-out-back{animation-name:zoomOutBack;pointer-events:none;position:absolute;top:0;left:0;width:100%}`;
  }

  /**
   * Builds the client-side navigation <script> block.
   * @param {number} totalPages
   * @param {string} transition         'slide' | 'fade' | 'vertical' | 'zoom'
   * @param {string} transitionDuration CSS time string (e.g. "0.4s")
   * @param {string} transitionDelay    CSS time string (e.g. "0s")
   * @private
   */
  _buildScript(totalPages, transition, transitionDuration, transitionDelay) {
    return `<script>
    const totalPages         = ${totalPages};
    const transitionType     = '${transition}';
    const transitionDuration = '${transitionDuration}';
    const transitionDelay    = '${transitionDelay}';

    function cssTimeToMs(val){if(!val)return 0;const n=parseFloat(val);return val.trim().endsWith('ms')?n:n*1000;}
    function getClasses(dir){
      switch(transitionType){
        case'fade':    return{out:'fade-out',in:'fade-in'};
        case'vertical':return dir===1?{out:'slide-out-up',in:'slide-in-down'}:{out:'slide-out-down',in:'slide-in-up'};
        case'zoom':    return dir===1?{out:'zoom-out',in:'zoom-in'}:{out:'zoom-out-back',in:'zoom-in-back'};
        default:       return dir===1?{out:'slide-out-left',in:'slide-in-right'}:{out:'slide-out-right',in:'slide-in-left'};
      }
    }
    function updateProgress(i){document.querySelector('.progress-fill').style.width=((i+1)/totalPages*100)+'%';}
    function navigate(ci,dir){
      const cur=document.getElementById('page-'+ci);
      if(dir===1){const ins=cur.querySelectorAll('input[required],textarea[required]');for(const i of ins){if(!i.value.trim()){i.focus();i.style.borderColor='#ef4444';setTimeout(()=>i.style.borderColor='',1500);return;}}}
      const nxt=document.getElementById('page-'+(ci+dir));
      const cl=getClasses(dir);
      const delayMs=cssTimeToMs(transitionDelay);
      const track=cur.closest('.form-pages-track');
      track.style.minHeight=cur.offsetHeight+'px';
      cur.style.animationDuration=transitionDuration;
      nxt.style.animationDuration=transitionDuration;
      cur.classList.add(cl.out);
      cur.addEventListener('animationend',()=>{
        cur.style.display='none';cur.classList.remove(cl.out);
        setTimeout(()=>{
          nxt.style.display='block';nxt.classList.add(cl.in);
          nxt.addEventListener('animationend',()=>{
            nxt.classList.remove(cl.in);
            track.style.minHeight=nxt.offsetHeight+'px';
          },{once:true});
        },delayMs);
      },{once:true});
      updateProgress(ci+dir);window.scrollTo({top:0,behavior:'smooth'});
    }
    document.getElementById('multi-step-form').addEventListener('submit',function(e){
      e.preventDefault();
      document.querySelector('.form-page:not([style*="none"])').style.display='none';
      document.querySelector('.progress-bar').style.display='none';
      document.querySelector('.success-message').style.display='block';
    });
    updateProgress(0);
  <\/script>`;
  }
}

