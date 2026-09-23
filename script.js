document.addEventListener("DOMContentLoaded", () => {
    // Background Music Setup
    const bgMusic = new Audio("music.mp3");
    bgMusic.loop = true;
    let musicStarted = false;

    // Click Sound Path
    const clickSoundPath = "click.mp3";

    // Global click sound effect for any mouse click
    document.addEventListener("mousedown", () => {
        const clickSound = new Audio(clickSoundPath);
        clickSound.currentTime = 0;
        clickSound.volume = 0.5; // Lowered from default 1.0
        clickSound.play().catch((err) => {
            console.warn("Click sound play blocked or missing:", err);
        });
    });

    function playMusic() {
        if (!musicStarted) {
            bgMusic.play().then(() => {
                musicStarted = true;
            }).catch((err) => {
                console.warn("Background music autoplay blocked:", err);
            });
        }
    }

    playMusic();
    ["click", "touchstart", "keydown"].forEach((event) => {
        document.addEventListener(event, playMusic, { once: true });
    });

    const oblivionScreen = document.getElementById("oblivion-screen");
    const oblivionText = document.getElementById("oblivion-text");

    function unlockSite() {
        sessionStorage.removeItem("devotion_forgotten");
        if (oblivionScreen) {
            oblivionScreen.classList.remove("locked", "active");
        }
        window.location.reload();
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            unlockSite();
        }
    });

    if (oblivionScreen) {
        oblivionScreen.addEventListener("dblclick", unlockSite);
    }

    if (sessionStorage.getItem("devotion_forgotten") === "true") {
        oblivionText.textContent = "You have no access to this journey anymore.\nClear your browser history to return.";
        oblivionScreen.classList.add("locked"); 
        return; 
    }

    const startScreen = document.getElementById("start-screen");

    const landingHeader = document.getElementById("landing-header");
    const defaultHeader = document.getElementById("default-header");
    const defaultInfoBtn = document.getElementById("default-info-btn");

    const infoBtn = document.getElementById("info-btn");
    const closeBtn = document.getElementById("close-btn");
    const infoModal = document.getElementById("info-modal");
    const infoTypedText = document.getElementById("typed-text");
    const infoCursor = document.getElementById("cursor");
    
    const exitBtn = document.getElementById("exit-btn"); 
    const exitModal = document.getElementById("exit-modal"); 
    const stayBtn = document.getElementById("stay-btn"); 
    const leaveBtn = document.getElementById("leave-btn");
    const exitTypedText = document.getElementById("exit-typed-text");
    const exitCursor = document.getElementById("exit-cursor");

    const introModal = document.getElementById("intro-modal");
    const introTypedText = document.getElementById("intro-typed-text");
    const introCursor = document.getElementById("intro-cursor");
    const nextBtn = document.getElementById("next-btn");
    
    const readyModal = document.getElementById("ready-modal");
    const readyTypedText = document.getElementById("ready-typed-text");
    const readyCursor = document.getElementById("ready-cursor");
    const imReadyBtn = document.getElementById("im-ready-btn");

    // Top Left Hint Text Elements
    const clickDropHint = document.getElementById("click-drop-hint");
    const doneEnoughHint = document.getElementById("done-enough-hint");
    const waitHint = document.getElementById("wait-hint");

    // UI & Story overlay elements
    const textPhase1 = document.getElementById("story-text-phase1");
    const textPhase2 = document.getElementById("story-text-phase2");
    const textPhase3 = document.getElementById("story-text-phase3");

    if (introModal) introModal.style.zIndex = "10";
    if (readyModal) readyModal.style.zIndex = "10";
    if (infoModal) infoModal.style.zIndex = "20";
    if (exitModal) exitModal.style.zIndex = "30";

    const infoText = "Love often starts as a quiet comfort, asking only for a little of your warmth. But some connections demand everything you have to give.\n\n If you wish to leave, hit the exit button now. Otherwise, step inside and discover the true cost of your devotion.";
    const exitText = "To leave is to forget. If you go, the devotion is broken. This choice is permanent. You will lose access to this journey forever unless you manually clear your browser data.\n\nAre you sure?";
    const introText = "In this space, love takes the form of a flame. Just like a real relationship, it needs your devotion to survive.\n\nYour attention here becomes \"love essence\" - small drops of your time and care.";
    const readyText = "Click ▼ to drop this essence.\nYou must keep clicking to feed the flame, maintain its warmth, and stop the love from fading. Watch how it reacts to you.\n\nAre you ready?";
    
    const typingSpeed = 55; 
    const HOLD_DURATION = 1500; 

    let startIntroTimeout = null;
    let startTypewriterTimeout = null;
    let pendingIntroOnExitClose = false;

    let infoTimeout = null;
    let infoIndex = 0;
    
    let exitTimeout = null;
    let exitIndex = 0;

    let introTimeout = null;
    let introIndex = 0;

    let readyTimeout = null;
    let readyIndex = 0;

    let holdTimer = null;

    let currentPhase = 1;
    let currentFireIntensity = 0.001; 
    let targetFireIntensity = 0.001;
    let decayRate = 0.025; 

    let lastClickTime = 0;
    let clickCount = 0;
    let rapidClickCount = 0;

    let phase3ClickCount = 0;
    let lastPhase3ClickTime = 0;
    let clicksDisabled = false;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Clean Typewriter functions (no typing audio calls)
    function typeInfo() {
        if (infoIndex < infoText.length) {
            infoTypedText.textContent += infoText.charAt(infoIndex);
            infoIndex++;
            infoTimeout = setTimeout(typeInfo, typingSpeed);
        } else {
            infoCursor.style.display = "none";
        }
    }

    function typeExit() {
        if (exitIndex < exitText.length) {
            exitTypedText.textContent += exitText.charAt(exitIndex);
            exitIndex++;
            exitTimeout = setTimeout(typeExit, typingSpeed);
        } else {
            exitCursor.style.display = "none";
        }
    }

    function typeIntro() {
        if (introIndex < introText.length) {
            introTypedText.textContent += introText.charAt(introIndex);
            introIndex++;
            introTimeout = setTimeout(typeIntro, typingSpeed);
        } else {
            introCursor.style.display = "none";
        }
    }

    function typeReady() {
        if (readyIndex < readyText.length) {
            readyTypedText.textContent += readyText.charAt(readyIndex);
            readyIndex++;
            readyTimeout = setTimeout(typeReady, typingSpeed);
        } else {
            readyCursor.style.display = "none";
        }
    }

    function openExitModal() {
        if (startIntroTimeout) {
            clearTimeout(startIntroTimeout);
            startIntroTimeout = null;
            pendingIntroOnExitClose = true;
        }
        if (startTypewriterTimeout) {
            clearTimeout(startTypewriterTimeout);
            startTypewriterTimeout = null;
        }

        exitModal.classList.add("active");
        exitTypedText.textContent = "";
        exitIndex = 0;
        exitCursor.style.display = "inline-block"; 
        if (exitTimeout) clearTimeout(exitTimeout);
        setTimeout(typeExit, 350);

        if (doneEnoughHint && currentPhase >= 4) {
            doneEnoughHint.classList.remove("active");
        }
    }

    document.addEventListener("click", function triggerIntro(e) {
        if (e.target.closest('.icon-btn') || 
            e.target.closest('.modal-overlay') || 
            (introModal && introModal.classList.contains("active")) || 
            (readyModal && readyModal.classList.contains("active")) || 
            (exitModal && exitModal.classList.contains("active")) ||
            (infoModal && infoModal.classList.contains("active")) ||
            (startScreen && startScreen.classList.contains("hidden"))) {
            return;
        }

        if (startScreen) startScreen.classList.add("hidden");
        
        startIntroTimeout = setTimeout(() => {
            if ((exitModal && exitModal.classList.contains("active")) || 
                (infoModal && infoModal.classList.contains("active"))) {
                pendingIntroOnExitClose = true;
                return;
            }

            if (introModal) introModal.classList.add("active");
            startTypewriterTimeout = setTimeout(typeIntro, 500);
        }, 1500); 
    });

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (introTimeout) clearTimeout(introTimeout);
            
            introModal.style.transition = "none";
            if (readyModal) readyModal.style.transition = "none";

            introModal.classList.remove("active");
            
            if (readyModal) {
                readyModal.classList.add("active");
                readyTypedText.textContent = "";
                readyIndex = 0;
                readyCursor.style.display = "inline-block";
                
                imReadyBtn.style.opacity = "0";
                imReadyBtn.style.transition = "opacity 0.6s ease-in-out";
                
                void imReadyBtn.offsetWidth; 
                imReadyBtn.style.opacity = "1";

                typeReady();

                setTimeout(() => {
                    introModal.style.transition = "";
                    readyModal.style.transition = "";
                    
                    setTimeout(() => {
                        imReadyBtn.style.transition = "";
                        imReadyBtn.style.opacity = "";
                    }, 600);
                }, 50);
            }
        });
    }

    if (imReadyBtn) {
        imReadyBtn.addEventListener("click", () => {
            readyModal.style.transition = "opacity 0.8s ease-in-out";
            readyModal.classList.remove("active");
            if (readyTimeout) clearTimeout(readyTimeout);

            if (exitBtn) {
                exitBtn.classList.add("default-stage");
            }

            const cursorGap = document.getElementById("cursor-gap");
            if (cursorGap) {
                cursorGap.style.display = "block";
            }

            if (landingHeader && defaultHeader) {
                landingHeader.classList.add("hidden");
                setTimeout(() => {
                    defaultHeader.classList.remove("hidden");
                }, 600);
            }

            setTimeout(() => {
                if (textPhase1) textPhase1.classList.add("active");
                if (clickDropHint) clickDropHint.classList.add("active");
            }, 200);
        });
    }

    function openInstructionModal() {
        if (introTimeout) clearTimeout(introTimeout);

        introModal.style.transition = "";
        introModal.classList.add("active");

        introTypedText.textContent = "";
        introIndex = 0;
        introCursor.style.display = "inline-block";

        setTimeout(typeIntro, 250);
    }

    function openInfoModal() {
        if (startIntroTimeout) {
            clearTimeout(startIntroTimeout);
            startIntroTimeout = null;
            pendingIntroOnExitClose = true;
        }
        if (startTypewriterTimeout) {
            clearTimeout(startTypewriterTimeout);
            startTypewriterTimeout = null;
        }

        infoModal.classList.add("active");
        infoTypedText.textContent = "";
        infoIndex = 0;
        infoCursor.style.display = "inline-block"; 
        if (infoTimeout) clearTimeout(infoTimeout);
        setTimeout(typeInfo, 250);
    }

    if (infoBtn) {
        infoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (exitBtn && exitBtn.classList.contains("default-stage")) {
                openInstructionModal();
            } else {
                openInfoModal();
            }
        });
    }

    if (defaultInfoBtn) {
        defaultInfoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openInstructionModal();
        });
    }

    if (closeBtn && infoModal) {
        closeBtn.addEventListener("click", () => {
            infoModal.classList.remove("active");
            if (infoTimeout) clearTimeout(infoTimeout);
            setTimeout(() => {
                infoTypedText.textContent = "";
                infoIndex = 0;
                infoCursor.style.display = "inline-block"; 
            }, 400); 

            if (pendingIntroOnExitClose && !exitModal.classList.contains("active")) {
                pendingIntroOnExitClose = false;
                introModal.classList.add("active");
                startTypewriterTimeout = setTimeout(typeIntro, 500);
            }
        });
    }

    function startHold(e) {
        if (exitBtn.classList.contains("default-stage")) {
            return;
        }

        e.preventDefault();
        exitBtn.classList.add("holding");
        
        holdTimer = setTimeout(() => {
            exitBtn.classList.remove("holding");
            openExitModal();
        }, HOLD_DURATION);
    }

    function cancelHold() {
        if (exitBtn.classList.contains("default-stage")) {
            return;
        }

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        exitBtn.classList.remove("holding");
    }

    if (exitBtn && exitModal) {
        exitBtn.addEventListener("mousedown", startHold);
        exitBtn.addEventListener("mouseup", cancelHold);
        exitBtn.addEventListener("mouseleave", cancelHold);

        exitBtn.addEventListener("touchstart", startHold);
        exitBtn.addEventListener("touchend", cancelHold);
        exitBtn.addEventListener("touchcancel", cancelHold);
    }

    if (exitBtn) {
        exitBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (exitBtn.classList.contains("default-stage")) {
                
                if (waitHint && waitHint.classList.contains("active")) {
                    return; 
                }

                let hasActiveHint = false;

                if (doneEnoughHint && doneEnoughHint.classList.contains("active")) {
                    doneEnoughHint.classList.remove("active");
                    hasActiveHint = true;
                }
                if (clickDropHint && clickDropHint.classList.contains("active")) {
                    clickDropHint.classList.remove("active");
                    hasActiveHint = true;
                }

                const delay = hasActiveHint ? 800 : 100;
                setTimeout(() => {
                    if (waitHint) {
                        waitHint.classList.add("active");
                        
                        setTimeout(() => {
                            if (oblivionScreen && oblivionText) {
                                oblivionScreen.removeEventListener("dblclick", unlockSite);
                                
                                oblivionText.textContent = "The love you fed has become the cage you wear...";
                                oblivionText.style.fontSize = "1.2rem";
                                
                                oblivionScreen.style.transition = "opacity 1.5s ease-in-out";
                                oblivionText.style.animation = "fadeInText 1.5s forwards";
                                oblivionText.style.animationDelay = "1s";
                                
                                oblivionScreen.classList.add("active");
                                clicksDisabled = true; 
                            }
                        }, 1500); 
                    }
                }, delay);
            }
        });
    }

    if (stayBtn && exitModal) {
        stayBtn.addEventListener("click", () => {
            exitModal.classList.remove("active");
            if (exitTimeout) clearTimeout(exitTimeout);
            setTimeout(() => {
                exitTypedText.textContent = "";
                exitIndex = 0;
                exitCursor.style.display = "inline-block"; 
            }, 400); 

            if (pendingIntroOnExitClose) {
                pendingIntroOnExitClose = false;
                introModal.classList.add("active");
                startTypewriterTimeout = setTimeout(typeIntro, 500);
            }

            if (doneEnoughHint && currentPhase >= 4 && (!waitHint || !waitHint.classList.contains("active"))) {
                doneEnoughHint.classList.add("active");
            }
        });
    }

    if (leaveBtn) {
        leaveBtn.addEventListener("click", () => {
            sessionStorage.setItem("devotion_forgotten", "true");
            oblivionText.textContent = "You have chosen to forget.\nThere is nothing left.";
            oblivionScreen.classList.add("active");
            exitModal.classList.remove("active"); 
        });
    }

    document.addEventListener('mousedown', (e) => {
        const echoCount = 1; 
        const isHoveringGap = e.target.id === 'cursor-gap' || e.target.closest('#cursor-gap');
        const offset = isHoveringGap ? 30 : 10;

        for (let i = 0; i < echoCount; i++) {
            setTimeout(() => {
                const echo = document.createElement('div');
                echo.className = 'click-echo-triangle';
                
                echo.style.left = `${e.clientX - offset}px`;
                echo.style.top = `${e.clientY - offset}px`;
                echo.style.position = 'fixed'; 
                echo.style.pointerEvents = 'none'; 
                echo.style.transformOrigin = '40px 37.5px'; 
                echo.style.animation = 'none'; 
                
                echo.innerHTML = `
                    <svg width="80" height="80" viewBox="0 0 80 80" style="display: block;">
                        <polygon points="20,20 60,20 40,55" 
                                 fill="none" 
                                 stroke="#ffffff" 
                                 stroke-width="1" 
                                 style="filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));" />
                    </svg>
                `;

                document.body.appendChild(echo);

                const anim = echo.animate([
                    { transform: 'scale(0.1)', opacity: 0 },
                    { transform: 'scale(1)', opacity: 0.7, offset: 0.3 }, 
                    { transform: 'scale(3)', opacity: 0 } 
                ], {
                    duration: 2000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                    fill: 'forwards'
                });

                anim.onfinish = () => echo.remove();
            }, i * 400); 
        }
    });

    const canvas = document.createElement('canvas');
    canvas.id = 'flame-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let width, height;
    const particles = [];

    const fireColors = [
        { r: 255, g: 30, b: 0 },   
        { r: 255, g: 90, b: 0 },   
        { r: 255, g: 150, b: 0 },  
        { r: 255, g: 200, b: 50 }  
    ];

    class FireParticle {
        constructor(isEmber = false) {
            this.isEmber = isEmber;
            this.reset(true);
        }

        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? (height - Math.random() * 100) : (height + Math.random() * 30);
            
            if (this.isEmber) {
                this.size = Math.random() * 2 + 1.5;
                this.speedY = 2.5 + Math.random() * 1;
                this.speedX = (Math.random() - 0.5) * 2;
                this.maxLife = 100 + Math.random() * 150;
                this.wobbleSpeed = 0.05 + Math.random() * 0.05;
                this.color = fireColors[Math.floor(Math.random() * fireColors.length)];
            } else {
                this.size = 15 + Math.random() * 60; 
                this.speedY = 1 + Math.random() * 2.5;
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.maxLife = 40 + Math.random() * 100;
                this.wobbleSpeed = 0.02 + Math.random() * 0.01;
                this.color = fireColors[Math.floor(Math.random() * 3.5)];
            }
            
            this.life = 0;
        }

        draw(ctx, intensity) {
            let intensityMultiplier = 0.5 + intensity * 1.0;
            
            this.y -= this.speedY * intensityMultiplier;
            this.x += this.speedX + Math.sin(this.life * this.wobbleSpeed) * (this.isEmber ? 5 : 0.8);

            this.life++;
            
            if (this.life > this.maxLife || this.size <= 0.1) {
                this.reset();
            }

            let lifeRatio = this.life / this.maxLife;

            let currentSize = Math.max(5, this.size * (1 - Math.pow(lifeRatio, 10))) * intensity;
            let alpha = (1 - lifeRatio) * (this.isEmber ? 1 : 0.3) * Math.min(1, intensity * 1.5); 

            if (currentSize <= 0.2 || alpha <= 0.01) return;

            ctx.beginPath();
            
            if (this.isEmber) {
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
                ctx.fill();
            } else {
                let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize);
                grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); 
                grad.addColorStop(0.3, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`); 
                grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`); 
                
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        if (particles.length === 0) {
            for(let i = 0; i < 500; i++) particles.push(new FireParticle(false)); 
            for(let i = 0; i < 150; i++) particles.push(new FireParticle(true));     
        }
    }
    window.addEventListener('resize', resize);
    resize();

    function animateFlame() {
        currentFireIntensity += (targetFireIntensity - currentFireIntensity) * 0.05;
        
        const floor = 0.002; 
        targetFireIntensity = Math.max(floor, targetFireIntensity - decayRate);

        if (currentPhase === 1.5) {
            if (targetFireIntensity < 1.4 && textPhase1 && textPhase1.classList.contains("active")) {
                textPhase1.classList.remove("active");
            }
            if (targetFireIntensity < 1.3 && textPhase2 && !textPhase2.classList.contains("active")) {
                textPhase2.classList.add("active");
                currentPhase = 2; 
            }
        }

        if (currentPhase === 3.5) {
            decayRate = 0.06;

            if (targetFireIntensity < 3.2 && textPhase3 && textPhase3.classList.contains("active")) {
                textPhase3.classList.remove("active");
            }
            
            if (targetFireIntensity < 2.5) {
                currentPhase = 4;
                
                if (clickDropHint) {
                    clickDropHint.classList.remove("active");
                }

                if (doneEnoughHint) {
                    void doneEnoughHint.offsetWidth; 
                    setTimeout(() => {
                        doneEnoughHint.classList.add("active");
                    }, 50);
                }

                if (textPhase3) {
                    textPhase3.innerHTML = "\"You made it this way.<br>You can't just leave!\"";
                    
                    textPhase3.style.position = "absolute";
                    textPhase3.style.left = "15%"; 
                    textPhase3.style.right = "auto";
                    textPhase3.style.top = "48%"; 
                    textPhase3.style.transform = "translateY(-50%)";
                    textPhase3.style.textAlign = "left";
                    
                    textPhase3.style.transition = "none";
                    textPhase3.style.opacity = "0";
                    
                    void textPhase3.offsetWidth; 
                    
                    textPhase3.style.transition = "opacity 2s ease-in-out";
                    
                    setTimeout(() => {
                        textPhase3.classList.add("active");
                        textPhase3.style.opacity = "1";
                    }, 50);

                    setTimeout(() => {
                        textPhase3.style.opacity = "0";
                        textPhase3.classList.remove("active");
                    }, 4500);
                }
            }
        }

        if (currentPhase === 4) {
            decayRate = 0.003;
            targetFireIntensity = Math.max(0.15, targetFireIntensity);
        }

        ctx.clearRect(0, 0, width, height);
        
        ctx.globalCompositeOperation = 'lighter'; 
        particles.forEach(p => p.draw(ctx, currentFireIntensity));
        ctx.globalCompositeOperation = 'source-over'; 
        
        requestAnimationFrame(animateFlame);
    }
    animateFlame();

    document.addEventListener('mousedown', (e) => {
        const isHoveringGap = e.target.id === 'cursor-gap' || e.target.closest('#cursor-gap');
        
        if (isHoveringGap) {
            if (clicksDisabled || currentPhase >= 3.5) {
                return;
            }

            const now = Date.now();

            if (currentPhase === 3) {
                const requiredInterval = phase3ClickCount * 250; 
                if (now - lastPhase3ClickTime < requiredInterval) return;

                phase3ClickCount++;
                lastPhase3ClickTime = now;

                if (phase3ClickCount >= 6) {
                    clicksDisabled = true;
                    currentPhase = 3.5;
                }
            }

            const timeInterval = now - lastClickTime;
            lastClickTime = now;
            clickCount++;

            const isFastClick = timeInterval > 0 && timeInterval < 450; 
            if (isFastClick) {
                rapidClickCount++;
            } else {
                rapidClickCount = Math.max(0, rapidClickCount - 1);
            }

            const dropWrapper = document.createElement('div');
            dropWrapper.className = 'love-essence-drop-wrapper';
            dropWrapper.innerHTML = `<div class="love-essence-drop"></div>`;
            document.body.appendChild(dropWrapper);

            const startX = e.clientX;
            const startY = e.clientY;
            dropWrapper.style.left = `${startX}px`;
            dropWrapper.style.top = `${startY}px`;

            const fallDistance = height - startY;
            
            const anim = dropWrapper.animate([
                { transform: `translate(-50%, 0) scale(0.5)`, opacity: 0 },
                { transform: `translate(-50%, 20px) scale(1)`, opacity: 1, offset: 0.1 },
                { transform: `translate(-50%, ${fallDistance}px) scale(0.8)`, opacity: 0 }
            ], {
                duration: 1200,
                easing: 'ease-in'
            });

            anim.onfinish = () => {
                dropWrapper.remove(); 
                
                if (currentPhase === 1) {
                    targetFireIntensity = 1.5; 
                    decayRate = 0.0045; 
                    currentPhase = 1.5; 
                } 
                else if (currentPhase === 2) {
                    targetFireIntensity = Math.min(3.5, targetFireIntensity + 0.5);
                    decayRate = 0.005; 
                    
                    if (rapidClickCount >= 4) { 
                        currentPhase = 3; 
                        if (textPhase2) textPhase2.classList.remove("active");
                        if (textPhase3) textPhase3.classList.add("active");
                        if (clickDropHint) clickDropHint.classList.remove("active");
                    }
                } 
                else if (currentPhase === 3) {
                    targetFireIntensity = Math.min(3.5, targetFireIntensity + 0.5);
                    decayRate = 0.005; 
                }
            };
        }
    });
}); 
