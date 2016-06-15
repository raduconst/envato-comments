document.addEventListener('DOMContentLoaded', function () {

	// this function adds html for a single envato item
	var build_item_html = function (item, item_wrapper) {

		var counter = 0;

		if ( typeof item.comments === "undefined" ) {
			return;
		}

		while ( counter !== null ) {

			if ( typeof item.comments[counter] === "undefined" ) {
				counter = null;
				continue;
			}

			var comment = item.comments[counter];

			var comment_wrapper = document.createElement('li');
			var comment_link = document.createElement('a');
			comment_wrapper.setAttribute('id', 'comment_id_' + counter);

			if ( comment.hasOwnProperty('read') ) {
				comment_wrapper.setAttribute('style', 'background:#333;' );
			}

			comment_link.setAttribute('href',  comment.comment_link );
			comment_link.setAttribute('target', '_blank' );
			comment_link.appendChild(document.createTextNode(comment.comment_content));
			comment_wrapper.appendChild(comment_link);
			item_wrapper.appendChild(comment_wrapper);

			counter++;
		}
	};

	// this function builds the popul base html
	var build_popup_html = function (items) {
		// no items no fun
		if ( typeof items.items_ids === "undefined" || items.items_ids === "" ) {
			return false;
		}

		// these api_results
		var api_results = localStorage.getItem('envato_api_results');

		if ( typeof api_results === "undefined" ) {
			return;
		}

		api_results = JSON.parse(api_results);
		var items_ids = items.items_ids.split(',');

		// for each envato item create a div element composed from a title and a list of comments
		items_ids.forEach(function (item_id, index) {

			if (typeof  api_results[item_id] === "undefined") {
				return;
			}

			var item_wrapper = document.createElement('ul');
			var title_wrapper = document.createElement('h3');

			title_wrapper.appendChild(document.createTextNode(api_results[item_id].name));

			item_wrapper.setAttribute('id', 'item_id_' + item_id);

			build_item_html(api_results[item_id], item_wrapper);

			var item_element = document.createElement('div');
			item_element.appendChild(title_wrapper);
			item_element.appendChild(item_wrapper);


			var items_list = document.getElementById('items_list');
			items_list.appendChild(item_element);
		});

	};

	// we get our settings from the chrome storage and build our popup html with them
	chrome.storage.sync.get({
		items_ids: null
	}, build_popup_html);
});



