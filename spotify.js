var SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

clientId = process.env.CLIENT_ID;
clientSecret = process.env.CLIENT_SECRET;
var spotifyApi = new SpotifyWebApi({
    clientSecret: clientSecret,
    clientId: clientId
});


let handleSpotify = async () => {
    let data = await spotifyApi.clientCredentialsGrant();
    let status = data.statusCode;
    if(status != 200) {return status}
    let token = data.body['access_token'];
    console.log("Access token expires in " + data.body['expires_in']);
    console.log("Access token is " + data.body['access_token']);
    spotifyApi.setAccessToken(token);
};

let audio = async(id) => {
    let analysis = await spotifyApi.getAudioFeaturesForTrack(id);
    let status = analysis.statusCode;
    let body = analysis.body;
    return {status, body};
}

let getAlbumTracks = async(id) => {
    let tracks = await spotifyApi.getAlbumTracks(id);
    let status = tracks.statusCode;
    let body = tracks.body.items;
    return {status,body};
}


module.exports = {audio, getAlbumTracks, handleSpotify};
