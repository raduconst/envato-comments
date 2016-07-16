
var PopupBuilder = (function() {

	var $envato_token,$items_ids,$recheck_time;

	function init() {
			// we get our settings from the chrome storage and build our popup html with them
			chrome.storage.sync.get({
				items_ids: null
			}, function (items) {

				$items_ids = items.items_ids;

				chrome.storage.local.get('envato_api_results', function (result) {
					var api_results = result.envato_api_results;

					// no items no fun
					if (typeof items.items_ids === "undefined" || items.items_ids === "" || items.items_ids === null) {
						return false;
					}

					if (typeof api_results === "undefined" || api_results === null) {
						return;
					}

					/**
					 * `api_results` comes as a JSON string we need the object from it
					 */
					api_results = JSON.parse(api_results);

					/**
					 * `items_ids` comes as a string like "1,2,3,4"
					 * We need to transform it into array so we can iterate through it
					 * @type {Array}
					 */
					var items_ids = items.items_ids.split(',');

					/**
					 * For each envato item create a <div> element composed from:
					 * - title
					 * - list of comments
					 */
					items_ids.forEach(function (item_id, index) {

						/**
						 * Here we check if this item id exists in our API result
						 */
						if (typeof  api_results[item_id] === "undefined" && typeof  api_results[item_id].name === "undefined") {
							return;
						}

						var item_element = document.getElementById('item_template').cloneNode( true ),
							item_wrapper = item_element.querySelector('.comments'),
							title = item_element.querySelector('.title'),
							items_list = document.getElementById('items_list');

						title.innerHTML = api_results[item_id].name;

						item_element.setAttribute('id', 'item_id_' + item_id);

						build_item_html(api_results[item_id], item_wrapper);

						item_element.className = 'theme';
						item_element.appendChild(title);
						item_element.appendChild(item_wrapper);

						items_list.appendChild(item_element);
					});
				});
			});
	}

	// this function adds html for a single envato item
	var build_item_html = function (item, item_wrapper) {

		if (typeof item.comments === "undefined") {
			return;
		}

		Object.keys(item.comments).forEach(function (key) {
			var comment = item.comments[key];

			var comment_wrapper = document.getElementById('comment_template').cloneNode( true ),
				comment_link = comment_wrapper.querySelector('a.comment_link');

			comment_wrapper.setAttribute('id', 'comment_id_' + key);

			if (typeof comment.read !== "undefined") {
				return;
				comment_wrapper.setAttribute('style', 'background:#333;');
			}


			comment_wrapper.className = 'comment';
			comment_link.setAttribute('href', comment.comment_link);
			comment_link.setAttribute('target', '_blank');
			comment_link.innerHTML = comment.comment_content;

			item_wrapper.appendChild(comment_wrapper);
		});
	};

	return {
		init: init
	}
})();

// when the document is ready, we start building
document.addEventListener('DOMContentLoaded', function () {
	PopupBuilder.init();
});