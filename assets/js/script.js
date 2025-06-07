let currentLanguage = 'en';
let currentPage = 'home';

function changeLanguage(lang) {
    currentLanguage = lang;
    loadPage(currentPage);
}

function loadPage(page) {
    currentPage = page.toLowerCase();
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
            } else {
                // 将 welcomeText 中的 \n\n 转换为 <p> 段落
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

    // 展示 gallery 图，不包含 logo
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

    // 定位弹窗在 logo 正下方
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

// 初始化加载首页
document.addEventListener('DOMContentLoaded', () => {
    loadPage('home');
});
