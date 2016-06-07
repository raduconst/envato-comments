document.addEventListener('DOMContentLoaded', function () {


        var generate = function ( commments, item_wrapper ) {
console.log(commments);

            commments.forEach( function( comment, i ){
                var comment_wrapper = document.createElement('li');
                comment_wrapper.setAttribute('id', 'comment_id_' + comment.id );
                var textnode = document.createTextNode( comment.item_name  );       // Create a text node
                comment_wrapper.appendChild(textnode);
                item_wrapper.appendChild(comment_wrapper);
            });
        };

        chrome.storage.sync.get({
            items_ids: '',
            json: ''
        }, function(items) {
            if ( typeof items.items_ids === "undefined" || items.items_ids === "" || typeof items.json === "undefined" ) {
                return false;
            }

            var commments = JSON.parse( items.json );

            commments = JSON.parse( commments );
            commments = JSON.parse( commments );

            var items_ids = items.items_ids.split(',');

            items_ids.forEach( function( item_id, index ){
                var item_wrapper = document.createElement('ul');

                item_wrapper.setAttribute('id', 'item_id_' + item_id );

                generate( commments[item_id], item_wrapper );

                var items_list = document.getElementById('items_list');

                items_list.appendChild(item_wrapper);
            });

        });



});



