async function createWallet() {
    const response = await fetch('/create', { method: 'POST' });
    const wallet = await response.json();
    document.getElementById('output').textContent = `Ví mới: ${JSON.stringify(wallet, null, 2)}\nLưu khóa riêng!`;
}

async function checkBalance() {
    const address = document.getElementById('address').value;
    const response = await fetch(`/balance/${address}`);
    const data = await response.json();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}