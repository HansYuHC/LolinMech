let currentLanguage = 'en';
let currentPage = 'home';

function changeLanguage(lang) {
    currentLanguage = lang;
    // 如果 currentPage 是空，就用默认页面 'home'
    const safePage = currentPage && currentPage.trim() !== '' ? currentPage : 'home';
    loadPage(safePage);
}

function loadPage(page, forceReload = false) {
    currentPage = page.toLowerCase();
    console.log(`🔄 Loading page: ${currentPage}, language: ${currentLanguage}`);

    if (window.location.hash !== `#${currentPage}`) {
        window.location.hash = `#${currentPage}`;
    } else if (forceReload) {
        // 手动触发一次 hashchange 逻辑
        history.replaceState(null, '', `#${currentPage}`);
    }

    fetch(`locales/${currentLanguage}/${currentPage}.json?t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            document.title = data.pageTitle;

            const headingElement = document.getElementById('page-heading');
            headingElement.textContent = data.welcomeHeading || data.heading || '';

            if (page === 'customers') {
                document.getElementById('content').innerHTML = loadCustomersPage(data);
                window.customersData = data.clients;
            } else if (page === 'home') {
                document.getElementById('content').innerHTML = loadHomePage(data);
            } else if (page === 'about') {
                document.getElementById('content').innerHTML = loadAboutPage(data);
            } else if (page === 'products') {
                document.getElementById('content').innerHTML = loadProductsPage(data);
            } else if (page === 'casting') {
                document.getElementById('content').innerHTML = loadCastingPage(data);
            } else if (page === 'forging') {
                document.getElementById('content').innerHTML = loadForgingPage(data);
            }
            else {
                const paragraphs = data.welcomeText
                    .split("\n\n")
                    .map(p => `<p>${p.trim()}</p>`)
                    .join("");

                document.getElementById('content').innerHTML = `
                    <div class="welcome-wrapper">
                        <div class="welcome-text">${paragraphs}</div>
                    </div>
                    <div class="stats">
                        <p>${data.stats?.employees || ""}</p>
                        <p>${data.stats?.locations || ""}</p>
                    </div>
                `;
            }

            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.getAttribute('data-lang-key');
                if (data[key]) el.textContent = data[key];
            });
        });

    highlightActiveMenu(currentPage);

}


function loadCustomersPage(data) {
    return `
        <section class="customers">
            <h2>${data.heading}</h2>
            <div class="subheading">${data.subheading}</div>
            <div class="client-grid" id="clientGrid">
                ${data.clients.map(client => `
                    <div class="client-logo"
                         data-client="${client.id}"
                         onmouseenter="showClientDetails('${client.id}', event)"
                         onmouseleave="hideClientDetails()">
                        <img src="assets/images/customers/${client.logo}" alt="${client.name}">
                    </div>
                `).join('')}
            </div>
            <div id="clientDetails" class="client-details"></div>
        </section>
    `;
}

function showClientDetails(clientId, event) {
    const client = window.customersData.find(c => c.id === clientId);
    if (!client) return;

    const detailsDiv = document.getElementById('clientDetails');

    const imagesHTML = (client.gallery || [])
        .filter(img => img !== client.logo)
        .map(img =>
            `<img src="assets/images/customers/${img}" alt="${client.name} product">`
        ).join('');

    detailsDiv.innerHTML = `
        <h3>${client.name}</h3>
        <p>${client.description}</p>
        <div class="gallery">${imagesHTML}</div>
    `;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    detailsDiv.style.position = 'absolute';
    detailsDiv.style.left = rect.left + 'px';
    detailsDiv.style.top = (rect.bottom + scrollTop + 5) + 'px';
    detailsDiv.style.display = 'block';
}

function hideClientDetails() {
    const detailsDiv = document.getElementById('clientDetails');
    detailsDiv.style.display = 'none';
}

function loadHomePage(data) {
    const paragraphs = data.welcomeText
        .split('\n\n')
        .map(p => `<p>${p.trim()}</p>`)
        .join('');
    return `
        <section class="home-content">
            <h2 class="section-title">${data.sectionTitle}</h2>
            <div class="welcome-section">
                <div class="welcome-text">
                    ${paragraphs}
                </div>
            </div>
            <div class="company-stats">
                <p>${data.stats.employees}</p>
                <p>${data.stats.locations}</p>
                <img src="assets/images/Lolin-company.png" alt="Company Image" class="company-image">
            </div>
        </section>
    `;
}

function loadAboutPage(data) {
    let html = `
        <section class="about-content">
            <h2 class="section-title">${data.heading}</h2>
    `;

    data.sections.forEach(section => {
        if (section.heading) {
            html += `<h2 class="section-title">${section.heading}</h2>`;
        }

        html += `<div class="about-section">`;

        section.paragraphs.forEach(p => {
            html += `<p>${p}</p>`;
        });

        if (section.images) {
            const isGridLayout = section.images.length >= 4;  // 判断是否使用矩阵样式
    html += `<div class="${isGridLayout ? 'image-grid-3x2' : 'image-row'}">`;

            section.images.forEach(img => {
                html += `
                    <div class="image-block">
                        <img src="${img.src}" alt="${img.caption}">
                        <p class="caption">${img.caption}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;
    });

    html += `</section>`;
    return html;
}

function loadProductsPage(data) {
    const descriptionHTML = Array.isArray(data.description)
        ? data.description.map(p => `<p>${p}</p>`).join('')
        : `<p>${data.description || ''}</p>`;


    const componentsHTML = `
        <section class="component-list">
            <div class="component-card">
                <h3>Engine Components</h3>
                <ul>
                    <li>Crankshaft</li>
                    <li>Flywheel</li>
                    <li>Engine Bracket</li>
                    <li>Turbo Bearing Housing</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Braking Components</h3>
                <ul>
                    <li>Brake Carrier</li>
                    <li>Brake Rotor</li>
                    <li>Brake Caliper</li>
                    <li>Brake Anchor</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Driveline Components</h3>
                <ul>
                    <li>Flange</li>
                    <li>Differential Carrier & Case</li>
                    <li>Slip Yoke</li>
                    <li>Axle Housing</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Suspension Components</h3>
                <ul>
                    <li>Knuckle</li>
                    <li>Control Arm</li>
                    <li>Hitch</li>
                    <li>Spring Hanger</li>
                    <li>Torque Rod</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Transmission & Clutch Components</h3>
                <ul>
                    <li>PTO Housing</li>
                    <li>Range Box Housing</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Plow, Tillage, Seeding Components</h3>
                <ul>
                    <li>Ripper Point</li>
                    <li>Spacer</li>
                    <li>Pivot</li>
                    <li>Shank</li>
                    <li>Boot</li>
                    <li>Opener Arm</li>
                    <li>etc.</li>
                </ul>
            </div>

            <div class="component-card">
                <h3>Other Components</h3>
                <ul>
                    <li>Weight</li>
                    <li>Brake Pedal</li>
                    <li>Hydraulic Cylinder</li>
                    <li>Brake Drum & Wheel Hub</li>
                    <li>Hook</li>
                    <li>Chain Support</li>
                    <li>etc.</li>
                </ul>
            </div>
        </section>
    `;

    const productGalleryHTML = `
    <div class="product-gallery">
        <h3 class="gallery-title">Product Lineup — Typical products producing now</h3>
        <div class="gallery-grid">
            ${Array.from({ length: 25 }, (_, i) => `
                <div class="gallery-item">
                    <img src="assets/images/products/product_${i + 1}.png" alt="Product ${i + 1}">
                </div>
            `).join('')}
        </div>
    </div>
`;

    const linksHTML = Array.isArray(data.links)
        ? data.links.map(link => `
            <button class="product-link-button" onclick="loadPage('${link.target}')">
                ${link.text}
            </button>
        `).join('')
        : '';


    return `
        <section class="products-overview">
            <h2 class="section-heading">${data.heading}</h2>
            <div class="description">
                ${descriptionHTML}
            </div>
            <div class="product-links">
                ${linksHTML}
            </div>
            ${componentsHTML}
            ${productGalleryHTML}
        </section>
    `;
}




function loadCastingPage(data) {
    const paragraphs = data.description
        .split('\n\n')
        .map(p => `<p>${p.trim()}</p>`)
        .join('');

    const materialsHTML = data.materials
        .map(m => `<li>${m}</li>`)
        .join('');

    const imagesHTML = data.images
        .map(img => `<img src="${img.src}" alt="${img.caption}" class="product-image">`)
        .join('');

    return `
        <section class="casting-content">
            <h2 class="section-title">${data.heading}</h2>
            <div class="description">${paragraphs}</div>
            <h3>${data.materialTitle}</h3>
            <ul class="material-list">${materialsHTML}</ul>
            <div class="image-gallery">${imagesHTML}</div>
        </section>
    `;
}


// ✅ 页面加载时，根据 URL hash 判断加载哪个页面
document.addEventListener('DOMContentLoaded', () => {
    const hashPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    loadPage(hashPage);
});

// ✅ 当 hash 变化时（如浏览器前进/后退），自动加载对应页面
window.addEventListener('hashchange', () => {
    const newPage = window.location.hash.substring(1);
    loadPage(newPage);
});

function highlightActiveMenu(page) {
  // 先移除所有 active
  document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));

  // 再为当前页面添加 active
  const current = document.querySelector(`nav a[onclick*="${page}"]`);
  if (current) current.classList.add('active');
}
