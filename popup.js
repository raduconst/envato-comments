// document.addEventListener('DOMContentLoaded', );
chrome.storage.sync.get({
    items_ids: '',
    json: ''
}, function(items) {

    var local_envato_tracks = localStorage.getItem('local_envato_tracks');
    var commments = JSON.parse( items.json );

    var items_ids = ids.split(',');


    items_ids.forEach( function( item_id, index ){
        
    });

    console.log( commments );
});