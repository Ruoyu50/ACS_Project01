const curtain = document.getElementById('curtain');
const dot = document.getElementById('dot');

const MOVE_MARGIN = 0.1;    // fraction of the viewport kept clear on each side
const MIN_MOVE = 0.3;       // fraction of the viewport's shorter side
const CENTER_CLEARANCE = 100; // px kept clear around the screen center
const MAX_TRIES = 100;
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
    const midX = w / 2;
    const midY = h / 2;
    const halfW = w * (0.5 - MOVE_MARGIN);
    const halfH = h * (0.5 - MOVE_MARGIN);
    const minDistance = MIN_MOVE * Math.min(w, h);
    // The margin-area corners are the farthest points from the center, so on a
    // tiny viewport cap the clearance there to keep a valid spot available
    const clearance = Math.min(CENTER_CLEARANCE, Math.hypot(halfW, halfH));

    for (let i = 0; i < MAX_TRIES; i++) {
        const x = midX + (Math.random() * 2 - 1) * halfW;
        const y = midY + (Math.random() * 2 - 1) * halfH;
        if (Math.hypot(x - cx, y - cy) >= minDistance &&
            Math.hypot(x - midX, y - midY) >= clearance) {
            return { x, y };
        }
    }

    // Fallback: the corner farthest from the dot is always valid. It is at least
    // half the margin area's diagonal away, which exceeds minDistance.
    const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({
        x: midX + sx * halfW,
        y: midY + sy * halfH,
    }));
    return corners.reduce((best, c) =>
        Math.hypot(c.x - cx, c.y - cy) > Math.hypot(best.x - cx, best.y - cy) ? c : best);
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

function dropCurtain() {
    curtain.classList.add('dropping');
    curtain.addEventListener('animationend', (event) => {
        if (event.target === curtain) curtain.remove();
    });
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
    } else if (event.propertyName === 'opacity' && state.gone) {
        dropCurtain();
    }
}

window.addEventListener('pointermove', showDot, { once: true });
dot.addEventListener('pointerenter', onEnter);
dot.addEventListener('pointerleave', onLeave);
dot.addEventListener('click', onClick);
dot.addEventListener('transitionend', onTransitionEnd);
