const select = document.querySelector("select");

select.addEventListener("change", (event) => {
    let choose = event.target.value;
    let forms = document.querySelectorAll("form");
    let svgcont = document.querySelector("#svgcontainer");
    svgcont.innerHTML = '';
    for(let i = 0; i < forms.length; i++) {
        forms[i].reset();
        forms[i].classList.remove("active");
        if(forms[i].id == choose) {
            forms[i].classList.add("active");
        }
    }
});



const form = document.querySelector("#song");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let svgcont = document.querySelector("#svgcontainer");
    svgcont.innerHTML = '';
    let formData = new FormData(form);
    const title = formData.get("song_name");
    const artist = formData.get("artist");
    const id = formData.get("songid");
    const data = {title, artist, id};
    const options =  {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }
    let h = document.createElement("h1");
    let load = document.createTextNode("Loading...");
    h.appendChild(load)
    svgcont.appendChild(h);
    const response = await fetch("/api", options);
    const json = await response.json();
    svgcont.innerHTML = '';
    console.log(json);
    showRadar(json.status.sent_status, json.status.feat_status, json.tag, json.features, null, 600, true);
})

const albumform = document.querySelector("#album");
albumform.addEventListener("submit", async (event) => {
    event.preventDefault();
    let svgcont = document.querySelector("#svgcontainer");
    svgcont.innerHTML = '';
    let formData = new FormData(albumform);
    const id = formData.get("albumid");
    const data = {id}
    const options =  {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }
    let h = document.createElement("h1");
    let load = document.createTextNode("Loading...");
    h.appendChild(load)
    svgcont.appendChild(h);
    const response = await fetch("/album-api", options);
    const json = await response.json();
    svgcont.innerHTML = '';
    console.log(json);
    for(let i = 0; i < json.length; i++) {
        showRadar(json[i].status.sent_status, json[i].status.feat_status, json[i].tag, json[i].features, json[i].title, 300, false);
    }
})


var toPolar = (degree, r) => {
    return {
        xPoint: r*Math.sin(degree*Math.PI/180),
        yPoint: r*Math.cos(degree*Math.PI/180)
    }
}
var getColor = (tag, status) => {
    if(status != 200) return "none";
    if(tag == "Positive") {
        return "yellow";
    } else if(tag == "Negative") {
        return "blue";
    } else {
        return "green";
    }
}
let showRadar = (sent_stat, feat_stat, tag, features, title, side, showText) => {
    let svgheight = side;
    let svgwidth = side;
    let center = svgheight/2;
    let d = svgheight - 70;
    var radarScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, d/2]);

    let svg = d3.select("#svgcontainer")
        .append("svg")
        .attr("height", svgheight)
        .attr("width", svgwidth);
    let scale = [0, 0.2, 0.4, 0.6, 0.8, 1];

    let stats = [["danceability", 0],
    ["energy", 0],
    ["speechiness", 0],
    ["acousticness", 0],
    ["instrumentalness", 0],
    ["liveness", 0]];

    if(feat_stat == 200) {
        stats = [["danceability", features.danceability],
        ["energy", features.energy],
        ["speechiness", features.speechiness],
        ["acousticness", features.acousticness],
        ["instrumentalness", features.instrumentalness],
        ["liveness", features.liveness]];
    }

    svg.selectAll("circle")
        .data(scale)
        .enter()
        .append("circle")
        .attr("cx", center)
        .attr("cy", center)
        .attr("r", (i) => radarScale(i))
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1);
            
    for(let i = 0; i < 6; i++) {
        let line = svg.append("line")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .attr("x1", center)
        .attr("y1", center)
        .attr("x2", center + toPolar((i/6)*360, d/2).xPoint)
        .attr("y2", center + toPolar((i/6)*360, d/2).yPoint);
        if(showText) {
            svg.append("text")
            .attr("y", center + toPolar((i/6)*360, d/2 + 15).yPoint)
            .attr("x", center + toPolar((i/6)*360, d/2 + 15).xPoint)
            .attr("text-anchor", "middle")
            .text(stats[i][0]);
        }
    }
    if(!showText) {
        svg.append("text")
        .attr("y", center + toPolar(0, d/2+15).yPoint)
        .attr("x", center + toPolar(0, d/2+15).xPoint)
        .text(title);
    }

    let allStats = [
        [0,0],
        [0,0],
        [0,0],
        [0,0],
        [0,0],
        [0,0],
    ];

    for(let i = 0; i < stats.length; i++) {
        allStats[i][0] = center + toPolar((i/6)*360, radarScale(stats[i][1])).xPoint;
        allStats[i][1] =  center + toPolar((i/6)*360, radarScale(stats[i][1])).yPoint;
    }

    let poly = svg.selectAll("polygon")
    .data([allStats])
    .enter()
    .append("polygon")
    .style("stroke-width", 2)
    .style("stroke", getColor(tag, 200))
    .attr("points", (d) => {
        let str = "";
        for(let i = 0; i < d.length; i++) {
            str = str+d[i][0]+","+d[i][1]+" ";
        }
        return str;
    })
    .style("fill", getColor(tag, sent_stat))
    .style("fill-opacity", 0.7)
    .on("mouseover", function(d) {
        let z = "polygon."+d3.select(this).attr("class");
        d3.select(this)
        .transition(200)
        .style("fill-opacity", 0.1);
        d3.select(z)
        .transition(200)
        .style("fill-opacity", 0.7);
    })
    .on("mouseout", function(d) {
        d3.selectAll("polygon")
        .transition(200)
        .style("fill-opacity", 0.7)
    });

    let mouse = d3.select("#svgcontainer").append("div").attr("class", "mouse");

    for(let i = 0; i < allStats.length; i++) {
        svg.append("circle")
            .attr("cx", allStats[i][0])
            .attr("cy", allStats[i][1])
            .attr("r", 5)
            .style("stroke", getColor(tag, 200))
            .style("stroke-width", "2px")
            .style("fill", getColor(tag, 200))
            .style("fill-opacity", 0.3)
            .on("mouseover", (d) => {
                console.log("Hello");
                mouse
                .style("left", (d.x) + "px")
                .style("top", (d.y) + "px")
                .style("display", "inline-block")
                .html(stats[i][0]+ "<br><span>"+ stats[i][1] +"</span>");
            })
            .on("mouseout", () => {
                mouse.style("display", "none");
            });
    }
}

