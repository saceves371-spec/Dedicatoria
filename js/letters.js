/* The collection lives in letters-data.js; adding a letter does not change navigation. */
(() => {
    const root = document.createElement('section');
    root.className = 'letter-library';
    root.hidden = true;
    root.setAttribute('aria-label', 'Videos y cartas');
    document.querySelector('.app').append(root);
    const envelope = '<span class="envelope" aria-hidden="true"><span class="letter-peek"></span><span class="envelope-pocket"></span><span class="envelope-flap"></span><span class="wax-seal">♥</span></span>';
    let selectVideos;
    let opening = false;
    let currentCard;
    let generation = 0;
    let returning = false;
    let letterIndex = 0;
    let browsing = false;
    const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    function render(markup) {
        generation++;
        root.innerHTML = markup;
        root.scrollTop = 0;
        opening = false;
    }
    function focusHeading() { root.querySelector('h1, h2')?.focus({preventScroll:true}); }
    async function returnHome() {
        if (returning) return;
        returning = true;
        root.querySelectorAll('button').forEach(button => button.disabled = true);
        root.querySelector('.letters-page')?.classList.add('returning-out');
        await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 550));
        home();
        returning = false;
    }
    function home(first = false) {
        // Read the actual box opening before the gift moves into the background.
        const box = document.querySelector('.gift-base').getBoundingClientRect();
        const mouth = {x: box.left + box.width / 2, y: box.top + 5};
        document.dispatchEvent(new CustomEvent('library-home', {detail: {first}}));
        render(`<div class="library-home ${first ? 'first-reveal' : ''}"><p class="library-eyebrow">UN PEQUEÑO REGALO PARA TI</p><h1 tabindex="-1">Te tengo algo</h1><p class="library-subtitle">¿Qué quieres abrir?</p><div class="surprise-options"><button type="button" class="surprise-option" data-route="videos"><span class="library-cd" aria-hidden="true"></span><span>Videos</span><small>Recuerdos para volver a sentir</small></button><button type="button" class="surprise-option" data-route="letters">${envelope}<span>Cartas</span><small>Palabras para leer con calma</small></button></div></div>`);
        if (!first) root.querySelector('.library-home').classList.add('returning-in');
        else {
            root.querySelectorAll('.surprise-option').forEach((button, index) => {
                const artwork = button.querySelector('.library-cd, .envelope');
                const bounds = artwork.getBoundingClientRect();
                const x = bounds.left + bounds.width / 2;
                const y = bounds.top + bounds.height / 2;
                artwork.classList.add('emerging-from-gift');
                button.disabled = true;
                const token = generation;
                const start = performance.now();
                const lift = Math.min(100, innerHeight * .14);
                // A single curved path avoids the stop at the old intermediate keyframe.
                function frame(now) {
                    if (token !== generation) return;
                    const t = reducedMotion() ? 1 : Math.min(1, Math.max(0, (now - start - index * 100) / 3100));
                    const u = t * t * (3 - 2 * t), v = 1 - u;
                    const px = v*v*v*mouth.x + 3*v*v*u*mouth.x + 3*v*u*u*x + u*u*u*x;
                    const py = v*v*v*mouth.y + 3*v*v*u*(mouth.y-lift) + 3*v*u*u*(y-25) + u*u*u*y;
                    artwork.style.transform = `translate(${px-x}px, ${py-y}px) scale(${.42 + .58*u})`;
                    artwork.style.opacity = String(Math.min(1, t / .2));
                    // The front edge of the moving box occludes the emerging objects.
                    // Keep the light behind them without drawing over the box face.
                    const scale = .42 + .58*u;
                    const lip = document.querySelector('.gift-base').getBoundingClientRect().top;
                    const hiddenBottom = Math.max(0, Math.min(bounds.height, (py + bounds.height*scale/2 - lip) / scale));
                    artwork.style.clipPath = `inset(0 0 ${hiddenBottom}px 0)`;
                    if (t < 1) requestAnimationFrame(frame);
                    else {
                        artwork.classList.remove('emerging-from-gift');
                        artwork.style.removeProperty('transform');
                        artwork.style.removeProperty('opacity');
                        artwork.style.removeProperty('clip-path');
                        button.disabled = false;
                    }
                }
                frame(start);
            });
        }
        root.querySelector('[data-route="videos"]').onclick = async () => {
            document.dispatchEvent(new Event('library-leave'));
            root.querySelectorAll('button').forEach(button => button.disabled = true);
            const discBounds = root.querySelector('.library-cd').getBoundingClientRect();
            const movingDisc = document.createElement('span');
            movingDisc.className = 'library-cd departing-disc';
            Object.assign(movingDisc.style, {position:'fixed', width:`${discBounds.width}px`, height:`${discBounds.height}px`, left:`${discBounds.left}px`, top:`${discBounds.top}px`});
            root.append(movingDisc);
            root.querySelector('.library-cd').style.visibility = 'hidden';
            root.querySelector('.library-home').classList.add('leaving-library');
            movingDisc.getBoundingClientRect();
            movingDisc.style.left = `${(document.documentElement.clientWidth - discBounds.width) / 2}px`;
            await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 900));
            const finalBounds = movingDisc.getBoundingClientRect();
            root.hidden = true;
            const resolve = selectVideos;
            selectVideos = null;
            resolve?.({x: document.documentElement.clientWidth / 2, y: finalBounds.top + finalBounds.height / 2, width: finalBounds.width});
        };
        root.querySelector('[data-route="letters"]').onclick = async () => {
            document.dispatchEvent(new Event('library-leave'));
            root.querySelectorAll('button').forEach(button => button.disabled = true);
            const original = root.querySelector('.envelope');
            const bounds = original.getBoundingClientRect();
            const movingEnvelope = original.cloneNode(true);
            movingEnvelope.classList.add('departing-envelope');
            Object.assign(movingEnvelope.style, {position: 'fixed', width: `${bounds.width}px`, height: `${bounds.height}px`, left: `${bounds.left}px`, top: `${bounds.top}px`});
            root.append(movingEnvelope);
            original.style.visibility = 'hidden';
            root.querySelector('.library-home').classList.add('leaving-library');
            movingEnvelope.getBoundingClientRect();
            movingEnvelope.style.left = `${(document.documentElement.clientWidth - bounds.width) / 2}px`;
            await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 850));
            movingEnvelope.classList.add('envelope-arriving');
            await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 350));
            collection();
            root.querySelector('.letters-page').classList.add('collection-arriving');
        };
        focusHeading();
    }
    function collection() {
        document.dispatchEvent(new Event('library-leave'));
        render('<div class="letters-page"><button class="letter-back" type="button">‹ Videos y cartas</button><header><p class="library-eyebrow">GUARDADAS PARA TI</p><h1 tabindex="-1">Cartas para ti</h1><p>Hay palabras que merecen su propio lugar.</p></header><div class="letter-grid"></div><p class="collection-footer">Abre un sobre. Tómate tu tiempo.</p></div>');
        root.querySelector('.letter-back').onclick = returnHome;
        browsing = false;
        const grid = root.querySelector('.letter-grid');
        grid.innerHTML = '<button type="button" class="letter-arrow previous" aria-label="Carta anterior">‹</button><div class="letter-stack"><div class="stack-back" aria-hidden="true">'+envelope+'</div></div><button type="button" class="letter-arrow next" aria-label="Carta siguiente">›</button><p class="letter-count" aria-live="polite"></p>';
        function showCard() {
            const letter = window.dedicationLetters[letterIndex];
            grid.querySelector('.letter-card')?.remove();
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'letter-card';
            card.innerHTML = envelope + '<span class="letter-card-title"></span><span class="open-letter-label">Abrir carta</span>';
            card.querySelector('.letter-card-title').textContent = letter.date || letter.title;
            if (!letter.paragraphs?.length) {
                card.disabled = true;
                card.querySelector('.open-letter-label').textContent = 'Próximamente';
                card.setAttribute('aria-label', `${letter.date}: carta pendiente de contenido`);
            }
            card.onclick = () => { if (!browsing) openLetter(letter, card); };
            grid.querySelector('.letter-stack').append(card);
            grid.querySelector('.letter-count').textContent = `${letterIndex + 1} de ${window.dedicationLetters.length}`;
            grid.querySelectorAll('.letter-arrow').forEach(button => button.disabled = window.dedicationLetters.length < 2);
        }
        async function turn(direction) {
            if (browsing || opening || window.dedicationLetters.length < 2) return;
            browsing = true;
            const token = generation;
            const stack = grid.querySelector('.letter-stack');
            stack.classList.add(direction > 0 ? 'turn-next' : 'turn-previous');
            grid.querySelectorAll('button').forEach(button => button.disabled = true);
            await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 950));
            if (token !== generation) return;
            letterIndex = (letterIndex + direction + window.dedicationLetters.length) % window.dedicationLetters.length;
            stack.classList.remove('turn-next', 'turn-previous');
            showCard();
            browsing = false;
        }
        grid.querySelector('.previous').onclick = () => turn(-1);
        grid.querySelector('.next').onclick = () => turn(1);
        showCard();
        focusHeading();
    }
    async function openLetter(letter, card) {
        if (opening) return;
        opening = true;
        currentCard = letter.id;
        const token = generation;
        card.classList.add('opening');
        card.disabled = true;
        await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 1400));
        if (token !== generation || root.hidden) return;
        render('<div class="letter-reading"><button type="button" class="letter-close" aria-label="Cerrar carta y volver a las cartas">×</button><article class="letter-paper"><p class="paper-eyebrow">UNA CARTA PARA TI</p><h2 tabindex="-1"></h2><div class="letter-rule">❦</div><div class="letter-copy"></div><span class="letter-end" aria-hidden="true">♡</span></article><button class="letter-back reading-back" type="button">‹ Volver a las cartas</button></div>');
        root.querySelector('h2').textContent = letter.title;
        for (const paragraph of letter.paragraphs) {
            const p = document.createElement('p');
            p.textContent = paragraph;
            if (paragraph.length < 90) p.className = 'letter-emphasis';
            root.querySelector('.letter-copy').append(p);
        }
        if (letter.photo) {
            const photo = document.createElement('img');
            photo.className = 'letter-photo';
            photo.src = letter.photo.src;
            photo.alt = letter.photo.alt;
            photo.width = 1280;
            photo.height = 960;
            photo.loading = 'lazy';
            root.querySelector('.letter-paper').append(photo);
        }
        root.querySelectorAll('.letter-close, .reading-back').forEach(button => button.onclick = closeLetter);
        focusHeading();
    }
    function closeLetter() {
        collection();
        root.querySelector('.letter-card')?.focus({preventScroll:true});
    }
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || root.hidden) return;
        if (root.querySelector('.letter-reading')) closeLetter();
        else if (root.querySelector('.letters-page')) returnHome();
    });
    window.letterLibrary = {
        open(first = false) {
            root.hidden = false;
            home(first);
            return new Promise(resolve => { selectVideos = resolve; });
        }
    };
})();
