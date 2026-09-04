// Basith Salman Personal Website - Main Application Script

document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    initTerminalTyping();
    initScreenerDemo();
    initPortfolioFilters();
});

/* Ambient Canvas Particle Network */
function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor(width / 25), 45);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.8 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* Hero Terminal Typing Simulation */
function initTerminalTyping() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const commands = [
        "python3 bioquant_screener.py --live-stream",
        "make -j8 EXTRA_CFLAGS='-O3 -march=native'",
        "systemctl status security-sentinel.service",
        "git log -n 1 --stat"
    ];

    let cmdIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentCmd = commands[cmdIndex];
        
        if (isDeleting) {
            textElement.textContent = currentCmd.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentCmd.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 30 : 70;

        if (!isDeleting && charIndex === currentCmd.length) {
            speed = 2500; // Pause at end of command
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            cmdIndex = (cmdIndex + 1) % commands.length;
            speed = 500;
        }

        setTimeout(type, speed);
    }
    type();
}

/* Portfolio Projects Filter */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* Live Demo Switcher */
function switchToDemo(demoKey, event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    const tabs = document.querySelectorAll('.demo-tab-btn');
    const wrappers = document.querySelectorAll('.demo-wrapper');

    tabs.forEach(tab => tab.classList.remove('active'));
    wrappers.forEach(w => w.classList.remove('active'));

    const selectedTab = document.getElementById(`tab-${demoKey}`);
    const selectedWrapper = document.getElementById(`demo-${demoKey}`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedWrapper) selectedWrapper.classList.add('active');

    const demosSection = document.getElementById('demos');
    if (demosSection) {
        demosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* Quant Screener Demo Data & Engine */
const screenerData = [
    { ticker: "BIIB", name: "Biogen Inc.", sector: "Biotech", price: 218.45, change: +2.4, rsi: 58.2, volume: "1.2M", score: "94/100", status: "BUY" },
    { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Tech", price: 128.60, change: +4.1, rsi: 67.5, volume: "42.8M", score: "98/100", status: "BUY" },
    { ticker: "AAPL", name: "Apple Inc.", sector: "Tech", price: 224.30, change: -0.8, rsi: 49.1, volume: "28.5M", score: "88/100", status: "HOLD" },
    { ticker: "LMT", name: "Lockheed Martin", sector: "Defense", price: 540.10, change: +1.6, rsi: 62.4, volume: "850K", score: "91/100", status: "BUY" },
    { ticker: "MRNA", name: "Moderna Inc.", sector: "Biotech", price: 79.20, change: -3.2, rsi: 41.0, volume: "3.4M", score: "82/100", status: "HOLD" },
    { ticker: "MS", name: "Morgan Stanley", sector: "FinTech", price: 98.75, change: +1.1, rsi: 55.8, volume: "5.1M", score: "90/100", status: "BUY" },
    { ticker: "JPM", name: "JPMorgan Chase", sector: "FinTech", price: 212.90, change: +0.9, rsi: 57.3, volume: "8.9M", score: "93/100", status: "BUY" }
];

function initScreenerDemo() {
    renderScreenerTable(screenerData);
    
    // Auto-update price fluctuations every 3.5 seconds
    setInterval(() => {
        screenerData.forEach(item => {
            const delta = (Math.random() - 0.48) * 1.5;
            item.price = Math.max(10, parseFloat((item.price + delta).toFixed(2)));
            item.change = parseFloat((item.change + (delta > 0 ? 0.15 : -0.15)).toFixed(1));
        });
        const activeSearch = document.getElementById('screener-search')?.value || '';
        if (!activeSearch) {
            renderScreenerTable(screenerData);
        }
    }, 3500);
}

function renderScreenerTable(data) {
    const tbody = document.getElementById('screener-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach(item => {
        const isUp = item.change >= 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ticker-symbol">${item.ticker}</td>
            <td><strong>${item.name}</strong><br><span style="color:var(--text-dim);font-size:0.8rem;">${item.sector}</span></td>
            <td>$${item.price.toFixed(2)}</td>
            <td class="${isUp ? 'price-up' : 'price-down'}">${isUp ? '+' : ''}${item.change}%</td>
            <td>${item.rsi}</td>
            <td>${item.volume}</td>
            <td><strong style="color:var(--accent-cyan);">${item.score}</strong></td>
            <td><span class="status-tag ${item.status === 'BUY' ? 'status-buy' : 'status-hold'}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function filterScreener() {
    const searchValue = document.getElementById('screener-search').value.toUpperCase();
    const sectorValue = document.getElementById('sector-filter').value;

    const filtered = screenerData.filter(item => {
        const matchesSearch = item.ticker.includes(searchValue) || item.name.toUpperCase().includes(searchValue);
        const matchesSector = sectorValue === 'all' || item.sector.toLowerCase().includes(sectorValue.toLowerCase());
        return matchesSearch && matchesSector;
    });

    renderScreenerTable(filtered);
}

function refreshScreenerData() {
    screenerData.forEach(item => {
        item.price = parseFloat((item.price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2));
    });
    renderScreenerTable(screenerData);
}

/* Security Sentinel CLI Simulator */
function clearSentinelTerm() {
    const output = document.getElementById('sentinel-output');
    if (output) output.innerHTML = '';
}

function triggerSentinelScan() {
    const output = document.getElementById('sentinel-output');
    if (!output) return;

    const timestamp = new Date().toLocaleTimeString();

    const logs = [
        `[${timestamp}] [AUDIT] Initiating full system socket & process memory scan...`,
        `[${timestamp}] [NETWORK] Checked 14 active open sockets (127.0.0.1, 0.0.0.0:8080).`,
        `[${timestamp}] [SENTINEL] Zero unauthorized outbound reverse shell connections detected.`,
        `[${timestamp}] [GIT GUARDIAN] Audited 4 git repositories in local workspace.`,
        `[${timestamp}] [SUCCESS] Environment audit completed with 0 warnings.`
    ];

    logs.forEach((logText, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = index === logs.length - 1 ? 'log-entry success' : 'log-entry info';
            div.textContent = logText;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }, index * 400);
    });
}

/* Copy Email Helper */
function copyEmail() {
    const email = "basithsalman@mindspring.com";
    navigator.clipboard.writeText(email).then(() => {
        alert("Copied email address to clipboard: " + email);
    });
}

/* RWA Code Viewer Switcher */
function switchCodeFile(fileKey) {
    const codeTabs = document.querySelectorAll('.code-tab-btn');
    const codeBlocks = document.querySelectorAll('.code-block');

    codeTabs.forEach(t => t.classList.remove('active'));
    codeBlocks.forEach(b => b.classList.remove('active'));

    const selectedTab = document.getElementById(`codetab-${fileKey}`);
    const selectedBlock = document.getElementById(`codeblock-${fileKey}`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedBlock) selectedBlock.classList.add('active');
}
