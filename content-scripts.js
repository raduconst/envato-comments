/**
 *  This script gets all the envato comments if there is a token and only for the items we have set
 */

chrome.storage.sync.get({
	envato_token: null,
	items_ids: null
}, function(items) {
	if ( typeof items.envato_token !== "undefined" && items.envato_token !== "" && typeof items.items_ids !== "undefined" ) {
		/**
		 * This is a helper function which saves data in `chrome.storage.local` under the `envato_api_results key`
		 * @param val
		 */
		var save_data = function ( val ) {
			var result = {};
			result['envato_api_results'] = JSON.stringify( val );
			chrome.storage.local.set(result, function() {
				if (chrome.extension.lastError) {
					console.log('An error occurred: ' + chrome.extension.lastError.message);
				}
			});
		};

		var mark_comments_as_read =  function (result) {
			var envato_api_results = result.envato_api_results;

			if ( envato_api_results === null ) {
				envato_api_results = {}
			} else {
				envato_api_results = JSON.parse(envato_api_results);
			}
			/**
			 * We need the items ids as array so we can iterate
			 * @type {Array}
			 */
			var ids = items.items_ids.split(',');

			ids.forEach( function (item_id, index ) {
				/**
				 * We will bind a scroll event only if:
				 * - the current page is an envato page with our item id in URL
				 * - the API has data for this item id
				 */
				if ( window.location.href.indexOf( item_id ) !== -1  && typeof envato_api_results[item_id] !== "undefined" ) {

					var item_comments = envato_api_results[item_id]['comments'];

					/**
					 * We create a scroll event which gets the comments within viewport and marks them as `read`
					 * in the chrome.storage.local object
					 */
					document.addEventListener("scroll", function ( event ) {
						var comments = document.getElementsByClassName('comment__info');
						for(var i = 0; i < comments.length; i++) {
							var comment_in_viewport = withinviewport( comments[i].nextElementSibling );

							if ( comment_in_viewport ) {
								var comment_id = comments[i].getAttribute('id');
								comment_id = comment_id.replace('comment_', '');

								if ( typeof item_comments[comment_id] !== "undefined" ) {
									item_comments[comment_id].read = true;

									if ( typeof envato_api_results[item_id]['last'] === "undefined" || envato_api_results[item_id]['last'] < comment_id ) {
										envato_api_results[item_id]['last'] = comment_id;
									}
								}
							}
						}

						// debugger;
						envato_api_results[item_id]['comments'] = item_comments;
						save_data(envato_api_results);
					}, false);
				}
			});
		};

		/**
		 * Since the `get` method is async we need to wait the results until we start processing data
		 */
		chrome.storage.local.get( 'envato_api_results', mark_comments_as_read );
	}
});

/**
 * Within Viewport
 *
 * @description Determines whether an element is completely within the browser viewport
 * @author      Craig Patik, http://patik.com/
 * @version     1.0.0
 * @date        2015-08-02
 */
(function (root, name, factory) {
	// AMD
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	// Node and CommonJS-like environments
	else if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = factory();
	}
	// Browser global
	else {
		root[name] = factory();
	}
}(this, 'withinviewport', function () {
	var canUseWindowDimensions = window.innerHeight !== undefined; // IE 8 and lower fail this

	/**
	 * Determines whether an element is within the viewport
	 * @param  {Object}  elem       DOM Element (required)
	 * @param  {Object}  options    Optional settings
	 * @return {Boolean}            Whether the element was completely within the viewport
	 */
	var withinviewport = function withinviewport (elem, options) {
		var result = false;
		var metadata = {};
		var config = {};
		var settings;
		var isWithin;
		var elemBoundingRect;
		var sideNamesPattern;
		var sides;
		var side;
		var i;

		// If invoked by the jQuery plugin, get the actual DOM element
		if (typeof jQuery !== 'undefined' && elem instanceof jQuery) {
			elem = elem.get(0);
		}

		if (typeof elem !== 'object' || elem.nodeType !== 1) {
			throw new Error('First argument must be an element');
		}

		// Look for inline settings on the element
		if (elem.getAttribute('data-withinviewport-settings') && window.JSON) {
			metadata = JSON.parse(elem.getAttribute('data-withinviewport-settings'));
		}

		// Settings argument may be a simple string (`top`, `right`, etc)
		if (typeof options === 'string') {
			settings = {sides: options};
		}
		else {
			settings = options || {};
		}

		// Build configuration from defaults and user-provided settings and metadata
		config.container = settings.container || metadata.container || withinviewport.defaults.container || window;
		config.sides  = settings.sides  || metadata.sides  || withinviewport.defaults.sides  || 'all';
		config.top    = settings.top    || metadata.top    || withinviewport.defaults.top    || 0;
		config.right  = settings.right  || metadata.right  || withinviewport.defaults.right  || 0;
		config.bottom = settings.bottom || metadata.bottom || withinviewport.defaults.bottom || 0;
		config.left   = settings.left   || metadata.left   || withinviewport.defaults.left   || 0;

		// Use the window as the container if the user specified the body or a non-element
		if (config.container === document.body || !config.container.nodeType === 1) {
			config.container = window;
		}

		// Element testing methods
		isWithin = {
			// Element is below the top edge of the viewport
			top: function _isWithin_top () {
				return elemBoundingRect.top >= config.top;
			},

			// Element is to the left of the right edge of the viewport
			right: function _isWithin_right () {
				var containerWidth;

				if (canUseWindowDimensions || config.container !== window) {
					containerWidth = config.container.innerWidth;
				}
				else {
					containerWidth = document.documentElement.clientWidth;
				}

				// Note that `elemBoundingRect.right` is the distance from the *left* of the viewport to the element's far right edge
				return elemBoundingRect.right <= containerWidth - config.right;
			},

			// Element is above the bottom edge of the viewport
			bottom: function _isWithin_bottom () {
				var containerHeight;

				if (canUseWindowDimensions || config.container !== window) {
					containerHeight = config.container.innerHeight;
				}
				else {
					containerHeight = document.documentElement.clientHeight;
				}

				// Note that `elemBoundingRect.bottom` is the distance from the *top* of the viewport to the element's bottom edge
				return elemBoundingRect.bottom <= containerHeight - config.bottom;
			},

			// Element is to the right of the left edge of the viewport
			left: function _isWithin_left () {
				return elemBoundingRect.left >= config.left;
			},

			// Element is within all four boundaries
			all: function _isWithin_all () {
				// Test each boundary in order of most efficient and most likely to be false so that we can avoid running all four functions on most elements
				// Top: Quickest to calculate + most likely to be false
				// Bottom: Note quite as quick to calculate, but also very likely to be false
				// Left and right are both equally unlikely to be false since most sites only scroll vertically, but left is faster
				return (isWithin.top() && isWithin.bottom() && isWithin.left() && isWithin.right());
			}
		};

		// Get the element's bounding rectangle with respect to the viewport
		elemBoundingRect = elem.getBoundingClientRect();

		// Test the element against each side of the viewport that was requested
		sideNamesPattern = /^top$|^right$|^bottom$|^left$|^all$/;
		// Loop through all of the sides
		sides = config.sides.split(' ');
		i = sides.length;
		while (i--) {
			side = sides[i].toLowerCase();

			if (sideNamesPattern.test(side)) {
				if (isWithin[side]()) {
					result = true;
				}
				else {
					result = false;

					// Quit as soon as the first failure is found
					break;
				}
			}
		}

		return result;
	};

	// Default settings
	withinviewport.prototype.defaults = {
		container: document.body,
		sides: 'all',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};

	withinviewport.defaults = withinviewport.prototype.defaults;

	/**
	 * Optional enhancements and shortcuts
	 *
	 * @description Uncomment or comment these pieces as they apply to your project and coding preferences
	 */

	// Shortcut methods for each side of the viewport
	// Example: `withinviewport.top(elem)` is the same as `withinviewport(elem, 'top')`
	withinviewport.prototype.top = function _withinviewport_top (element) {
		return withinviewport(element, 'top');
	};

	withinviewport.prototype.right = function _withinviewport_right (element) {
		return withinviewport(element, 'right');
	};

	withinviewport.prototype.bottom = function _withinviewport_bottom (element) {
		return withinviewport(element, 'bottom');
	};

	withinviewport.prototype.left = function _withinviewport_left (element) {
		return withinviewport(element, 'left');
	};

	return withinviewport;
}));