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

function checkApiKey(apikey) {
    return [...users.values()].includes(apikey);
}

module.exports = { users, generateApiKey, addUser, checkApiKey };
