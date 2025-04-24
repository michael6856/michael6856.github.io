// TODO: 改成你部署後的 Web App URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw1_HF7eFUbGxMlYEymLDyl7343sfud7r82sNb-LjcmKKa0I1SdENc9DorfqHgWZ2wu0g/exec';
const form = document.getElementById('orderForm');
const result = document.getElementById('result');
const submitButton = document.getElementById('submitButton');

form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!confirm("你確定要送出訂單嗎？")) return;

    let data = new FormData(form);
    let order = {};
    let all116 = true;
    let hasValue = false;

    await fetch(GAS_URL, {
        method: 'POST',
        mode: 'cors',                  // ← 加上这一行
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action:'submitOrder', order })
    });

    for (let [key, value] of data.entries()) {
        if (!isNaN(value)) {
            const num = parseInt(value) || 0;
            order[key] = num;
            if (!key.includes('套餐') && !key.includes('飲料') && num !== 116) all116 = false;
            if (num > 0 && num !== 116) hasValue = true;
        } else {
            order[key] = value;
        }
    }

    if (!hasValue && !all116) {
        result.innerHTML = "訂單無效，請輸入內容。";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "處理中...";

    // 管理員模式
    if (all116) {
        document.getElementById('adminArea').style.display = "block";
        result.innerHTML = "已進入管理員模式";
        submitButton.disabled = false;
        submitButton.textContent = "送出訂單";
        return;
    }

    try {
        const resp = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'submitOrder', order })
        });
        const json = await resp.json();
        if (json.status === 'success') {
            result.innerHTML = `✅ 訂單成功！<br>編號：<strong>${json.data.orderNumber}</strong><br>金額：<strong>$${json.data.total}</strong><br>請保留截圖以便取餐`;
            form.reset();
        } else {
            result.innerHTML = `❌ 失敗：${json.message}`;
        }
    } catch (err) {
        result.innerHTML = 'Error: ' + err.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "送出訂單";
    }
});

// 管理員：清空訂單
document.getElementById('clearButton').addEventListener('click', async () => {
    const btn = document.getElementById('clearButton');
    btn.disabled = true; btn.textContent = "清除中...";
    try {
        const resp = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clearOrders' })
        });
        const json = await resp.json();
        if (json.status === 'success') {
            document.getElementById('totalDisplay').textContent = '';
        }
    } catch(e) {
        console.error(e);
    } finally {
        btn.disabled = false; btn.textContent = "清空訂單";
    }
});

// 管理員：查總金額
document.getElementById('totalButton').addEventListener('click', async () => {
    const btn = document.getElementById('totalButton');
    btn.disabled = true; btn.textContent = "查詢中...";
    try {
        const resp = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getPaidTotal' })
        });
        const json = await resp.json();
        if (json.status === 'success') {
            document.getElementById('totalDisplay').textContent = `已付款總金額：$${json.data.total}`;
        }
    } catch(e) {
        console.error(e);
    } finally {
        btn.disabled = false; btn.textContent = "查詢總金額";
    }
});

