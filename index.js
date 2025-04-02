const express = require('express');
const admin = require('firebase-admin');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3002;

// Khởi tạo Firebase với biến môi trường
let serviceAccount;
if (process.env.FIREBASE_ADMINSDK) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMINSDK);
    } catch (error) {
        console.error('Error parsing FIREBASE_ADMINSDK:', error);
        throw new Error('Invalid FIREBASE_ADMINSDK environment variable');
    }
} else {
    console.log('FIREBASE_ADMINSDK not found, falling back to local file');
    serviceAccount = require('../gjchain/firebase-adminsdk.json');
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const walletsCollection = admin.firestore().collection('wallets');

app.use(express.json());
app.use(express.static('public'));

app.post('/create', (req, res) => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const walletAddress = `gj${crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 16)}`;
    walletsCollection.doc(walletAddress).set({ balance: 0, publicKey, privateKey });
    res.json({ address: walletAddress, publicKey, privateKey });
});

app.get('/balance/:address', async (req, res) => {
    const walletDoc = await walletsCollection.doc(req.params.address).get();
    res.json(walletDoc.exists ? { balance: walletDoc.data().balance } : { error: 'Ví không tồn tại' });
});

app.listen(port, () => console.log(`Wallet chạy tại http://localhost:${port}`));
