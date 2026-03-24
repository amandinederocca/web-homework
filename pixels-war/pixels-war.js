

// using vite, we can write our code with URLs that simply read
// /api/v2/xxx
// and vite will proxy them to whichever server is configured in vite.config.js,
// which is currently set to https://pixels-war.fly.dev
// so there's essentially no need for a global variable with the server URL..

// also note that it's probably wise to start with the TEST map

document.addEventListener("DOMContentLoaded",
    async () => {

        let MAP_ID = "TEST" 
        let API_KEY = undefined
        // on stocke ni et nj pour que refresh() puisse les utiliser
        let NI = undefined
        let NJ = undefined

        console.log("Retrieving maps from the server...")
        const maps_response = await fetch(`/api/v2/maps`, {credentials: "include"})
        const maps_json = await maps_response.json()

        if (!maps_response.ok) {
            alert(`Error retrieving maps: ${maps_response.status} ${maps_response.statusText}`)
            return
        }

        const select = document.getElementById("mapid-input")
        for (const {name, timeout} of maps_json) {
            const option = document.createElement("option")
            option.value = name
            const seconds = timeout / 1000000000
            option.textContent = `${name} (${seconds}s)`
            select.appendChild(option)
            console.log(`Map ${name} added to the dropdown`)
        }

        async function connect(event) {
            const select = document.getElementById("mapid-input")
            MAP_ID = select.value
            console.log(`Connecting to map ${MAP_ID}...`)
            const init_response = await fetch(`/api/v2/${MAP_ID}/init`, {credentials: "include"})
            if (!init_response.ok) {
                alert(`Error initializing map ${MAP_ID}: ${init_response.status} ${init_response.statusText}`)
                return
            }
            const init_json = await init_response.json()
            API_KEY = init_json.api_key
            NI = init_json.ni
            NJ = init_json.nj
            console.log(`Connected to map ${MAP_ID} with API key ${API_KEY}`)
            draw_map(NI, NJ, init_json.data)
        }

        document.getElementById("connect-button").addEventListener("click", connect);

        function draw_map(ni, nj, data) {
            const grid = document.getElementById("grid")
            grid.innerHTML = ""
            grid.style.gridTemplateColumns = `repeat(${nj}, 1fr)`
            for (let i = 0; i < ni; i++) {
                for (let j = 0; j < nj; j++) {
                    const pixel = document.createElement("div")
                    pixel.classList.add("pixel")
                    pixel.dataset.i = i
                    pixel.dataset.j = j
                    const [r, g, b] = data[i][j]
                    pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
                    // on attache le clic sur chaque pixel
                    pixel.addEventListener("click", set_pixel)
                    grid.appendChild(pixel)
                }
            }
        }

        //TMP: to test the previous function: 3 lines and 5 columns
        draw_map(3, 5, [
            [ [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0] ],
            [ [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0] ],
            [ [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0] ],
        ])

        function apply_changes(ni, nj, changes) {
            const grid = document.getElementById("grid")
            for (const [i, j, r, g, b] of changes) {
                const index = i * nj + j
                const pixel = grid.children[index]
                if (pixel) {
                    pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
                }
            }
        }

        //TMP: to test the previous function, let's change the color of 3 pixels
        apply_changes(3, 5,[
            [1, 1, 0, 0, 255],
            [1, 2, 0, 0, 255],
            [1, 3, 0, 0, 255],
        ])

        async function refresh() {
            if (!MAP_ID || NI === undefined) return
            const response = await fetch(`/api/v2/${MAP_ID}/refresh`, {credentials: "include"})
            if (!response.ok) {
                console.error(`Error refreshing: ${response.status} ${response.statusText}`)
                return
            }
            const changes = await response.json()
            apply_changes(NI, NJ, changes)
        }

        document.getElementById("refresh-button").addEventListener("click", refresh)

        // auto-refresh toutes les 2 secondes
        setInterval(refresh, 2000)

        // envoie la couleur choisie au serveur pour le pixel cliqué
        async function set_pixel(event) {
            if (!API_KEY) {
                alert("Connecte-toi d'abord à une map !")
                return
            }
            const pixel = event.currentTarget
            const i = parseInt(pixel.dataset.i)
            const j = parseInt(pixel.dataset.j)
            const [r, g, b] = getPickedColorInRGB()

            const response = await fetch(`/api/v2/${MAP_ID}/set`, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({i, j, r, g, b, api_key: API_KEY})
            })
            if (!response.ok) {
                console.error(`Error setting pixel: ${response.status} ${response.statusText}`)
                return
            }
            pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
        }

        // no need to change anything below
        // just little helper functions for your convenience

        function getPickedColorInRGB() {
            const colorHexa = document.getElementById("colorpicker").value
            const r = parseInt(colorHexa.substring(1, 3), 16)
            const g = parseInt(colorHexa.substring(3, 5), 16)
            const b = parseInt(colorHexa.substring(5, 7), 16)
            return [r, g, b]
        }

        function pickColorFrom(div) {
            const bg = window.getComputedStyle(div).backgroundColor
            const [r, g, b] = bg.match(/\d+/g)
            const rh = parseInt(r).toString(16).padStart(2, '0')
            const gh = parseInt(g).toString(16).padStart(2, '0')
            const bh = parseInt(b).toString(16).padStart(2, '0')
            const hex = `#${rh}${gh}${bh}`
            document.getElementById("colorpicker").value = hex
        }
    }
)