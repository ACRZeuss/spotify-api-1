const querystring = require('querystring');
const request = require('request');

const {
    client_id,
    client_secret,
    redirect_uri
} = process.env;

/** 
* Rastgele metin oluşturur.
* @param  {number} uzunluk Metin uzunluğu
* @return {string} Oluşturulan metin
*/
const rastgeleMetin = (uzunluk) => {
    let metin = '';
    let alfabe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < uzunluk; i++) {
        metin += alfabe.charAt(Math.floor(Math.random() * alfabe.length));
    }
    return metin;
}


/**
 * API bağlantısı için giriş URL'ini döndürür.
 * @param {string} rastgeleMetin Rastgele metin
 * @param {string} scope Gerekli izinler
 * @return {string} Giriş URL'i
 */
const girisURL = ({ rastgeleMetin, scope }) => {

    scope ??= 'user-read-private user-read-email user-top-read user-read-currently-playing';
    return 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id,
            scope,
            redirect_uri,
            state: rastgeleMetin
        });
}

/**
 * @param {string} refreshToken Yenileme için gerekli token
 * @return {string} Yeni access_token
 */
const tokenYenile = async ({ refresh_token }) => {

    const req = await fetch('https://accounts.spotify.com/api/token', {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from((client_id + ':' + client_secret)).toString('base64')),
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        method: 'POST',
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`
    })

    const json = await req.json();

    if (json.error)
        return { error: json.error }

    return json.access_token;

}

/**
 * @param req Kullanıcıdan gelen istek
 * @param res Döndürülecek cevap
 * @return {Function} Callback 
 */
const callback = (req, res) => {
    let code = req.query.code || null;

    res.clearCookie('spotify_auth_state');
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            let access_token = body.access_token,
                refresh_token = body.refresh_token;

            let options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            request.get(options, function (error, response, body) {
                console.log(body);
            });

            res.redirect('/api/getProfile?' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });

}


module.exports = {
    callback,
    girisURL,
    rastgeleMetin,
    tokenYenile,
}