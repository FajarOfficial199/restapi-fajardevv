require('../settings')
var creator = require('./settings')
const cloudscraper = require("cloudscraper");

async function fetchData(url) {
    try {
        const response = await cloudscraper.get(url);
        return JSON.parse(response);
    } catch (error) {
        return { error: error.message };
    }
}

async function getUserByUsername(username) {
    try {
        const response = await cloudscraper.post("https://users.roblox.com/v1/usernames/users", {
            json: { usernames: [username] }
        });
        const data = JSON.parse(response);
        return data.data?.[0] || null;
    } catch (error) {
        return null;
    }
}

async function robloxStalk(userId) {
    const results = {
        userInfo: await fetchData(`https://users.roblox.com/v1/users/${userId}`),
        userGroups: await fetchData(`https://groups.roblox.com/v1/users/${userId}/groups/roles`),
        userBadges: await fetchData(`https://badges.roblox.com/v1/users/${userId}/badges`),
        userGames: await fetchData(`https://games.roblox.com/v2/users/${userId}/games`),
        userAvatar: await fetchData(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`),
        usernameHistory: await fetchData(`https://users.roblox.com/v1/users/${userId}/username-history`),
        userFriends: await fetchData(`https://friends.roblox.com/v1/users/${userId}/friends`),
        userFriendCount: await fetchData(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
        userFollowers: await fetchData(`https://friends.roblox.com/v1/users/${userId}/followers`),
        userFollowing: await fetchData(`https://friends.roblox.com/v1/users/${userId}/followings`),
        userCreatedAssets: await fetchData(`https://catalog.roblox.com/v1/search/items?CreatorId=${userId}&CreatorType=User`),
    };

    return {
        status: true,
        creator: `${creator}`,
        results
    };
}

module.exports = { getUserByUsername, robloxStalk };
