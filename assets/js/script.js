let currentLanguage = 'en';
let currentPage = 'home';

// 切换语言
function changeLanguage(lang) {
    currentLanguage = lang;
    loadPage(currentPage);
}

// 加载页面内容
function loadPage(page) {
    currentPage = page.toLowerCase();
    fetch(`locales/${currentLanguage}/${currentPage}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${page} page for language ${currentLanguage}`);
            return response.json();
        })
        .then(data => {
            document.title = data.pageTitle;

            if (page === 'customers') {
                document.getElementById('content').innerHTML = loadCustomersPage(data);
            } else {
                document.getElementById('content').innerHTML = `
                    <h1>${data.welcomeHeading}</h1>
                    <p>${data.welcomeText}</p>
                    ${data.stats ? `
                    <div class="stats">
                        <p>${data.stats.employees}</p>
                        <p>${data.stats.locations}</p>
                    </div>` : ''}
                `;
            }

            // 更新所有 data-lang-key 元素
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.getAttribute('data-lang-key');
                if (data[key]) el.textContent = data[key];
            });
        })
        .catch(err => {
            console.error(err);
            document.getElementById('content').innerHTML = `<p style="color:red;">Failed to load content.</p>`;
        });
}

// 专门渲染客户页面
function loadCustomersPage(data) {
    return `
        <section class="customers">
            <h2>${data.heading}</h2>
            <div class="subheading">${data.subheading}</div>

            <div class="client-grid" id="clientGrid">
                ${data.clients.map(client => `
                    <div class="client-logo"
                         data-client="${client.id}"
                         onmouseenter="showClientDetails('${client.id}', '${client.name}', '${client.description}')"
                         onmouseleave="hideClientDetails()">
                        <img src="assets/images/customers/${client.id}.png" alt="${client.name}">
                    </div>
                `).join('')}
            </div>

            <div id="clientDetails" class="client-details"></div>
        </section>
    `;
}

// 客户浮层逻辑
function showClientDetails(id, name, description) {
    const logoElement = document.querySelector(`[data-client="${id}"]`);
    const detailsBox = document.getElementById('clientDetails');

    detailsBox.innerHTML = `
        <strong>${name}</strong><br>
        <p>${description}</p>
    `;
    detailsBox.style.display = 'block';
    detailsBox.style.position = 'absolute';

    // 等待渲染完再定位
    setTimeout(() => {
        const rect = logoElement.getBoundingClientRect();
        const left = rect.left + window.scrollX + (rect.width / 2) - (detailsBox.offsetWidth / 2);
        const top = rect.bottom + window.scrollY + 8;
        detailsBox.style.left = `${left}px`;
        detailsBox.style.top = `${top}px`;
    }, 0);
}



function hideClientDetails() {
    const detailBox = document.getElementById('clientDetails');
    detailBox.style.display = 'none';
    detailBox.innerHTML = '';
}
