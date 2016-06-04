
document.addEventListener('DOMContentLoaded', function() {

    var e_token = TOKE_HERE;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://api.envato.com/v1/discovery/search/search/comment?item_id=13398377&page=1&sort_by=newest", true);
    //xhr.open('GET', "https://api.envato.com/v1/market/user-items-by-site:pixelgrade.json", true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + e_token);

    // see if I managed to get into the right json with the credentials
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4) {
            if (xhr.status === 403) {
                console.log("Oh no, it does not exist!");
            }
        }
    };

    // display the response
    xhr.onload = function () {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
    };

    xhr.send();
});
