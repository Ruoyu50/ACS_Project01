const dot = document.getElementById('dot');

const state = {
    visible: false,
};

function showDot() {
    if (state.visible) return;
    state.visible = true;
    dot.classList.add('visible');
}

window.addEventListener('pointermove', showDot, { once: true });
