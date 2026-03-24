const XKCD = "https://xkcd.now.sh/?comic="

// write your code here

fetchIssue(num){
    https://xkcd.now.sh/?comic=num
    fetch(URL_large)
    .then(response => response.text())
    .then(text => console.log('received ${text.length} characters'))
}

document.addEventListener(
    "DOMContentLoaded",
    () => {        const url='https://xkcd.now.sh/?comic=${issue}'
        console.log('fetching issue ${issue}... at ${url}')
        const response= await fetch(url)
        console.log(response)
        const data= await response.json()
        console.log(data)
        Image.src= data.img
    console.log('fetching issue ${issue}')
    
    }
)
