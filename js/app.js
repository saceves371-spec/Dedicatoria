{
document.documentElement.classList.add('adaptive-sequence');
'use strict';
const $ = selector => document.querySelector(selector);
const fingerprintButton = $('#fingerprint-button');
const fingerprintScreen = $('#fingerprint-screen');
const verifiedScreen = $('#verified-screen');
const transitionScreen = $('#transition-screen');
const dedicationScreen = $('#dedication-screen');
const stage = $('.transition-container');
const gift = $('.gift');
let cdScene = $('.cd-scene');
cdScene.innerHTML = '<span class="library-cd stage-disc" aria-hidden="true"></span>';
let secondDisc;
let selectedIndex = 0;
let choicePanel;
let libraryOrigin;
let cancelChoice;
const libraryBack = document.createElement('button');
libraryBack.className = 'library-back';
libraryBack.textContent = '‹ Videos y cartas';
libraryBack.hidden = true;
transitionScreen.append(libraryBack);
libraryBack.addEventListener('click', async () => {
    if (libraryBack.disabled) return;
    libraryBack.disabled = true;
    stage.classList.add('returning-to-library');
    await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550));
    libraryBack.hidden = true;
    if (cancelChoice) cancelChoice(-1);
    else openLibrary();
    // Keep the fade until the old scene has been removed by its pending selection.
    await Promise.resolve();
    stage.classList.remove('returning-to-library');
    libraryBack.disabled = false;
});
const videos = [
    { title: 'Dedicatoria', src: 'assets/video/dedicatoria.mp4' },
    { title: 'Todo lo que nunca dije', src: 'assets/video/lo-que-nunca-te-dije.mp4' }
];
const playerScene = $('.player-scene');
const dedicationVideo = $('#dedication-video');
const videoScene = $('.video-scene');
const rotateScreen = $('.rotate-screen');
const videoPlay = $('.video-play');
const videoProgress = $('.video-progress');
let videoControlsTimeout;
let scanning = false;
let ready = false;
let changingDisc = false;
const originalPlayHint = $('.play-hint').innerHTML;
const ejectButton = document.createElement('button');
ejectButton.type = 'button';
ejectButton.className = 'player-button player-eject';
ejectButton.setAttribute('aria-label', 'Expulsar disco y elegir otro video');
ejectButton.title = 'Elegir otro video';
ejectButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 4 15h16ZM4 18h16v3H4Z" fill="currentColor"/></svg>';
ejectButton.disabled = true;
$('.player-controls').prepend(ejectButton);
let videoStarted = false;
let scenePhase = 'gift';
let phaseProgress = 0;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const mix = (a, b, t) => a + (b - a) * t;
// Restore the same backdrop from either branch, without replaying the gift opening.
document.addEventListener('library-home', event => {
    const camera = $('.camera-content');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    gift.style.visibility = 'visible';
    camera.style.transition = 'none';
    camera.style.transform = event.detail.first ? 'translateY(0) scale(1)' : 'translateY(85vh) scale(.7)';
    camera.style.opacity = event.detail.first ? '1' : '0';
    camera.getBoundingClientRect();
    camera.style.transition = reduced ? 'none' : 'transform 1.2s cubic-bezier(.22,.61,.36,1), opacity .9s ease';
    if (event.detail.first && !reduced) camera.style.transition = 'transform 2.4s cubic-bezier(.4,0,.2,1) .7s, opacity 2s ease .7s';
    camera.style.transform = 'translateY(30vh) scale(.7)';
    camera.style.opacity = '.45';
});
document.addEventListener('library-leave', () => {
    const camera = $('.camera-content');
    camera.style.transition = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'transform .8s ease, opacity .65s ease';
    camera.style.transform = 'translateY(65vh) scale(.7)';
    camera.style.opacity = '0';
});

// Recompute coordinates per frame so a resized screen keeps the same scene.
function renderScene() {
    if (scenePhase === 'gift' || scenePhase === 'library') return;
    const {width, height} = stage.getBoundingClientRect();
    const playerScale = Math.min(1, (width - 32) / playerScene.offsetWidth,
        height * .38 / playerScene.offsetHeight);
    const discScale = .77 * .8 * Math.min(1, (width - 32) / 220, height / 500);
    const upperY = Math.max(playerScene.offsetHeight * playerScale / 2 + 16, height * .27);
    const lowerY = Math.min(height * .64, height - 110 * discScale - 115);
    const playerY = scenePhase === 'settle' ? mix(upperY, height / 2, phaseProgress)
        : scenePhase === 'lift' ? mix(height / 2, upperY, phaseProgress)
        : scenePhase === 'ready' ? height / 2 : upperY;
    playerScene.style.top = `${playerY}px`;
    playerScene.style.transform = `translate(-50%, -50%) scale(${playerScale})`;
    let y, size = discScale, rotation = 0;
    if (scenePhase === 'travel') {
        y = mix(libraryOrigin?.y ?? height / 2 - Math.min(230, height * .25), lowerY, phaseProgress);
        size = mix((libraryOrigin?.width || 220 * discScale) / 220, discScale, phaseProgress);
        playerScene.style.opacity = '0';
        $('.camera-content').style.transform = `translateY(${(height + gift.offsetHeight) * phaseProgress}px)`;
    } else if (['appear', 'split', 'choose'].includes(scenePhase)) {
        y = lowerY;
        playerScene.style.opacity = ['appear', 'split'].includes(scenePhase) ? String(phaseProgress) : '1';
    } else {
        playerScene.style.opacity = '1';
        const slot = $('.player-slot').getBoundingClientRect();
        const bounds = stage.getBoundingClientRect();
        const slotY = slot.top + slot.height / 2 - bounds.top;
        const t = scenePhase === 'insert' ? phaseProgress : scenePhase === 'eject' ? 1 - phaseProgress : 1;
        y = mix(lowerY, slotY, t);
        // Preserve the spinning disc; shrink only as it enters the slot.
        const shrink = Math.max(0, (t - .6) / .4);
        size *= mix(1, .15, shrink);
        rotation += 660 * t;
        cdScene.style.opacity = String(t < .9 ? 1 : (1 - t) / .1);
    }
    let x = width / 2;
    if (scenePhase === 'travel' && libraryOrigin) x = mix(libraryOrigin.x, x, phaseProgress);
    const spread = Math.min(110, width * .23);
    if (scenePhase === 'split' || scenePhase === 'choose') {
        const progress = scenePhase === 'choose' ? 1 : phaseProgress;
        x -= spread * progress;
        secondDisc.style.left = `${width / 2 + spread * progress}px`;
        secondDisc.style.top = `${lowerY}px`;
        secondDisc.style.opacity = String(progress);
        secondDisc.style.transform = `translate(-50%, -50%) scale(${discScale})`;
        if (choicePanel) {
            choicePanel.style.top = `${lowerY - 90 * discScale}px`;
            choicePanel.style.setProperty('--choice-gap', `${spread * 2}px`);
            choicePanel.style.setProperty('--choice-height', `${180 * discScale + 28}px`);
        }
    } else if (scenePhase === 'insert') {
        x += (selectedIndex === 0 ? -spread : spread) * (1 - phaseProgress);
    }
    cdScene.style.left = `${x}px`;
    cdScene.style.top = `${y}px`;
    cdScene.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${rotation}deg)`;
}
function animateScene(phase, duration) {
    scenePhase = phase;
    stage.classList.remove('discs-floating');
    phaseProgress = 0;
    renderScene();
    return new Promise(resolve => {
        const start = performance.now();
        function frame(now) {
            const elapsed = Math.min(1, (now - start) / duration);
            phaseProgress = elapsed * elapsed * (3 - 2 * elapsed);
            renderScene();
            if (phaseProgress < 1) requestAnimationFrame(frame);
            else resolve();
        }
        requestAnimationFrame(frame);
    });
}
window.addEventListener('resize', renderScene);


async function chooseVideo() {
    secondDisc = cdScene.cloneNode(true);
    secondDisc.classList.remove('cd-visible');
    secondDisc.style.opacity = '0';
    secondDisc.setAttribute('aria-hidden', 'true');
    stage.append(secondDisc);
    choicePanel = document.createElement('div');
    choicePanel.className = 'disc-choices';
    choicePanel.setAttribute('aria-label', 'Selecciona el video que quieres ver');
    videos.forEach((video, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'disc-choice';
        button.dataset.index = index;
        button.innerHTML = `<span>${video.title}</span>`;
        button.setAttribute('aria-label', `Seleccionar ${video.title}`);
        choicePanel.append(button);
    });
    const hint = document.createElement('p');
    hint.className = 'disc-choice-hint';
    hint.textContent = 'Selecciona el video que quieres ver';
    choicePanel.append(hint);
    stage.append(choicePanel);
    await animateScene('split', 900);
    scenePhase = 'choose';
    stage.classList.add('discs-floating');
    renderScene();
    choicePanel.classList.add('choices-visible');
    libraryBack.hidden = false;
    selectedIndex = await new Promise(resolve => {
        cancelChoice = resolve;
        choicePanel.addEventListener('click', event => {
            const button = event.target.closest('button');
            if (!button || choicePanel.dataset.selected) return;
            choicePanel.dataset.selected = 'true';
            choicePanel.querySelectorAll('button').forEach(item => item.disabled = true);
            resolve(Number(button.dataset.index));
        });
    });
    cancelChoice = null;
    libraryBack.hidden = true;
    if (selectedIndex === -1) {
        choicePanel.remove();
        secondDisc.remove();
        openLibrary();
        return false;
    }
    const other = selectedIndex === 0 ? secondDisc : cdScene;
    if (selectedIndex === 1) cdScene = secondDisc;
    choicePanel.classList.remove('choices-visible');
    other.style.transition = 'opacity .5s ease';
    other.style.opacity = '0';
    if (videos[selectedIndex].src) {
        dedicationVideo.src = videos[selectedIndex].src;
        dedicationVideo.load();
    }
    await wait(500);
    choicePanel.remove();
    other.remove();
    return true;
}

async function runSequence() {
    await wait(1500);
    fingerprintScreen.classList.remove('active');
    verifiedScreen.classList.add('active');
    await wait(2500);
    verifiedScreen.classList.remove('active');
    transitionScreen.classList.add('active');
    await wait(500);
    $('.reveal-light').classList.add('show');
    await wait(2200);
    gift.classList.add('show', 'shake');
    await wait(1000);
    gift.classList.remove('shake');
    await wait(600);
    gift.classList.add('shake');
    await wait(1900);
    gift.classList.add('open');
    await wait(2700);
    openLibrary(true);
}

async function openLibrary(first = false) {
    ready = false;
    videoStarted = false;
    changingDisc = false;
    scenePhase = 'library';
    libraryBack.hidden = true;
    dedicationVideo.pause();
    $('.indicator-light').classList.remove('disc-active');
    $('.player-status').classList.remove('ready-active');
    $('.play-hint').classList.remove('play-hint-active');
    playerScene.classList.remove('player-ready');
    ejectButton.disabled = true;
    cdScene.style.opacity = '0';
    playerScene.style.opacity = '0';
    stage.append(cdScene, playerScene);
    cdScene.classList.add('scene-managed');
    playerScene.classList.add('scene-managed');
    libraryOrigin = await window.letterLibrary.open(first);
    gift.style.visibility = 'hidden';
    cdScene.style.opacity = '1';
    $('.camera-content').style.opacity = '0';
    await animateScene('travel', 1200);
    await loadSelectedDisc();
}

async function loadSelectedDisc() {
    $('.play-hint').innerHTML = originalPlayHint;
    $('.player-play').disabled = false;
    if (!await chooseVideo()) return;
    await animateScene('insert', window.innerWidth <= 600 ? 2200 : 1500);
    await animateScene('settle', 1200);
    scenePhase = 'ready';
    renderScene();
    await wait(1000);
    $('.indicator-light').classList.add('disc-active');
    await wait(1500);
    $('.player-status').classList.add('ready-active');
    $('.play-hint').classList.add('play-hint-active');
    playerScene.classList.add('player-ready');
    ready = Boolean(videos[selectedIndex].src);
    changingDisc = false;
    ejectButton.disabled = false;
    libraryBack.hidden = false;
    if (!ready) {
        $('.play-hint').textContent = 'Próximamente';
        $('.player-play').disabled = true;
        $('.player-play').setAttribute('aria-label', 'Segundo video pendiente de agregar');
    }
}
ejectButton.addEventListener('click', async () => {
    if (changingDisc || ejectButton.disabled) return;
    changingDisc = true;
    libraryBack.hidden = true;
    ready = false;
    videoStarted = false;
    ejectButton.disabled = true;
    dedicationVideo.pause();
    $('.indicator-light').classList.remove('disc-active');
    $('.player-status').classList.remove('ready-active');
    $('.play-hint').classList.remove('play-hint-active');
    playerScene.classList.remove('player-ready');
    await animateScene('lift', 1000);
    await animateScene('eject', 1600);
    await loadSelectedDisc();
});
fingerprintButton.addEventListener('click', () => {
    if (scanning) return;
    scanning = true;
    fingerprintButton.classList.add('scanning');
    let progress = 0;
    const timer = setInterval(() => {
        progress = Math.min(100, progress + Math.floor(Math.random() * 4) + 1);
        $('#progress-bar').style.width = `${progress}%`;
        $('#percentage').textContent = `${progress}%`;
        $('#status').textContent = progress < 25 ? 'Detectando huella...'
            : progress < 50 ? 'Analizando patrones...'
            : progress < 75 ? 'Verificando identidad...'
            : progress < 100 ? 'Casi terminamos...' : 'Identidad confirmada ✓';
        if (progress === 100) {
            clearInterval(timer);
            fingerprintButton.classList.remove('scanning');
            runSequence();
        }
    }, 120);
});

function showVideoControls() {
    videoScene.classList.remove('controls-hidden');
    clearTimeout(videoControlsTimeout);
    if (!dedicationVideo.paused && !dedicationVideo.ended) {
        videoControlsTimeout = setTimeout(() => {
            if (!dedicationVideo.paused) videoScene.classList.add('controls-hidden');
        }, 3000);
    }
}
function playVideo() { dedicationVideo.play().catch(showVideoControls); }

async function returnToPlayer() {
    dedicationVideo.pause();
    clearTimeout(videoControlsTimeout);
    rotateScreen.classList.remove('rotate-active');
    // Leave native/browser fullscreen before revealing the player scene.
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (dedicationVideo.webkitDisplayingFullscreen && dedicationVideo.webkitExitFullscreen) {
            dedicationVideo.webkitExitFullscreen();
        }
    } catch { /* The browser may have exited fullscreen automatically. */ }
    videoScene.classList.remove('video-active', 'controls-hidden');
    dedicationScreen.classList.remove('active');
    transitionScreen.classList.add('active');
    videoStarted = false;
    dedicationVideo.currentTime = 0;
    scenePhase = 'ready';
    renderScene();
}
dedicationVideo.addEventListener('ended', returnToPlayer);
const closeVideoButton = document.createElement('button');
closeVideoButton.type = 'button';
closeVideoButton.className = 'video-close';
closeVideoButton.setAttribute('aria-label', 'Cerrar video y volver al reproductor');
closeVideoButton.title = 'Volver al reproductor';
closeVideoButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
closeVideoButton.addEventListener('click', event => {
    event.stopPropagation();
    returnToPlayer();
});
videoScene.append(closeVideoButton);


function finishRotation() {
    if (!rotateScreen.classList.contains('rotate-active')) return;
    rotateScreen.classList.remove('rotate-active');
    playVideo();
    showVideoControls();
}
$('.player-play').addEventListener('click', () => {
    if (!ready || videoStarted) return;
    videoStarted = true;
    transitionScreen.classList.remove('active');
    dedicationScreen.classList.add('active');
    videoScene.classList.add('video-active');
    if (matchMedia('(max-width: 600px) and (orientation: portrait)').matches) {
        rotateScreen.classList.add('rotate-active');
    } else playVideo();
    showVideoControls();
});
$('.phone-frame').addEventListener('animationend', event => {
    if (event.animationName === 'phone-rotate') finishRotation();
});
window.addEventListener('resize', () => {
    if (!matchMedia('(max-width: 600px) and (orientation: portrait)').matches) finishRotation();
});
videoPlay.addEventListener('click', () => {
    if (dedicationVideo.paused) playVideo();
    else dedicationVideo.pause();
});
$('.video-back').addEventListener('click', () => {
    dedicationVideo.currentTime = Math.max(0, dedicationVideo.currentTime - 10);
});
for (const event of ['play', 'pause', 'ended']) {
    dedicationVideo.addEventListener(event, () => {
        videoPlay.textContent = dedicationVideo.paused ? '▶' : '❚❚';
        videoPlay.setAttribute('aria-label', dedicationVideo.paused ? 'Reproducir video' : 'Pausar video');
        showVideoControls();
    });
}
videoScene.addEventListener('click', showVideoControls);
dedicationVideo.addEventListener('timeupdate', () => {
    if (Number.isFinite(dedicationVideo.duration) && dedicationVideo.duration > 0)
        $('.video-progress-bar').style.width = `${dedicationVideo.currentTime / dedicationVideo.duration * 100}%`;
});
function seek(event) {
    if (!Number.isFinite(dedicationVideo.duration) || dedicationVideo.duration <= 0) return;
    const rect = videoProgress.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    dedicationVideo.currentTime = fraction * dedicationVideo.duration;
    showVideoControls();
}
videoProgress.addEventListener('pointerdown', event => {
    videoProgress.setPointerCapture(event.pointerId);
    seek(event);
});
videoProgress.addEventListener('pointermove', event => {
    if (videoProgress.hasPointerCapture(event.pointerId)) seek(event);
});

}

// Fit complete artwork groups without changing their internal proportions.
(function installViewportLayout() {
    const panels = [...document.querySelectorAll('.fingerprint-container, .verified-container, .rotate-content')];
    let pending;
    function fit() {
        if (document.documentElement.classList.contains('reading-letter')) return;
        const width = document.documentElement.clientWidth;
        const height = window.visualViewport?.height || window.innerHeight;
        document.documentElement.style.setProperty('--viewport-height', `${height}px`);
        document.documentElement.style.setProperty('--disc-fit', .8 * Math.min(1, (width - 32) / 220, height / 500));
        document.documentElement.style.setProperty('--stage-scale', Math.min(1, (width - 32) / 360, (height - 32) / 736));
        for (const panel of panels) {
            const scale = Math.min(1, (width - 24) / panel.offsetWidth, (height - 32) / panel.offsetHeight);
            panel.style.scale = String(scale);
        }
        const gift = document.querySelector('.gift');
        if (!document.documentElement.classList.contains('desktop-sequence')) {
            gift.style.scale = String(Math.min(1, (width - 32) / 220, (height - 32) / 360));
        }
    }
    function schedule() { cancelAnimationFrame(pending); pending = requestAnimationFrame(fit); }
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    document.addEventListener('letter-view-change', schedule);
    const observer = new ResizeObserver(schedule);
    panels.forEach(panel => observer.observe(panel));
    schedule();
})();

// Fullscreen is requested directly from a tap, as mobile browsers require.
(function installFullscreenControl() {
    const scene = document.querySelector('.video-scene');
    const video = document.querySelector('#dedication-video');
    const controls = document.querySelector('.video-buttons');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'video-control video-fullscreen';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function update() {
        const active = !!document.fullscreenElement || !!video.webkitDisplayingFullscreen;
        button.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Ver en pantalla completa');
        button.setAttribute('aria-pressed', String(active));
        button.title = button.getAttribute('aria-label');
    }
    button.addEventListener('click', async event => {
        event.stopPropagation();
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
            else if (scene.requestFullscreen && document.fullscreenEnabled) await scene.requestFullscreen();
            else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } catch {
            button.title = 'No se pudo abrir pantalla completa. Intenta de nuevo.';
        }
        scene.classList.remove('controls-hidden');
        update();
    });
    if ((scene.requestFullscreen && document.fullscreenEnabled) || video.webkitEnterFullscreen) {
        controls.append(button);
        document.addEventListener('fullscreenchange', update);
        video.addEventListener('webkitbeginfullscreen', update);
        video.addEventListener('webkitendfullscreen', update);
        update();
    }
})();
