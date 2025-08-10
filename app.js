// Minimal interactive DNA -> RNA transcription demo
// Clear is better than clever. Only non-obvious comments are kept.

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const ui = {
  dnaInput: qs('#dna-input'),
  strandType: () => document.querySelector('input[name="strandType"]:checked').value,
  orientation: () => document.querySelector('input[name="orientation"]:checked').value,
  btnExample: qs('#btn-example'),
  btnValidate: qs('#btn-validate'),
  btnReset: qs('#btn-reset'),
  btnStep: qs('#btn-step'),
  btnPlay: qs('#btn-play'),
  btnPause: qs('#btn-pause'),
  speed: qs('#speed'),
  speedLabel: qs('#speedLabel'),
  messages: qs('#messages'),
  lanes: {
    template: qs('#template'),
    coding: qs('#coding'),
    mrna: qs('#mrna'),
  },
  pol: qs('#polymerase'),
};

const MAX_LEN = 300;

const DNA = {
  clean(s) {
    return (s || '')
      .toUpperCase()
      .replace(/[^ACGT]/g, '') // keep only DNA bases
      .slice(0, MAX_LEN);
  },
  complementBase(b) {
    switch (b) {
      case 'A': return 'T';
      case 'T': return 'A';
      case 'C': return 'G';
      case 'G': return 'C';
      default: return '';
    }
  },
  rnaPair(b) { // base that pairs with template DNA base into RNA
    switch (b) {
      case 'A': return 'U';
      case 'T': return 'A';
      case 'C': return 'G';
      case 'G': return 'C';
      default: return '';
    }
  }
};

function computeFromInput(raw, strandType, orientation) {
  const seq = DNA.clean(raw);
  if (!seq) throw new Error('Please enter a DNA sequence (A,C,G,T).');

  // Normalize orientation so template is provided 3'->5' left->right for polymerase motion.
  // If user provides template 5'->3', reverse to 3'->5'.
  // If user provides coding strand, build template by complementing coding, then handle orientation.

  let template_3to5 = '';

  if (strandType === 'template') {
    if (orientation === '5to3') {
      template_3to5 = seq.split('').reverse().join('');
    } else {
      template_3to5 = seq;
    }
  } else { // coding provided
    // template is reverse complement of coding orientation specifics:
    // If coding is 5'->3' left->right, template (3'->5') is its complement (left->right) directly.
    // If coding is 3'->5' left->right, first reverse to 5'->3', then complement.
    let coding_5to3 = orientation === '3to5' ? seq.split('').reverse().join('') : seq;
    template_3to5 = coding_5to3.split('').map(DNA.complementBase).join('');
  }

  // Build lanes: template (3'->5'), coding (5'->3'), mrna (5'->3')
  const coding_5to3 = template_3to5.split('').map(DNA.complementBase).join('');
  const mrna_5to3 = template_3to5.split('').map(DNA.rnaPair).reverse().join('');
  // Explanation: polymerase moves along template left->right (3'->5'), RNA grows 5'->3' rightward, which is reverse of template indices.

  return { template_3to5, coding_5to3, mrna_5to3 };
}

function renderLanes({ template_3to5, coding_5to3, mrna_5to3 }) {
  const lanes = ui.lanes;
  const make = (seq, extra='') => seq.split('').map((b, i) => {
    const div = document.createElement('div');
    div.className = `base ${extra}`.trim();
    div.dataset.index = String(i);
    div.textContent = b;
    return div;
  });
  lanes.template.replaceChildren(...make(template_3to5));
  lanes.coding.replaceChildren(...make(coding_5to3, 'cod'));
  lanes.mrna.replaceChildren(...make(''.padEnd(mrna_5to3.length, ' '), 'rna'));

  // Position polymerase tag near first template base
  const tRect = lanes.template.getBoundingClientRect();
  ui.pol.style.top = `${tRect.top + window.scrollY + tRect.height + 6}px`;
  ui.pol.style.left = `${tRect.left + window.scrollX}px`;
}

const state = {
  seqs: null,
  pos: -1, // index on template last read
  playing: false,
  timer: null,
};

function setMessage(msg, type='info') {
  ui.messages.textContent = msg;
  if (type === 'error') ui.messages.style.color = 'var(--err)';
  else if (type === 'warn') ui.messages.style.color = 'var(--warn)';
  else ui.messages.style.color = 'var(--muted)';
}

function validateAndPrepare() {
  try {
    const seqs = computeFromInput(ui.dnaInput.value, ui.strandType(), ui.orientation());
    state.seqs = seqs;
    state.pos = -1;
    state.playing = false;
    clearTimer();
    renderLanes(seqs);
    enablePlayback(true);
    setMessage('Validated. Use Step or Play to transcribe.');
  } catch (e) {
    enablePlayback(false);
    setMessage(e.message, 'error');
  }
}

function enablePlayback(ok) {
  ui.btnStep.disabled = !ok;
  ui.btnPlay.disabled = !ok;
  ui.btnPause.disabled = true;
}

function clearTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

function stepOnce() {
  if (!state.seqs) return;
  const { template_3to5, mrna_5to3 } = state.seqs;
  if (state.pos >= template_3to5.length - 1) return; // done

  // Next template base to read
  const nextIndex = state.pos + 1;
  const base = template_3to5[nextIndex];
  const rnaBase = DNA.rnaPair(base);

  // Highlight template base
  const templateBases = qsa('#template .base');
  templateBases.forEach(b => b.classList.remove('highlight'));
  const tEl = templateBases[nextIndex];
  if (tEl) tEl.classList.add('highlight');

  // Write RNA base at mirrored index from left (since RNA grows 5'->3' to the right)
  const mrnaBases = qsa('#mrna .base');
  const writeIndex = mrnaBases.length - 1 - nextIndex;
  const rEl = mrnaBases[writeIndex];
  if (rEl) {
    rEl.textContent = rnaBase;
    rEl.classList.add('highlight');
    // unhighlight previous RNA
    if (writeIndex + 1 < mrnaBases.length) mrnaBases[writeIndex + 1].classList.remove('highlight');
  }

  // Move polymerase label near the highlighted base horizontally
  const tRect = tEl.getBoundingClientRect();
  ui.pol.style.left = `${tRect.left + window.scrollX}px`;

  state.pos = nextIndex;

  if (state.pos >= template_3to5.length - 1) {
    setMessage('Transcription complete.');
    ui.btnPause.disabled = true;
    state.playing = false;
    clearTimer();
  }
}

function play() {
  if (!state.seqs) return;
  if (state.playing) return;
  state.playing = true;
  ui.btnPause.disabled = false;
  const delay = Number(ui.speed.value);
  clearTimer();
  state.timer = setInterval(() => {
    const { template_3to5 } = state.seqs;
    if (state.pos >= template_3to5.length - 1) { clearTimer(); state.playing = false; ui.btnPause.disabled = true; return; }
    stepOnce();
  }, delay);
}

function pause() { state.playing = false; ui.btnPause.disabled = true; clearTimer(); }

function reset() {
  pause();
  state.seqs = null;
  state.pos = -1;
  enablePlayback(false);
  setMessage('');
  ui.lanes.template.replaceChildren();
  ui.lanes.coding.replaceChildren();
  ui.lanes.mrna.replaceChildren();
}

function loadExample() {
  ui.dnaInput.value = 'ATG CCG TAA GCT';
  qsa('input[name="strandType"]').forEach(r => r.checked = (r.value === 'template'));
  qsa('input[name="orientation"]').forEach(r => r.checked = (r.value === '5to3'));
  setMessage('Example loaded. Click Validate.');
}

function handleSpeed() {
  ui.speedLabel.textContent = `${ui.speed.value} ms/base`;
  if (state.playing) { pause(); play(); }
}

function init() {
  ui.btnExample.addEventListener('click', loadExample);
  ui.btnValidate.addEventListener('click', validateAndPrepare);
  ui.btnReset.addEventListener('click', reset);
  ui.btnStep.addEventListener('click', stepOnce);
  ui.btnPlay.addEventListener('click', play);
  ui.btnPause.addEventListener('click', pause);
  ui.speed.addEventListener('input', handleSpeed);
  handleSpeed();
}

window.addEventListener('load', init);
