/**
 * Create a repeatable task to get the latest comments every 15 mins
 */

var EnvatoCommentsChecker = (function() {

	var $envato_token,$items_ids,$recheck_time;

	function init() {

		// get all the envato comments only when you have a token
		chrome.storage.sync.get({
			envato_token: null,
			items_ids: null,
			recheck_time: 60
		}, function(items) {

			$recheck_time = items.recheck_time;
			$envato_token = items.envato_token;
			$items_ids = items.items_ids;

			run_check();
			setInterval( run_check, parseInt( $recheck_time + '000' ) );
		});

	}

	var run_check = function() {
		if ( $envato_token !== null && $envato_token !== "" && $items_ids !== null ) {
			get_envato_comments( $envato_token, $items_ids );
		} else {
			updateIcon('wrong');
		}
	};

	var save_data = function ( val ) {
		var result = {};
		result['envato_api_results'] = JSON.stringify( val );
		chrome.storage.local.set(result, function() {
			if (chrome.extension.lastError) {
				console.log('An error occurred: ' + chrome.extension.lastError.message);
			}
		});
	};

	var get_envato_comments = function ( envato_token, ids  ) {

		chrome.storage.local.get( 'envato_api_results', function (result) {
			var market = 'http://themeforest.net',
				items_ids = ids.split(','),
				envato_api_results = result.envato_api_results;

			envato_api_results = JSON.parse( envato_api_results );

			if ( envato_api_results === '' || envato_api_results === null ) {
				envato_api_results = {}
			}
			/**
			 * For each item, ask for data from envato API
			 */
			items_ids.forEach( function( item_id, index ){

				var xhr = new XMLHttpRequest();
				xhr.open('GET', "https://api.envato.com/v1/discovery/search/search/comment?item_id=" + item_id + "&page=1&sort_by=newest", true);
				xhr.setRequestHeader('Authorization', 'Bearer ' + envato_token);

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

					var response = JSON.parse(xhr.responseText),
						new_item_json = {},
						notify = false,
						item_name = null;

					response.matches.forEach( function( comment, comment_count ){

						if (
							typeof envato_api_results[item_id] !== "undefined"
							&& typeof envato_api_results[item_id]['comments'] !== "undefined"
							&& envato_api_results[item_id]['name'] !== null
							&& typeof envato_api_results[item_id]['comments'][comment.id].read !== "undefined"
						) {
							new_item_json[comment.id] = envato_api_results[item_id]['comments'][comment.id]
						} else {
							notify = true;
							var comment_text = comment.highlightable[0];
							comment_text = comment_text.substring(9);
							comment_text = strip_html(comment_text);
							comment_text = comment_text.substring(0, 30);

							new_item_json[comment.id] = {
								comment_content: comment_text,
								comment_link: market + '/comments/' + comment.id
							};
						}

						if ( comment_count === 0 ) {
							item_name = comment.item_name;
						}
					});

					envato_api_results[item_id] = {
						name: item_name,
						comments: new_item_json
					};

					// save_data({});
					save_data(envato_api_results);

					if ( notify === true ) {
						updateIcon('new');
					}
				};
				xhr.send();
			});

		} );
	};

	var strip_html = function ( html ) {
		var tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	// update the browser icon as the extension state is
	var updateIcon = function ( $icon_name ) {
		if ( typeof $icon_name === "undefined" ) {
			return;
		}
		chrome.browserAction.setIcon({path: {
			"19": "icons/icon-" + $icon_name + "-19.png",
			"38": "icons/icon-" + $icon_name + "-38.png"
		}});
	};

	return {
		init: init
	}
})();

EnvatoCommentsChecker.init();