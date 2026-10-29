const dot = document.getElementById('dot');

const state = {
    visible: false,
    hovered: false,
};

function showDot() {
    if (state.visible) return;
    state.visible = true;
    dot.classList.add('visible');
}

function onEnter() {
    state.hovered = true;
    dot.classList.add('hovered');
}

function onLeave() {
    state.hovered = false;
    // Freeze the pulse at its current scale, then transition back to 1
    dot.style.scale = getComputedStyle(dot).scale;
    dot.classList.remove('hovered');
    void dot.offsetWidth;
    dot.style.scale = '';
}

window.addEventListener('pointermove', showDot, { once: true });
dot.addEventListener('pointerenter', onEnter);
dot.addEventListener('pointerleave', onLeave);
