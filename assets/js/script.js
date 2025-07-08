let currentPage = window.location.hash.replace(/^#/, '') || 'home';
let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
let currentGallery = [];
let currentIndex = 0;

const BASE_PATH = window.location.pathname.replace(/\/[^\/]*$/, '/');


function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);

    // 使用当前 global 变量 currentPage 作为真正可靠的 fallback
    const hashPage = window.location.hash.replace(/^#/, '').trim();
    const safePage = hashPage || currentPage || 'home';

    console.log('💬 Changing language to:', lang, '| currentPage:', currentPage, '| hashPage:', hashPage, '| safePage:', safePage);

    loadPage(safePage, true);  // 强制刷新
}


function highlightActiveMenu(page) {
  // 先移除所有 active
  document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));

  // 再为当前页面添加 active
  const current = document.querySelector(`nav a[onclick*="${page}"]`);
  if (current) current.classList.add('active');
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

    fetch(`${BASE_PATH}locales/${currentLanguage}/${currentPage}.json?t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            document.title = data.pageTitle;

            const headingElement = document.getElementById('page-heading');
            headingElement.textContent = data.welcomeHeading || data.heading || '';

            if (page === 'customers') {
                document.getElementById('content').innerHTML = loadCustomersPage(data);
                window.customersData = data.clients;
                initCustomerPopupEvents();
            } else if (page === 'home') {
                document.getElementById('content').innerHTML = loadHomePage(data);
            } else if (page === 'about') {
                document.getElementById('content').innerHTML = loadAboutPage(data);
            } else if (page === 'products') {
                document.getElementById('content').innerHTML = loadProductsPage(data);
            } else if (page === 'casting') {
                document.getElementById('content').innerHTML = loadStructuredPage(data);
            } else if (page === 'forging') {
                document.getElementById('content').innerHTML = loadStructuredPage(data);
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
            <h2 class="section-heading">${data.heading}</h2>
            <div class="subheading">${data.subheading}</div>
            <div class="client-grid" id="clientGrid">
                ${data.clients.map(client => `
                    <div class="client-logo"
                         data-name="${client.name}"
                         data-description="${client.description}"
                         data-image="assets/images/customers/${client.gallery[0]}"
                         onclick="showClientPopup(this)">
                        <img src="assets/images/customers/${client.logo}" alt="${client.name}">
                    </div>
                `).join('')}
            </div>

            <!-- 弹窗结构 -->
            <div id="clientPopup" class="popup hidden">
              <div class="popup-content">
                <span class="popup-close">&times;</span>
                <button class="popup-prev">&larr;</button>
                <div class="popup-info">
                  <h3 id="popup-title"></h3>
                  <img id="popup-image" src="" alt="" />
                  <p id="popup-description"></p>
                </div>
                <button class="popup-next">&rarr;</button>
              </div>
            </div>

        </section>
    `;
}
function showClientPopup(element) {
    const popup = document.getElementById("clientPopup");
    const title = document.getElementById("popup-title");
    const description = document.getElementById("popup-description");
    const image = document.getElementById("popup-image");

    // 构建 gallery 列表（所有 client-logo）
    customerGallery = Array.from(document.querySelectorAll('.client-logo'));
    customerIndex = customerGallery.indexOf(element);

    const name = element.dataset.name;
    const desc = element.dataset.description;
    const imgSrc = element.dataset.image;

    title.textContent = name;
    description.textContent = desc;
    image.src = imgSrc;
    image.alt = name;

    // ✅ 动态显示/隐藏箭头
    const prevBtn = document.querySelector(".popup-prev");
    const nextBtn = document.querySelector(".popup-next");
    if (customerIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    if (customerIndex === customerGallery.length - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'block';
    }

    popup.classList.remove("hidden");
}
function initCustomerPopupEvents() {
    const popup = document.getElementById("clientPopup");
    const closeBtn = popup.querySelector(".popup-close");
    const prevBtn = popup.querySelector(".popup-prev");
    const nextBtn = popup.querySelector(".popup-next");

    closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

    prevBtn.addEventListener("click", () => {
        if (customerIndex > 0) {
            customerIndex--;
            showClientPopup(customerGallery[customerIndex]);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (customerIndex < customerGallery.length - 1) {
            customerIndex++;
            showClientPopup(customerGallery[customerIndex]);
        }
    });

    window.addEventListener("click", (e) => {
        if (!popup.querySelector(".popup-content").contains(e.target) &&
            !e.target.closest('.client-logo')) {
            popup.classList.add("hidden");
        }
    });
}



function showClientDetails(clientId, event) {
    const client = window.customersData.find(c => c.id === clientId);
    if (!client) return;

    const detailsDiv = document.getElementById('clientDetails');

    const imagesHTML = (client.gallery || [])
        .filter(img => img !== client.logo)
        .map(img =>
            `<img src="assets/images/customers/${img}" alt="${client.name} product" class="client-popup-image">`
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

    // 组件列表动态渲染
    const componentsHTML = `
        <section class="component-list">
            ${data.components.map(component => `
                <div class="component-card">
                    <h3>${component.title}</h3>
                    <ul>
                        ${component.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </section>
    `;

    // 产品图库标题
    const productGalleryHTML = `
        <div class="product-gallery">
            <h3 class="gallery-title">${data.galleryTitle}</h3>
            <div class="gallery-grid">
                ${data.captions.map((caption, i) => `
                    <div class="gallery-item">
                        <img src="assets/images/products/product_${i + 1}.png"
                            alt="${caption}"
                            class="clickable-image"
                            data-full="assets/images/products/product_${i + 1}.png"
                            data-index="${i}">
                        <p class="caption">${caption}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 链接按钮动态渲染
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
            <div class="description">${descriptionHTML}</div>
            <div class="product-links">${linksHTML}</div>
            ${componentsHTML}
            ${productGalleryHTML}
        </section>
    `;
}

function loadStructuredPage(data) {
    return data.sections.map((section, index) => {
        const headingHTML = section.heading ? `<h2 class="section-heading">${section.heading}</h2>` : '';
        const paragraphsHTML = section.paragraphs?.map(p => `<p>${p}</p>`).join('') || '';
        const textBlock = paragraphsHTML ? `<div class="text-block">${paragraphsHTML}</div>` : '';

        const buildImageHTML = (images) =>
            images.map(img => `
                <div class="image-block">
                    <img src="${img.src}" alt="${img.caption}" class="clickable-image" data-full="${img.src}">
                    <p class="caption">${img.caption}</p>
                </div>
            `).join('');

        const imageClass = section.images?.length >= 4 ? 'image-grid-3x2' : 'image-row';
        const imagesHTML = section.images?.length
            ? `<div class="${imageClass}">${buildImageHTML(section.images)}</div>`
            : '';

        const additionalTextHTML = section.additionalText
            ? `<div class="additional-text"><p>${section.additionalText}</p></div>`
            : '';

        const additionalImagesHTML = section.additionalImages?.length
            ? `<div class="image-grid-3x2">${buildImageHTML(section.additionalImages)}</div>`
            : '';

        // ✅ 自动判断第一个 section 且含一张图片时使用并排布局
        if (index === 0 && section.images?.length === 1) {
            const img = section.images[0];
            const imageBlock = `
                <div class="image-block">
                    <img src="${img.src}" alt="${img.caption}" class="clickable-image" data-full="${img.src}">
                    <p class="caption">${img.caption}</p>
                </div>
            `;
            return `
                <section class="casting-section">
                    ${headingHTML}
                    <div class="general-info-flex">
                        ${textBlock}
                        ${imageBlock}
                    </div>
                </section>
            `;
        }

        // 默认结构：标题 + 段落 + 多图 + 附加段落 + 附加图
        return `
            <section class="casting-section">
                ${headingHTML}
                ${textBlock}
                ${imagesHTML}
                ${additionalTextHTML}
                ${additionalImagesHTML}
            </section>
        `;
    }).join('');
}



// ✅ 页面加载时，根据 URL hash 判断加载哪个页面
document.addEventListener('DOMContentLoaded', () => {
        currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        const hashPage = window.location.hash.replace(/^#/, '').trim() || 'home';
        currentPage = hashPage;  // 👈 更新全局变量！
        console.log('📌 DOMContentLoaded | currentPage =', currentPage, '| currentLanguage =', currentLanguage);
        loadPage(currentPage);
    });

// ✅ 当 hash 变化时（如浏览器前进/后退），自动加载对应页面
window.addEventListener('hashchange', () => {
    const newPage = window.location.hash.replace(/^#/, '').trim();
    if (newPage) {
        currentPage = newPage;
        loadPage(newPage);
    }
});

document.addEventListener('click', function (e) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    if (e.target.matches('.clickable-image')) {
        // 找到所有同组图片
        const gallery = Array.from(e.target.closest('.image-grid-3x2, .image-row, .gallery-grid').querySelectorAll('.clickable-image'));
        currentGallery = gallery;
        currentIndex = gallery.indexOf(e.target);

        showImageAt(currentIndex);
        modal.style.display = 'block';
    }

    if (e.target.matches('.close-btn') || e.target.id === 'image-modal') {
        modal.style.display = 'none';
    }

    if (e.target.matches('.modal-prev')) {
        if (currentIndex > 0) {
            currentIndex--;
            showImageAt(currentIndex);
        }
    }

    if (e.target.matches('.modal-next')) {
        if (currentIndex < currentGallery.length - 1) {
            currentIndex++;
            showImageAt(currentIndex);
        }
    }
});

function showImageAt(index) {
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const img = currentGallery[index];
    modalImg.src = img.dataset.full || img.src;
    modalCaption.textContent = img.alt || '';

    document.querySelector('.modal-prev').disabled = index === 0;
    document.querySelector('.modal-next').disabled = index === currentGallery.length - 1;
}

document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("clientPopup");
    const title = document.getElementById("popup-title");
    const description = document.getElementById("popup-description");
    const image = document.getElementById("popup-image");
    const closeBtn = document.querySelector(".popup-close");

    document.querySelectorAll(".client-logo").forEach(el => {
        el.addEventListener("click", () => {
            title.textContent = el.dataset.name;
            description.textContent = el.dataset.description;
            image.src = el.dataset.image;

            popup.classList.remove("hidden");
        });
    });

    closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
        if (!popup.contains(e.target) && !e.target.closest('.client-logo')) {
            popup.classList.add("hidden");
        }
    });
});
