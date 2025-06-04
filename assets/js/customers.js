// 显示客户详情
function showClientDetails(clientId) {
    const clientData = currentPageData.clients.find(c => c.id === clientId);
    const detailsDiv = document.getElementById('clientDetails');

    detailsDiv.innerHTML = `
        <div class="detail-card">
            <h3>${clientData.name}</h3>
            <p>${clientData.description}</p>
            <div class="gallery">
                ${clientData.gallery.map(img => `
                    <img src="assets/images/projects/${img}" alt="${clientData.name} Project">
                `).join('')}
            </div>
        </div>
    `;

    // 定位浮层跟随鼠标
    detailsDiv.style.display = 'block';
}

// 隐藏详情
function hideClientDetails() {
    document.getElementById('clientDetails').style.display = 'none';
}

// 动态计算浮层位置
document.getElementById('clientGrid').addEventListener('mousemove', (e) => {
    const details = document.getElementById('clientDetails');
    details.style.top = `${e.clientY + 20}px`;
    details.style.left = `${e.clientX + 20}px`;
});