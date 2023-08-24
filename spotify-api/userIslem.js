const fetch = require('node-fetch')

/**
 * 
 * @param {string} access_token
 * @return {object} Çalan Şarkı Objesini Döndürür.
 */
const getCurrentSong = async (access_token) => {
    const istek = await fetch('https://api.spotify.com/v1/me/player/currently-playin',
        {
            headers: { "Authorization": "Bearer " + access_token }
        })
    const cevap = await istek.text();

    if (cevap.length == 0)
        return {
            bos: true
        };

    const json = JSON.parse(cevap);

    if (json.error)
        return json.error.message;

    return json;
}

/**
 * 
 * @param {string} access_token 
 * @return Kullanıcı profilini döndürür.
 */
const getProfile = async (access_token) => {
    const istek = await fetch('https://api.spotify.com/v1/me',
        {
            headers: { "Authorization": "Bearer " + access_token }
        })
    const json = await istek.json();

    if (json.error)
        return json.error.message;

    return json;
}



module.exports = {
    getCurrentSong,
    getProfile
}