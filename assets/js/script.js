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

            if (page === 'customers') {
                document.getElementById('content').innerHTML = loadCustomersPage(data);
                window.customersData = data.clients;
            } else {
                document.getElementById('content').innerHTML = `
                    <h1>${data.welcomeHeading}</h1>
                    <p>${data.welcomeText}</p>
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

    const imagesHTML = client.gallery.map(img =>
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
