
document.addEventListener('DOMContentLoaded', function() {

    var get_envato_comments = function ( envato_token, ids ) {

        var themes_ids = ids.split(',');

        themes_ids.forEach( function( item, index ){


            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://api.envato.com/v1/discovery/search/search/comment?item_id=" + item + "&page=1&sort_by=newest", true);
            xhr.setRequestHeader('Authorization', 'Bearer ' + envato_token);

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
                var status = document.getElementById('status');

                var ul_wrapper = document.createElement("ul");
                ul_wrapper.setAttribute('id', index);
                status.appendChild(ul_wrapper);


                response.matches.forEach( function( i, j ){

                    // setup the theme title
                    if ( j == '0' ) {
                        var theme_title = document.createElement("h3");
                        theme_title.appendChild( document.createTextNode( i.item_name ) );
                        ul_wrapper.appendChild(theme_title);
                    }


                    var li_wrapper = document.createElement("li");
                    var comment_link = document.createElement("a");
                    li_wrapper.setAttribute('id', i.id);


                    var comment_text = i.highlightable[0];

                    comment_text = comment_text.substring(9);

                    comment_text = strip_html( comment_text );

                    comment_link.appendChild( document.createTextNode( comment_text ) );
                    comment_link.setAttribute( 'href', i.url + '#comment_' + i.id );
                    comment_link.setAttribute( 'target', '_blank' );

                    li_wrapper.appendChild( comment_link  );
                    ul_wrapper.appendChild( li_wrapper );
                });
            };

            xhr.send();


        });
    };

    var strip_html = function ( html ) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // get all the envato comments only when you have a token
    chrome.storage.sync.get({
        envato_token: '',
        items_ids: ''
    }, function(items) {
        if ( typeof items.envato_token !== "undefined" && items.envato_token !== "" && typeof items.items_ids !== "undefined" ) {
            get_envato_comments( items.envato_token, items.items_ids );
        } else {
            var status = document.getElementById('status');
            status.textContent = 'You really need an envato token!!';
        }
    });
});
