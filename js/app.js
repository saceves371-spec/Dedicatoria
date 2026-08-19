/* ===================================================
   PROYECTO: DEDICATORIA
   Archivo: app.js
=================================================== */


/* =========================
   ELEMENTOS
========================= */

const fingerprintButton =
document.getElementById("fingerprint-button");

const fingerprintScreen =
document.getElementById("fingerprint-screen");

const verifiedScreen =
document.getElementById("verified-screen");

const transitionScreen =
document.getElementById("transition-screen");

const dedicationScreen =
document.getElementById("dedication-screen");

const gift =
document.querySelector(".gift");

const revealLight =
document.querySelector(".reveal-light");

const status =
document.getElementById("status");

const progressBar =
document.getElementById("progress-bar");

const percentage =
document.getElementById("percentage");

const cdScene =
document.querySelector(".cd-scene");

const playerScene =
document.querySelector(".player-scene");

const dedicationVideo =
document.getElementById("dedication-video");

const playButton =
    document.querySelector(".player-play");

const rotateScreen = 
    document.querySelector(".rotate-screen");

const videoBack =
    document.querySelector(".video-back");

const videoScene =
    document.querySelector(".video-scene");

const videoPlay =
    document.querySelector(".video-play");

const videoProgressBar =
    document.querySelector(".video-progress-bar");

let videoControlsTimeout;

/* ===================================================
   CONTROLES DEL VIDEO
=================================================== */


/* =========================
   PLAY / PAUSA
========================= */

videoPlay.addEventListener("click", () => {

    if (dedicationVideo.paused) {

        dedicationVideo.play();

        console.log("VIDEO → REPRODUCIENDO");

    } else {

        dedicationVideo.pause();

        console.log("VIDEO → PAUSADO");

    }

});

/* =========================
   ACTUALIZAR BOTÓN PLAY
========================= */

dedicationVideo.addEventListener("play", () => {

    videoPlay.textContent = "❚❚";

    videoPlay.setAttribute(
        "aria-label",
        "Pausar video"
    );

});


dedicationVideo.addEventListener("pause", () => {

    videoPlay.textContent = "▶";

    videoPlay.setAttribute(
        "aria-label",
        "Reproducir video"
    );

});

/* =========================
   RETROCEDER 10 SEGUNDOS
========================= */

videoBack.addEventListener("click", () => {

    dedicationVideo.currentTime =
        Math.max(0, dedicationVideo.currentTime - 10);

    console.log("VIDEO → RETROCEDER 10 SEGUNDOS");

});

/* =========================
   ACTUALIZAR BARRA DE PROGRESO
========================= */

dedicationVideo.addEventListener("timeupdate", () => {

    if (!dedicationVideo.duration) {
        return;
    }

    const progress =
        (dedicationVideo.currentTime /
        dedicationVideo.duration) * 100;

    videoProgressBar.style.width =
        `${progress}%`;

});

/* =========================
   SALTAR EN LA BARRA
========================= */

const videoProgress =
    document.querySelector(".video-progress");


videoProgress.addEventListener("click", (event) => {

    if (!dedicationVideo.duration) {
        return;
    }


    const rect =
        videoProgress.getBoundingClientRect();


    const clickPosition =
        event.clientX - rect.left;


    const percentage =
        clickPosition / rect.width;


    dedicationVideo.currentTime =
        percentage * dedicationVideo.duration;


    console.log(
        "VIDEO → POSICIÓN:",
        Math.round(percentage * 100) + "%"
    );

});

/* =========================
   ARRASTRAR BARRA
========================= */

let draggingProgress = false;


/* =========================
   CALCULAR POSICIÓN
========================= */

function updateVideoProgress(event) {

    if (!dedicationVideo.duration) {
        return;
    }


    const rect =
        videoProgress.getBoundingClientRect();


    let position =
        event.clientX - rect.left;


    position =
        Math.max(0, Math.min(position, rect.width));


    const percentage =
        position / rect.width;


    dedicationVideo.currentTime =
        percentage * dedicationVideo.duration;

}


/* =========================
   INICIAR ARRASTRE
========================= */

videoProgress.addEventListener("mousedown", (event) => {

    draggingProgress = true;

    updateVideoProgress(event);

});


/* =========================
   ARRASTRAR
========================= */

document.addEventListener("mousemove", (event) => {

    if (!draggingProgress) {
        return;
    }

    updateVideoProgress(event);

});


/* =========================
   TERMINAR ARRASTRE
========================= */

document.addEventListener("mouseup", () => {

    draggingProgress = false;

});

/* =========================
   ARRASTRE EN MÓVIL
========================= */

videoProgress.addEventListener("touchstart", (event) => {

    draggingProgress = true;

    updateVideoProgress(event.touches[0]);

}, { passive: true });


videoProgress.addEventListener("touchmove", (event) => {

    if (!draggingProgress) {
        return;
    }

    updateVideoProgress(event.touches[0]);

}, { passive: true });


videoProgress.addEventListener("touchend", () => {

    draggingProgress = false;

});

/* =========================
   MOSTRAR CONTROLES
========================= */

function showVideoControls() {

    videoScene.classList.remove("controls-hidden");

    clearTimeout(videoControlsTimeout);

    videoControlsTimeout =
        setTimeout(() => {

            videoScene.classList.add("controls-hidden");

        }, 3000);

}

/* =========================
   MOSTRAR CONTROLES AL TOCAR
========================= */

videoScene.addEventListener("click", () => {

    showVideoControls();

});

console.log("HUELLA:", fingerprintButton);
console.log("PLAY:", playButton);
console.log("VIDEO:", dedicationVideo);

/* =========================
   VARIABLES
========================= */

let scanning = false;


/* =========================
   INICIAR ESCANEO
========================= */

fingerprintButton.addEventListener("click", () => {

    if (scanning) {
        return;
    }

    scanning = true;

    fingerprintButton.classList.add("scanning");

    status.textContent = "Iniciando escaneo...";

    let progress = 0;


    /* =========================
       PROGRESO DEL ESCANEO
    ========================== */

    const interval = setInterval(() => {

        progress += Math.floor(Math.random() * 4) + 1;

        if (progress >= 100) {
            progress = 100;
        }

        progressBar.style.width = `${progress}%`;

        percentage.textContent = `${progress}%`;


        /* =========================
           MENSAJES
        ========================== */

        if (progress < 25) {

            status.textContent =
            "Detectando huella...";

        } else if (progress < 50) {

            status.textContent =
            "Analizando patrones...";

        } else if (progress < 75) {

            status.textContent =
            "Verificando identidad...";

        } else if (progress < 100) {

            status.textContent =
            "Casi terminamos...";

        } else {

            status.textContent =
            "Identidad confirmada ✓";

        }


        /* =========================
           FINAL DEL ESCANEO
        ========================== */

        if (progress >= 100) {

            clearInterval(interval);

            fingerprintButton.classList.remove("scanning");


            /* =========================
               PANTALLA VERIFICADA
            ========================== */

            setTimeout(() => {

                fingerprintScreen.classList.remove("active");

                verifiedScreen.classList.add("active");


                /* =========================
                   TRANSICIÓN A NEGRO
                ========================== */

                setTimeout(() => {

                    verifiedScreen.classList.remove("active");

                    transitionScreen.classList.add("active");

                    console.log("TRANSITION ACTIVA");
                    console.log(transitionScreen);
                    console.log("CLASES:", transitionScreen.className);


                    /* =========================
                       ENCENDER LUZ
                    ========================== */

                    setTimeout(() => {

                        revealLight.classList.add("show");


                        /* =========================
                           APARECER REGALO
                        ========================== */

                        setTimeout(() => {

                            gift.classList.add("show");


                            /* =========================
                               PRIMER REBOTE
                            ========================== */

                            gift.classList.add("shake");


                            /* =========================
                               SEGUNDO REBOTE
                            ========================== */

                            setTimeout(() => {

                                gift.classList.remove("shake");

                                setTimeout(() => {

                                    gift.classList.add("shake");

                                }, 600);

                            }, 1000);


                            /* =========================
                               APERTURA
                            ========================= */

                            setTimeout(() => {

                                /* =========================
                                   ABSRIR CAJA
                                ========================== */

                                gift.classList.add("open");


                                /* =========================
                                   ESPERAR APERTURA
                                ========================= */

                                setTimeout(() => {


                                    /* =========================
                                       APARECER CD
                                    ========================== */

                                    cdScene.classList.add("cd-visible");

                                    console.log("CD VISIBLE");
                                    console.log("Transition:", transitionScreen.className);
                                    console.log("CD:", cdScene.className);
                                    console.log("Player:", playerScene.className);

                                    setTimeout(() => {

                                        setTimeout(() => {

                                            const transitionContainer =
                                                document.querySelector(".transition-container");

                                            transitionContainer.classList.add("camera-test");

                                            /* =========================
                                               COMENZAR ASCENSO
                                            ========================= */

                                            const cdMovement =
                                                document.querySelector(".cd-movement");

                                            cdMovement.classList.add("cd-rising");


                                            /* =========================
                                               ESPERAR A QUE TERMINE
                                               DE BAJAR EL CD
                                            ========================= */

                                            setTimeout(() => {


                                                /* =========================
                                                   APARECER REPRODUCTOR
                                                ========================= */

                                                playerScene.classList.add("player-visible");


                                                /* =========================
                                                   ESPERAR ANTES DE INSERTAR
                                                ========================= */

                                                setTimeout(() => {

                                                    /* =========================
                                                       ESPERAR A QUE TERMINE
                                                       LA INSERCIÓN DEL CD
                                                    ========================= */

                                                    cdMovement.addEventListener("animationend", (event) => {

                                                        /* Nos aseguramos de que sea
                                                           nuestra animación del CD */

                                                            console.log("ANIMACIÓN TERMINADA");
                                                            console.log("Elemento:", event.target);
                                                            console.log("Animación:", event.animationName);


                                                            if (
                                                                event.animationName !== "cd-insert" &&
                                                                event.animationName !== "cd-insert-mobile"
                                                            ) {

                                                                console.log("NO ES CD-INSERT");

                                                                return;
                                                            }


                                                            console.log("CD TERMINÓ DE INSERTARSE");


                                                        /* =========================
                                                           ESPERAR 1 SEGUNDO
                                                           Y ENCENDER DISC
                                                        ========================= */

                                                        setTimeout(() => {

                                                            const indicatorLight =
                                                                document.querySelector(".indicator-light");

                                                            indicatorLight.classList.add("disc-active");

                                                            console.log("DISC ENCENDIDO");
                                                            

                                                            /* =========================
                                                               ESPERAR 1.5 SEGUNDOS
                                                               Y ENCENDER READY
                                                            ========================= */

                                                            setTimeout(() => {

                                                                const playerStatus =
                                                                    document.querySelector(".player-status");

                                                                playerStatus.classList.add("ready-active");

                                                                /* =========================
                                                                   MOSTRAR INDICACIÓN PLAY
                                                                ========================= */

                                                                const playHint =
                                                                    document.querySelector(".play-hint");

                                                                playHint.classList.add("play-hint-active");

                                                                console.log("READY ENCENDIDO");
                                                                console.log("INDICACIÓN PLAY MOSTRADA");


                                                                /* =========================
                                                                   BOTÓN PLAY
                                                                ========================= */

                                                                playButton.addEventListener("click", () => {

                                                                    console.log("PLAY PRESIONADO");


                                                                    /* =========================
                                                                       CAMBIAR A PANTALLA DE VIDEO
                                                                    ========================= */

                                                                    transitionScreen.classList.remove("active");

                                                                    dedicationScreen.classList.add("active");


                                                                    /* =========================
                                                                       ESCENA DEL VIDEO
                                                                    ========================= */

                                                                    videoScene.classList.add("video-active");


                                                                    /* ===================================================
                                                                       MOBILE — MOSTRAR AVISO DE GIRAR TELÉFONO
                                                                    =================================================== */

                                                                    if (window.innerWidth <= 600) {

                                                                        console.log("MÓVIL — MOSTRANDO AVISO DE ROTACIÓN");


                                                                        /* =========================
                                                                           MOSTRAR ANIMACIÓN
                                                                        ========================= */

                                                                        rotateScreen.classList.add("rotate-active");


                                                                        /* =========================
                                                                           ESPERAR A QUE TERMINE
                                                                           LAS 2 REPETICIONES
                                                                        ========================= */

                                                                        const phoneFrame =
                                                                            rotateScreen.querySelector(".phone-frame");


                                                                        phoneFrame.addEventListener("animationend", (event) => {

                                                                            console.log("ANIMATION END DETECTADO");
                                                                            console.log("Nombre:", event.animationName);
                                                                            console.log("Elemento:", event.target);
                                                                            console.log("Tiempo:", event.elapsedTime);


                                                                            if (event.animationName !== "phone-rotate") {

                                                                                console.log("NO ES PHONE-ROTATE");

                                                                                return;

                                                                            }


                                                                            console.log("PHONE-ROTATE TERMINÓ");


                                                                            rotateScreen.classList.remove("rotate-active");


                                                                            showVideoControls();


                                                                            dedicationVideo.play()
                                                                                .then(() => {

                                                                                    console.log("VIDEO REPRODUCIÉNDOSE");

                                                                                })
                                                                                .catch((error) => {

                                                                                    console.log(
                                                                                        "NO SE PUDO REPRODUCIR EL VIDEO:",
                                                                                        error
                                                                                    );

                                                                                });

                                                                        }, { once: true });
                                                                

                                                                    } else {


                                                                        /* ===================================================
                                                                           DESKTOP — VIDEO INMEDIATO
                                                                        =================================================== */

                                                                        console.log("DESKTOP — VIDEO INMEDIATO");


                                                                        /* =========================
                                                                           MOSTRAR CONTROLES
                                                                        ========================= */

                                                                        showVideoControls();


                                                                        /* =========================
                                                                           REPRODUCIR VIDEO
                                                                        ========================= */

                                                                        dedicationVideo.play()
                                                                            .then(() => {

                                                                                console.log("VIDEO REPRODUCIÉNDOSE");

                                                                            })
                                                                            .catch((error) => {

                                                                                console.log(
                                                                                    "NO SE PUDO REPRODUCIR EL VIDEO:",
                                                                                    error
                                                                                );

                                                                            });

                                                                    }


                                                                });


                                                            }, 1500);


                                                        }, 1000);


                                                    }, { once: true });

                                                    /* =========================
                                                       INSERTAR CD
                                                    ========================= */

                                                    cdScene.classList.add("cd-inserting");


                                                }, 1500);


                                            }, 6000);


                                        }, 4000);


                                    }, 2200);


                                }, 2700);
                            

                            }, 3500);


                        }, 2200);

                    }, 500);

                }, 2500);

            }, 1500);

        }

    }, 120);

});