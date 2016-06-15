/**
 * Create a repeatable task to get the latest comments every 15 mins
 */

setInterval(function() {

	var get_envato_comments = function ( envato_token, ids, json ) {

		var market = 'http://themeforest.net';

		var items_ids = ids.split(',');

		var local_envato_tracks = localStorage.getItem('local_envato_tracks');

		if ( local_envato_tracks === null ) {
			local_envato_tracks = {}
		} else {
			local_envato_tracks = JSON.parse( local_envato_tracks );
		}

		if ( json === '' || json === null ) {
			json = {}
		}
		
		items_ids.forEach( function( item_id, index ){

			var xhr = new XMLHttpRequest();
			xhr.open('GET', "https://api.envato.com/v1/discovery/search/search/comment?item_id=" + item_id + "&page=1&sort_by=newest", true);
			xhr.setRequestHeader('Authorization', 'Bearer ' + envato_token);

			if ( typeof local_envato_tracks[item_id] === "undefined" )  {
				local_envato_tracks[item_id] = {};
			}

			// see if I managed to get into the right json with the credentials
			xhr.onreadystatechange = function(){
				if (xhr.readyState === 4) {
					if (xhr.status === 403) {
						// @todo send a notifaction to popup
						console.log("Oh no, it does not exist!");
					}
				}
			};

			xhr.onload = function () {
				var response = JSON.parse(xhr.responseText);

				var current_comment_id = 0;

				if ( typeof local_envato_tracks[item_id] !== "undefined" ) {
					current_comment_id = local_envato_tracks[item_id];
				}
				var new_item_json = {};

				var item_name = null;
				response.matches.forEach( function( comment, comment_count ){
					if ( comment.id > current_comment_id ) {
						local_envato_tracks[item_id] = comment.id;
					}

					// @todo maybe merge only the unread comments here
					
					var comment_text = comment.highlightable[0];
					comment_text = comment_text.substring(9);
					comment_text = strip_html( comment_text );
					comment_text = comment_text.substring(0, 50) + ' ...';

					new_item_json[comment_count] = {
						id: comment.id,
						comment_content: comment_text,
						comment_link: market + '/comments/' + comment.id
					};

					if ( comment_count === 0 ) {
						item_name = comment.item_name;
					}
				});

				json[item_id] = {
					name: item_name,
					comments: new_item_json
				};
				localStorage.setItem('envato_api_results', JSON.stringify( json ) );
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
		envato_token: null,
		items_ids: null
	}, function(items) {
		if ( typeof items.envato_token !== "undefined" && items.envato_token !== "" && typeof items.items_ids !== "undefined" ) {

			var json = localStorage.getItem('envato_api_results');

			get_envato_comments( items.envato_token, items.items_ids, JSON.parse( json ) );
		} else {

			// @todo send a notification that options are not set properly

			// var status = document.getElementById('status');
			// status.textContent = 'You really need an envato token!!';
		}
	});
}, 15000);