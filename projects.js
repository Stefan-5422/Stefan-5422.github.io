const repos = fetch("https://api.github.com/users/stefan-5422/repos").then(response => response.json())

repos.then(
    data => {
        console.log(data)
        /*Array.from(data).forEach(repo => {
            document.getElementsByClassName("body")[0].innerHTML +=(` \
            <a href="${repo.html_url}" class="card" style="width:50%; min-height:15%; margin-bottom:4%;"> \
             <h2>${repo.name}</h2>\
             <p>${(repo.description != null)? repo.description : ""}</p> \
             </a>\
             `)
        })*/
        Array.from(data).forEach(repo => {
            document.getElementsByClassName("body")[0].innerHTML += `\
            <a href="${repo.html_url}" style="width:min-content; justify-self:center; margin-bottom:10px"> \
            <img  src="https://github-readme-stats.vercel.app/api/pin/?username=stefan-5422&repo=${repo.name}"></img> \
            </a>
            `
        })
    }
)