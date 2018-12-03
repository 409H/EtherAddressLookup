//Show the user why it's blocked
var b = window.location.href.split("#");
console.log("Domain is blacklisted because: "+(b[b.length-1].toLowerCase()));
switch(b[b.length-1].toLowerCase()) {
    case 'punycode':
        document.getElementById("punycode").style.display = 'block'
        document.getElementById("punycode_turnoff").style.display = 'block'

        document.getElementById("notice-container").style.width = '70%'
        document.getElementById("notice-container").style.float = 'left'
        document.getElementById("notice-container").style.height = '500px'

        document.getElementById("gif-container").style.width = '30%'
        document.getElementById("gif-container").style.height = '500px'
        document.getElementById("gif-container").style.float = 'right'
        document.getElementById("gif-container").style.marginBottom = '10%'
        document.getElementById("gif-container").style.display = 'block'
    break;
    case 'levenshtein':
        document.getElementById("levenshtein").style.display = 'block'
    break;
    case 'blacklisted':
        document.getElementById("blacklisted").style.display = 'block'
    break;
    default:
        // No default action.
    break;
} 

//Populate the link to EtherScamDB
let cleandomain = encodeURI(b[1].replace(/https?\:?\/?\/?w{0,3}\.?/,"").replace(/\/$/,""));
document.getElementById("link-etherscamdb").href = "https://etherscamdb.info/domain/"+cleandomain;
document.getElementById("link-etherscamdb").textContent = "https://etherscamdb.info/domain/"+cleandomain;