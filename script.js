document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // LUCIDE ICONS — Initialize immediately on DOM ready, then re-run after
    // preloader fades out so dynamically-revealed elements also get icons.
    // =========================================================================
    function initIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    initIcons(); // First pass — catches everything already in DOM

    /* ==========================================================================
       1. THEME TOGGLE (Dark / Light Mode)
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const iconLight = themeToggle ? themeToggle.querySelector('.theme-icon-light') : null;
    const iconDark = themeToggle ? themeToggle.querySelector('.theme-icon-dark') : null;

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (iconLight && iconDark) {
            if (theme === 'light') {
                iconLight.style.display = 'none';
                iconDark.style.display = 'block';
            } else {
                iconLight.style.display = 'block';
                iconDark.style.display = 'none';
            }
        }
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }

    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setTheme(savedTheme);
    } catch (e) {}

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    /* ==========================================================================
       2. PARTICLE SYSTEM (Canvas)
       ========================================================================== */
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = window.innerWidth < 768 ? 25 : 55;
        const connectionDistance = 120;
        const mouseDistance = 150;
        let mouse = { x: null, y: null };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.15;
                const colors = [
                    '255, 182, 217',
                    '217, 182, 255',
                    '240, 217, 181'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
                if (mouse.x != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouseDistance) {
                        const force = (mouseDistance - distance) / mouseDistance;
                        this.x -= dx * force * 0.02;
                        this.y -= dy * force * 0.02;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(${this.color}, 0.25)`;
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowBlur = 0;
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 182, 217, ${0.08 * (1 - distance / connectionDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    }

    /* ==========================================================================
       3. PRELOADER
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    const progress = document.getElementById('preloader-progress');
    let width = 0;
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
    setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    document.body.style.overflow = '';
    triggerEntryAnimations();
    startTypewriter();
    
    setTimeout(() => {
        initIcons();
        lucide.createIcons();
    }, 100);
}, 500);
        } else {
            width += Math.floor(Math.random() * 12) + 4;
            if (width > 100) width = 100;
            progress.style.width = width + '%';
        }
    }, 100);

    /* ==========================================================================
       4. ENTRY ANIMATIONS & SCROLL REVEAL
       ========================================================================== */
    function triggerEntryAnimations() {
        const heroLeft = document.querySelector('.hero-left');
        const heroRight = document.querySelector('.hero-right');
        if (heroLeft) heroLeft.classList.add('reveal');
        if (heroRight) setTimeout(() => heroRight.classList.add('reveal'), 200);
    }

    const revealElements = document.querySelectorAll('.fade-in-up, .fade-in, .scale-in, .slide-left, .slide-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       5. TYPEWRITER EFFECT
       ========================================================================== */
    const typewriterEl = document.getElementById('typewriter-text');
    const phrases = [
        'Full Stack Developer',
        'Frontend Designer',
        'C++ Engineer',
        'WordPress Expert',
        'UI/UX Enthusiast'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typewriterStarted = false;

    function typeLoop() {
        if (!typewriterEl) return;
        const currentPhrase = phrases[phraseIndex];

        if (!isDeleting) {
            typewriterEl.textContent = currentPhrase.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(typeLoop, 1800);
                return;
            }
        } else {
            typewriterEl.textContent = currentPhrase.slice(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        setTimeout(typeLoop, isDeleting ? 55 : 90);
    }

    function startTypewriter() {
        if (!typewriterStarted) {
            typewriterStarted = true;
            setTimeout(typeLoop, 600);
        }
    }

    /* ==========================================================================
       6. SCROLL PROGRESS BAR
       ========================================================================== */
    const scrollProgressBar = document.getElementById('scroll-progress-bar');

    function updateScrollProgress() {
        if (!scrollProgressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressPct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgressBar.style.width = progressPct + '%';
    }

    /* ==========================================================================
       7. BACK TO TOP BUTTON
       ========================================================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    function handleBackToTop() {
        if (!backToTopBtn) return;
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       8. COUNTER ANIMATION (About Stats)
       ========================================================================== */
    const counters = document.querySelectorAll('.counter');
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'), 10);
                    const duration = 1500;
                    const stepTime = 30;
                    const steps = Math.ceil(duration / stepTime);
                    let current = 0;
                    const increment = target / steps;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        counter.textContent = Math.floor(current);
                    }, stepTime);
                });
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    if (counters.length > 0) {
        const statsParent = counters[0].closest('.about-stats');
        if (statsParent) counterObserver.observe(statsParent);
    }

    /* ==========================================================================
       9. CUSTOM CURSOR
       ========================================================================== */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorDot && cursorOutline) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        const animateOutline = () => {
            const easeFactor = 0.12;
            outlineX += (mouseX - outlineX) * easeFactor;
            outlineY += (mouseY - outlineY) * easeFactor;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateOutline);
        };
        requestAnimationFrame(animateOutline);

        const hoverTargets = document.querySelectorAll(
            'a, button, .btn, .skill-card, .project-card, .social-link-card, .form-input, #menu-toggle, .theme-toggle, .hero-social-icon, .floating-badge, .filter-btn'
        );
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
    }

    /* ==========================================================================
       10. SCROLL EVENTS (header, nav active, progress bar, back-to-top)
       ========================================================================== */
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Scrolled header
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }

        // Scroll progress bar
        updateScrollProgress();

        // Back to top
        handleBackToTop();

        // Active nav link
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 130;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + section.clientHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    /* ==========================================================================
       11. MOBILE NAVIGATION DRAWER
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenuLinks = document.querySelectorAll('.nav-menu a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-active');
        });
    }

    navMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-active');
        });
    });

    /* ==========================================================================
       12. SKILLS PROGRESS BARS
       ========================================================================== */
    const skillProgressBars = document.querySelectorAll('.skill-progress');
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'scaleX(1)';
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    skillProgressBars.forEach(bar => skillsObserver.observe(bar));

    /* ==========================================================================
       13. PROJECT FILTER TABS
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.classList.remove('filter-fade-in');
                    void card.offsetWidth; // Force reflow
                    card.classList.add('filter-fade-in');
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('filter-fade-in');
                }
            });
        });
    });

    /* ==========================================================================
       14. WEB3FORMS CONTACT FORM
       ========================================================================== */
    const contactForm = document.getElementById("contact-form");
    const feedback = document.getElementById("form-feedback");
    const btnText = document.getElementById("btn-text");

    if (contactForm) {
        let isSubmitting = false;

        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (isSubmitting) return;
            isSubmitting = true;

            const submitBtn = contactForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            btnText.textContent = "Sending...";

            const formData = {
                access_key: "7f95b19b-1274-48a8-ae28-7c559f311b55",
                subject: "New Portfolio Contact Message",
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                message: document.getElementById("message").value
            };

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    feedback.className = "form-feedback success";
                    feedback.textContent = "Message sent successfully!";

                    contactForm.reset();
                    btnText.textContent = "Message Sent";

                    setTimeout(() => {
                        btnText.textContent = "Send Message";
                        feedback.textContent = "";
                    }, 4000);
                } else {
                    feedback.className = "form-feedback error";
                    feedback.textContent = "Failed to send message.";
                    btnText.textContent = "Send Message";
                }
            } catch (error) {
                feedback.className = "form-feedback error";
                feedback.textContent = "Something went wrong. Please try again.";
                btnText.textContent = "Send Message";
                console.error(error);
            }

            submitBtn.disabled = false;
            isSubmitting = false;
        });
    }

    /* ==========================================================================
       16. TOAST NOTIFICATION
       ========================================================================== */
    function showToast(message) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div style="
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: linear-gradient(135deg, var(--pink), var(--lavender));
                color: var(--bg-primary);
                padding: 1rem 2rem;
                border-radius: 50px;
                font-family: var(--font-display);
                font-weight: 600;
                font-size: 0.9rem;
                box-shadow: 0 10px 30px rgba(255, 182, 217, 0.3);
                z-index: 10001;
                transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                white-space: nowrap;
                letter-spacing: 0.05em;
            ">${message}</div>
        `;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.querySelector('div').style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.querySelector('div').style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    /* ==========================================================================
       17. SMOOTH SCROLL FOR ANCHOR LINKS
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    /* ==========================================================================
       18. PARALLAX EFFECT FOR HERO IMAGE
       ========================================================================== */
    const heroSection = document.querySelector('.hero-section');
    const heroImage = document.querySelector('.profile-image-container');
    if (heroSection && heroImage && !isTouchDevice) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            heroImage.style.transform = `translate(${x * 10}px, ${y * 10}px) scale(1.02)`;
        });
        heroSection.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'translate(0, 0) scale(1)';
        });
    }

    setTimeout(() => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}, 2000);

});