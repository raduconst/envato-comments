chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
	log("Got message from background page: " + msg);
});

alert('conteot');