const dot = document.getElementById('dot');

const MOVE_MARGIN = 0.1;    // fraction of the viewport kept clear on each side
const MIN_MOVE = 0.3;       // fraction of the viewport's shorter side
const FADE_OUT_CLICK = 3;

const state = {
    visible: false,
    hovered: false,
    moving: false,
    gone: false,
    grown: false,
    clicks: 0,
};

function showDot() {
    if (state.visible) return;
    state.visible = true;
    dot.classList.add('visible', 'pulsing');
}

function onEnter() {
    state.hovered = true;
    dot.classList.add('hovered');
}

function onLeave() {
    state.hovered = false;
    dot.classList.remove('hovered');
}

function randomTarget() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rect = dot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const minDistance = MIN_MOVE * Math.min(w, h);
    let x, y;
    do {
        x = w * (MOVE_MARGIN + Math.random() * (1 - 2 * MOVE_MARGIN));
        y = h * (MOVE_MARGIN + Math.random() * (1 - 2 * MOVE_MARGIN));
    } while (Math.hypot(x - cx, y - cy) < minDistance);
    return { x, y };
}

function moveDot() {
    const { x, y } = randomTarget();
    state.moving = true;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
}

function fadeOut() {
    state.gone = true;
    dot.classList.add('gone');
}

function onClick() {
    if (!state.visible || state.moving || state.gone) return;
    state.clicks += 1;
    if (!state.grown) {
        // Stay in the grown state for good after the first click
        state.grown = true;
        dot.classList.add('grown');
    }
    if (state.clicks === FADE_OUT_CLICK) {
        fadeOut();
    } else {
        moveDot();
    }
}

function onTransitionEnd(event) {
    if (event.propertyName === 'left' || event.propertyName === 'top') {
        state.moving = false;
    }
}

window.addEventListener('pointermove', showDot, { once: true });
dot.addEventListener('pointerenter', onEnter);
dot.addEventListener('pointerleave', onLeave);
dot.addEventListener('click', onClick);
dot.addEventListener('transitionend', onTransitionEnd);
