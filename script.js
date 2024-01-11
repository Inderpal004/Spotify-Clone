let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    console.log(`Fetching songs for folder: ${folder}`);
    currFolder = folder;
     let a = await fetch(`/${folder}`)
    // let a = await fetch(`https://spotify-inder.freewebhostmost.com/songs/${folder}`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUl = document.querySelector(".songs-list").getElementsByTagName('ul')[0];
    songUl.innerHTML = '';
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <i class="ri-disc-fill music-icon"></i>
        <div class="info">
            <div>${song.replaceAll('%20', " ")}</div>
        </div>
        <div class="play-now">
            <span>Play Now</span>
            <i class="ri-play-circle-fill playnow-icon"></i>
        </div>
    </li>`
    }

    Array.from(document.querySelector('.songs-list').getElementsByTagName('li')).forEach((e) => {
        e.addEventListener("click", element => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML)
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.classList.remove('ri-play-circle-fill');
        play.classList.add('ri-pause-circle-fill');
    }
    document.querySelector('.song-info').innerHTML = decodeURI(track);
    document.querySelector('.song-time').innerHTML = '00:00 / 00:00'
}

async function displayAlbums() {
   // let a = await fetch(`https://spotify-inder.freewebhostmost.com/songs/`);
     let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    console.log(div);
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.card-container');
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes('/songs/') && !e.href.includes('.htaccess')) {
            let url = new URL(e.href);
            let folder = url.pathname.split('/').filter(part => part !== '').pop();

            console.log(folder);

            let a = await fetch(`/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
                <div class="play">
                    <i class="ri-play-fill play-icon"></i>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="" />
                <h3 class="card-heading">${response.title}</h3>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener("click", async function (item) {
            let folder = item.currentTarget.querySelector('img').src.split('/').slice(-2, -1)[0];
            console.log('fetching songs for folder:', folder);
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0])
        });
    }); 
}

async function main() {

    await getSongs('songs/King')
    playMusic(songs[0], true)

    displayAlbums()

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.classList.remove('ri-play-circle-fill');
            play.classList.add('ri-pause-circle-fill');
        } else {
            currentSong.pause()
            play.classList.remove('ri-pause-circle-fill');
            play.classList.add('ri-play-circle-fill');
        }
    })

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.song-time').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        const progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector('.seekbar .circle').style.left = progressPercentage + "%";
    });

    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.seekbar .circle').style.left = percent + '%';
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    previous.addEventListener('click', () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener('click', () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.getElementById('volRange').addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    document.getElementById('volume').addEventListener('click',(e)=>{
        if(e.target.classList == 'ri-volume-up-line'){
            e.target.classList.remove('ri-volume-up-line');
            e.target.classList.add('ri-volume-mute-line');
            currentSong.volume = 0;
            document.querySelector('#volRange').value = 0;
        }else{
            e.target.classList.add('ri-volume-up-line');
            e.target.classList.remove('ri-volume-mute-line');
            currentSong.volume = .10;
            document.querySelector('#volRange').value = 20;
        }
    })

}

main()

hamburger.addEventListener('click', () => {
    document.querySelector('.left').style.left = '0%';
});

const close = document.getElementById('close')

close.addEventListener('click', () => {
    document.querySelector('.left').style.left = '-100%';
});

