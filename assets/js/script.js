let currentLanguage = 'en';
let currentPage = 'home';

// 切换语言
function changeLanguage(lang) {
    currentLanguage = lang;
    loadPage(currentPage);
}

// 加载页面内容
function loadPage(page) {
    currentPage = page;
    fetch(`locales/${currentLanguage}/${page}.json`)
        .then(response => response.json())
        .then(data => {
            // 更新页面内容
            document.title = data.pageTitle;
            document.getElementById('content').innerHTML = `
                <h1>${data.welcomeHeading}</h1>
                <p>${data.welcomeText}</p>
                <div class="stats">
                    <p>${data.stats.employees}</p>
                    <p>${data.stats.locations}</p>
                </div>
            `;

            // 更新所有带data-lang-key的元素
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.getAttribute('data-lang-key');
                if (data[key]) el.textContent = data[key];
            });
        });
}