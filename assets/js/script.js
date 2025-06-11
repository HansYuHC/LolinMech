let currentLanguage = 'en';
let currentPage = 'home';

function changeLanguage(lang) {
    currentLanguage = lang;
    loadPage(currentPage);  // 保持当前页面，只换语言
}

function loadPage(page) {
    currentPage = page.toLowerCase();

    // 修改 hash（不会重复写入同样 hash）
    if (window.location.hash !== `#${currentPage}`) {
        window.location.hash = `#${currentPage}`;
    }

    fetch(`locales/${currentLanguage}/${currentPage}.json`)
        .then(response => response.json())
        .then(data => {
            document.title = data.pageTitle;

            // 设置标题内容到 header
            const headingElement = document.getElementById('page-heading');
            headingElement.textContent = data.welcomeHeading || data.heading || '';

            if (page === 'customers') {
                document.getElementById('content').innerHTML = loadCustomersPage(data);
                window.customersData = data.clients;
            } else if (page === 'home') {
                document.getElementById('content').innerHTML = loadHomePage(data);
            } else if (page === 'about') {
                document.getElementById('content').innerHTML = loadAboutPage(data);
            } else {
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

            // 替换所有带 data-lang-key 的文本
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.getAttribute('data-lang-key');
                if (data[key]) el.textContent = data[key];
            });
        });
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
            html += `<div class="image-row">`;
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
