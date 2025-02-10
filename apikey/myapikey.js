const users = new Map(); // Menyimpan data pengguna dalam memori

// Fungsi untuk membuat API key baru dengan format "fjr" + angka random
function generateApiKey() {
    return "fjr" + Math.floor(100000 + Math.random() * 900000); // Contoh: fjr123456
}

async function addUser(userId) {
    if (users.has(userId)) {
        return users.get(userId);
    }

    const newApiKey = generateApiKey();
    users.set(userId, newApiKey);
    return newApiKey;
}

// Fungsi untuk mendapatkan API key berdasarkan userId
function getUserApiKey(userId) {
    return users.get(userId) || null;
}

module.exports = { users, generateApiKey, addUser, getUserApiKey };
