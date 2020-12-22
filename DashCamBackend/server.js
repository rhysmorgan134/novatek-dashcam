const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs')
var parseString = require('xml2js').parseString;
const parsers = require('./parsers')
const app = express()
const port = 3000
let videos = {}

Stream = require('node-rtsp-stream')
stream = new Stream({
    name: 'name',
    streamUrl: 'rtsp://192.168.1.254/BigBuckBunny_115k.mov',
    wsPort: 9999,
    ffmpegOptions: { // options ffmpeg flags
        '-stats': '', // an option with no neccessary value uses a blank string
        '-r': 30 // options with required values specify the value after the key
    }
})

const queryCam = async (cmd, par=null, str=null, path=null) => {
    const res = await fetch(`http://192.168.0.119/${path ? path: ''}?custom=1${cmd ? `&cmd=${cmd}` : ''}`)
    const data = await res.text()
    return data
};

const queryCamImg = async (cmd, par=null, str=null, path=null) => {
    const res = await fetch(`http://192.168.0.119/${path ? path: ''}?custom=1${cmd ? `&cmd=${cmd}` : ''}`)
    const data = await res.blob()
    return data
};

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/files', (req, res) => {
});

// queryCam(3014).then(data => parseString(data, (err, res) => {
//     console.log(parsers['3014'](res.Function))
// }));

// queryCam(3014).then(data => parseString(data, (err, res) => {
//     console.log(parsers['3014'](res.Function))
// }));

const getThumbs = async (start, end) => {
    let names = Object.keys(videos)
    console.log(names)
    let res = []
    for (let i = start; i < end; i++) {
        console.log("starting loop", i)
        const getJpg = async (i) => {

            const jpg = await queryCamImg(4001, null, null, 'NOVATEK/MOVIE/' + videos[names[i]].name);
            saveFile(jpg,'./thumbs/' + videos[names[i]].name.replace('.MP4', '.jpeg'))
            videos[names[i]].thumbPath = videos[names[i]].name.replace('.MP4', '.jpeg')
            res.push(videos[names[i]])
        }

        let jpg = await getJpg(i)

    }
    return res;
}

async function saveFile(blob, name) {

    const buffer = Buffer.from( await blob.arrayBuffer() );

    fs.writeFile(name, buffer);

}

queryCam(3015).then(data => parseString(data, (err, res) => {
    let files = res.LIST.ALLFile
    console.log(files[0].File[0])
    for(let i=files.length -1;i>0;i--) {
        videos[files[i].File[0].NAME[0]] = {
            name: files[i].File[0].NAME[0],
            created: files[i].File[0].TIME[0],
            path: files[i].File[0].FPATH[0],
            size: files[i].File[0].SIZE[0],
            thumbPath: ''
        }
    }

    getThumbs(0, 10).then((data) => {
        let name = 'test.jpeg';
        console.log(data)
    })
}));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});