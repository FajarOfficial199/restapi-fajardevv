const users = new Map(); // Menyimpan API key berdasarkan userId

// Fungsi untuk membuat API key baru dengan format "fjr" + angka random
function generateApiKey() {
    return "fjr" + Math.floor(100000 + Math.random() * 900000); // Contoh: fjr123456
}

// Fungsi untuk menambahkan user dan memberikan API key (jika belum ada)
async function addUser(userId) {
    if (users.has(userId)) {
        return users.get(userId); // Jika sudah ada, kembalikan API key yang sama
    }

    const newApiKey = generateApiKey();
    users.set(userId, newApiKey);
    return newApiKey;
}

// Fungsi untuk mendapatkan API key berdasarkan userId
function getUserApiKey(userId) {
    return users.get(userId) || null;
}

module.exports = { users, addUser, getUserApiKey };
