const users = new Map();

function generateApiKey() {
    return "fjr" + Math.floor(100000 + Math.random() * 900000); // Contoh: fjr123456
}

async function addUser(userId) {
    // Jika pengguna sudah ada, kembalikan API key yang sama
    if (users.has(userId)) {
        return users.get(userId);
    }

    // Buat API key baru dan simpan
    const newApiKey = generateApiKey();
    users.set(userId, newApiKey);
    return newApiKey;
}

module.exports = addUser
