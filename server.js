const express = require("express");
const api = require("./api.js");
const spotify = require("./spotify.js");
const app = express();

const PORT = 9000;
app.listen(PORT, () => console.log("Listening on port: " + PORT));
app.use(express.static("public"));
app.use(express.json({limit: "1mb"}));

spotify.handleSpotify();

app.post("/api", async (request, response) => {
    let title = request.body.title;
    let artist = request.body.artist;
    let id = request.body.id;
    let features = await spotify.audio(id);
    let res = await api.getSenti(title, artist);
    response.json({
        status: {
            sent_status: res.status,
            feat_status: features.status
        },
        tag: res.res.tag,
        features: features.body
    })
});

app.post("/album-api", async(request, response) => {
    
    let id = request.body.id;
    console.log(id);
    let tracks = await spotify.getAlbumTracks(id);
    let tracks_status = tracks.status;
    let tracks_body = tracks.body;
    console.log(tracks);
    let res = [];
    for(let i = 0; i < tracks_body.length; i++) {
        let artist = tracks_body[i].artists[0].name;
        let songid = tracks_body[i].id;
        let title = tracks_body[i].name;
        console.log(artist);
        let features = await spotify.audio(songid);
        console.log(features);
        let senti = await api.getSenti(title, artist);
        console.log(senti);
        
        res.push({
            status: {
                sent_status: senti.status,
                feat_status: features.status
            },
            tag: senti.res.tag,
            features: features.body,
            title: title
        })
    }
    response.json(res);
});