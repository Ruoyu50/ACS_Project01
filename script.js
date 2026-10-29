const curtain = document.getElementById('curtain');
const dot = document.getElementById('dot');

const MOVE_MARGIN = 0.1;    // fraction of the viewport kept clear on each side
const MIN_MOVE = 0.3;       // fraction of the viewport's shorter side
const CENTER_CLEARANCE = 100; // px kept clear around the screen center
const MAX_TRIES = 100;
const FADE_OUT_CLICK = 3;

// Finale after the 3rd click
const IMPACT_START_MS = 3500;   // from the 3rd click
const IMPACT_GAP_MS = 700;      // start to start
const SHAKE_MS = 350;
const IMPACTS = [               // max offset (px) and rotation (deg), each stronger
    { offset: 6, rotate: 0.1 },
    { offset: 10, rotate: 0.17 },
    { offset: 14, rotate: 0.24 },
];
const TILT_DEG = 2.5;
const TILT_SWING_MS = 900;
const FINAL_DOT_DELAY_MS = 1000;
const FALL_MS = 1400;
const FALL_EXTRA_DEG = 10;
const REDUCED_FADE_MS = 600;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
    visible: false,
    hovered: false,
    moving: false,
    gone: false,
    grown: false,
    clicks: 0,
    final: false,
    falling: false,
    tilt: 0,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Camera-shake-like jolt that settles back to rest
function shake({ offset: a, rotate: r }) {
    return curtain.animate([
        { translate: '0 0', rotate: '0deg' },
        { translate: `${-0.85 * a}px ${0.5 * a}px`, rotate: `${r}deg`, offset: 0.1 },
        { translate: `${0.6 * a}px ${-0.35 * a}px`, rotate: `${-0.6 * r}deg`, offset: 0.3 },
        { translate: `${-0.3 * a}px ${0.2 * a}px`, rotate: `${0.3 * r}deg`, offset: 0.55 },
        { translate: `${0.1 * a}px ${-0.05 * a}px`, rotate: `${-0.1 * r}deg`, offset: 0.8 },
        { translate: '0 0', rotate: '0deg' },
    ], { duration: SHAKE_MS }).finished;
}

// Swing down onto one nail (top-left pivot) and stay tilted
async function tilt() {
    await curtain.animate([
        { rotate: '0deg', easing: 'ease-in' },
        { rotate: `${TILT_DEG + 0.5}deg`, offset: 0.45, easing: 'ease-in-out' },
        { rotate: `${TILT_DEG - 0.2}deg`, offset: 0.75, easing: 'ease-in-out' },
        { rotate: `${TILT_DEG}deg` },
    ], { duration: TILT_SWING_MS }).finished;
    curtain.style.rotate = `${TILT_DEG}deg`;
    state.tilt = TILT_DEG;
}

function showFinalDot() {
    // The tilted curtain is the dot's containing block, so map the screen
    // center into curtain coordinates (inverse rotation about the top-left)
    const t = state.tilt * Math.PI / 180;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    state.final = true;
    state.hovered = false;
    dot.className = 'final';
    dot.style.left = `${cx * Math.cos(t) + cy * Math.sin(t)}px`;
    dot.style.top = `${-cx * Math.sin(t) + cy * Math.cos(t)}px`;
}

async function runFinale() {
    await wait(IMPACT_START_MS);
    if (!reducedMotion.matches) {
        for (let i = 0; i < IMPACTS.length; i++) {
            if (i > 0) await wait(IMPACT_GAP_MS - SHAKE_MS);
            await shake(IMPACTS[i]);
        }
        await tilt();
    }
    await wait(FINAL_DOT_DELAY_MS);
    showFinalDot();
}

// Falls like a frame coming off the wall, revealing the scene
async function dropCurtain() {
    state.falling = true;
    const animation = reducedMotion.matches
        ? curtain.animate([{ opacity: 1 }, { opacity: 0 }],
            { duration: REDUCED_FADE_MS, easing: 'ease-out', fill: 'forwards' })
        : curtain.animate([
            { translate: '0 0', rotate: `${state.tilt}deg` },
            { translate: '0 102%', rotate: `${state.tilt + FALL_EXTRA_DEG}deg` },
        ], { duration: FALL_MS, easing: 'cubic-bezier(0.11, 0, 0.5, 0)', fill: 'forwards' });
    await animation.finished;
    curtain.remove();
}

function onClick() {
    if (state.final) {
        if (!state.falling) dropCurtain();
        return;
    }
    if (!state.visible || state.moving || state.gone) return;
    state.clicks += 1;
    if (!state.grown) {
        // Stay in the grown state for good after the first click
        state.grown = true;
        dot.classList.add('grown');
    }
    if (state.clicks === FADE_OUT_CLICK) {
        fadeOut();
        runFinale();
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
