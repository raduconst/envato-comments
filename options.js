// Saves options to chrome.storage
function save_options() {
	var envato_token = document.getElementById('envato_token').value;
	var items_ids = document.getElementById('items_ids').value;
	var recheck_time = document.getElementById('recheck_time').value;

	if ( envato_token.length !== 32 ) {
		alert('needs to be 32 chars length, check your token bitch');
		return;
	}
	
	chrome.storage.sync.set({
		envato_token: envato_token,
		items_ids: items_ids,
		recheck_time: recheck_time
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores envato_token state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		envato_token: '',
		items_ids: '',
		recheck_time: 60
	}, function(items) {
		document.getElementById('envato_token').value = items.envato_token;
		document.getElementById('items_ids').value = items.items_ids;
		document.getElementById('recheck_time').value = items.recheck_time;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);