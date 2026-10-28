/* ================================================================
   Litty — Static Site Behaviour
   Vanilla JS, no dependencies. Cart + wishlist live in localStorage;
   forms post to Netlify Forms (with a local demo mode).
   ================================================================ */
(function () {
	'use strict';

	var CART_KEY = 'litty.cart.v1';
	var WISH_KEY = 'litty.wishlist.v1';

	function readJSON(id, fallback) {
		var node = document.getElementById(id);
		if (!node) return fallback;
		try {
			return JSON.parse(node.textContent);
		} catch (error) {
			return fallback;
		}
	}

	var CFG = readJSON('site-config', {
		currency: '₦',
		freeShippingThreshold: 75000,
		shippingFee: 7500,
		vatRate: 0.075,
		whatsapp: '',
		email: ''
	});
	var CATALOG = readJSON('product-catalog', []);
	var BY_ID = new Map(CATALOG.map(function (product) { return [product.id, product]; }));

	var DEMO = location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1'].indexOf(location.hostname) !== -1;

	/* ── Utilities ─────────────────────────────────────────────── */
	function storeGet(key, fallback) {
		try {
			var value = JSON.parse(localStorage.getItem(key));
			return value == null ? fallback : value;
		} catch (error) {
			return fallback;
		}
	}

	function storeSet(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			/* Storage can be unavailable in private mode — the page still works. */
		}
	}

	function money(value) {
		return CFG.currency + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	function escapeHTML(value) {
		return String(value == null ? '' : value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function icon(product) {
		return '<i class="fas ' + escapeHTML(product.icon) + '" aria-hidden="true"></i>';
	}

	function priceHTML(product) {
		var original = product.originalPrice
			? '<span class="original">' + money(product.originalPrice) + '</span>'
			: '';
		return original + money(product.price);
	}

	function toast(message) {
		var el = document.createElement('div');
		el.className = 'toast';
		el.setAttribute('role', 'status');
		el.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i><span></span>';
		el.querySelector('span').textContent = message;
		document.body.appendChild(el);
		requestAnimationFrame(function () {
			el.classList.add('is-visible');
		});
		window.setTimeout(function () {
			el.classList.remove('is-visible');
			window.setTimeout(function () {
				if (el.parentNode) el.parentNode.removeChild(el);
			}, 300);
		}, 2600);
	}

	/* ── Cart state ────────────────────────────────────────────── */
	function getCart() {
		var raw = storeGet(CART_KEY, []);
		if (!Array.isArray(raw)) return [];
		return raw.filter(function (item) {
			return item && typeof item.id === 'string' && Number(item.qty) > 0 && BY_ID.has(item.id);
		}).map(function (item) {
			return { id: item.id, qty: Math.max(1, Math.floor(Number(item.qty))) };
		});
	}

	function cartCount() {
		return getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
	}

	function cartTotals(cart) {
		var subtotal = cart.reduce(function (sum, item) {
			var product = BY_ID.get(item.id);
			return sum + (product ? product.price * item.qty : 0);
		}, 0);
		var shipping = subtotal === 0 ? 0 : (subtotal >= CFG.freeShippingThreshold ? 0 : CFG.shippingFee);
		var vat = Math.round(subtotal * CFG.vatRate);
		return {
			subtotal: subtotal,
			shipping: shipping,
			vat: vat,
			total: subtotal + shipping + vat,
			remainingForFreeShipping: Math.max(0, CFG.freeShippingThreshold - subtotal)
		};
	}

	function saveCart(cart) {
		storeSet(CART_KEY, cart);
		updateCounts();
		renderCartPage();
		renderCheckoutPage();
	}

	function addToCart(id, silent) {
		var product = BY_ID.get(id);
		if (!product) return;
		var cart = getCart();
		var line = cart.find(function (item) { return item.id === id; });
		if (line) {
			line.qty += 1;
		} else {
			cart.push({ id: id, qty: 1 });
		}
		saveCart(cart);
		if (!silent) toast(product.name + ' added to cart');
	}

	function setQty(id, delta) {
		var cart = getCart();
		var line = cart.find(function (item) { return item.id === id; });
		if (!line) return;
		line.qty += delta;
		if (line.qty < 1) {
			cart = cart.filter(function (item) { return item.id !== id; });
		}
		saveCart(cart);
	}

	function removeFromCart(id) {
		var product = BY_ID.get(id);
		saveCart(getCart().filter(function (item) { return item.id !== id; }));
		if (product) toast(product.name + ' removed from cart');
	}

	/* ── Wishlist state ────────────────────────────────────────── */
	function getWishlist() {
		var raw = storeGet(WISH_KEY, []);
		if (!Array.isArray(raw)) return [];
		var seen = {};
		return raw.filter(function (id) {
			if (typeof id !== 'string' || !BY_ID.has(id) || seen[id]) return false;
			seen[id] = true;
			return true;
		});
	}

	function saveWishlist(ids) {
		storeSet(WISH_KEY, ids);
		updateCounts();
		syncWishlistButtons();
		renderWishlistPage();
	}

	function toggleWishlist(id) {
		var product = BY_ID.get(id);
		if (!product) return;
		var wishlist = getWishlist();
		var index = wishlist.indexOf(id);
		if (index === -1) {
			wishlist.push(id);
			toast(product.name + ' saved to wishlist');
		} else {
			wishlist.splice(index, 1);
			toast(product.name + ' removed from wishlist');
		}
		saveWishlist(wishlist);
	}

	/* ── Shared UI sync ────────────────────────────────────────── */
	function updateCounts() {
		var count = cartCount();
		var wishCount = getWishlist().length;

		document.querySelectorAll('[data-cart-count]').forEach(function (el) {
			el.textContent = String(count);
			el.hidden = count === 0;
		});

		document.querySelectorAll('[data-cart-items-label]').forEach(function (el) {
			el.textContent = count + (count === 1 ? ' item' : ' items');
		});

		document.querySelectorAll('[data-cart-items-short]').forEach(function (el) {
			el.textContent = count === 0 ? 'Your cart is empty' : count + (count === 1 ? ' item in your cart' : ' items in your cart');
		});

		document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
			el.textContent = String(wishCount);
			el.hidden = wishCount === 0;
		});

		document.querySelectorAll('[data-wishlist-items-label]').forEach(function (el) {
			el.textContent = wishCount + (wishCount === 1 ? ' item' : ' items');
		});

		document.querySelectorAll('[data-wishlist-items-short]').forEach(function (el) {
			el.textContent = wishCount === 0 ? 'No saved items yet' : wishCount + (wishCount === 1 ? ' saved piece' : ' saved pieces');
		});

		updateWhatsAppLinks();
	}

	function syncWishlistButtons() {
		var saved = getWishlist();
		document.querySelectorAll('[data-wishlist-toggle]').forEach(function (button) {
			var id = button.getAttribute('data-wishlist-toggle');
			var isSaved = saved.indexOf(id) !== -1;
			button.classList.toggle('is-saved', isSaved);
			button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
			var iconEl = button.querySelector('i');
			if (iconEl) {
				iconEl.classList.toggle('fas', isSaved);
				iconEl.classList.toggle('far', !isSaved);
			}
		});
	}

	function whatsappMessage() {
		var cart = getCart();
		if (!cart.length) {
			return 'Hi Litty! I have a question about your handcrafted pieces.';
		}
		var totals = cartTotals(cart);
		var lines = cart.map(function (item) {
			var product = BY_ID.get(item.id);
			return '• ' + item.qty + ' × ' + product.name + ' — ' + money(product.price * item.qty);
		});
		return 'Hi Litty! I would like to order:\n' + lines.join('\n') +
			'\n\nSubtotal: ' + money(totals.subtotal) +
			'\nShipping: ' + (totals.shipping === 0 ? 'Free' : money(totals.shipping)) +
			'\nVAT: ' + money(totals.vat) +
			'\nTotal: ' + money(totals.total);
	}

	function whatsappHref(message) {
		return 'https://wa.me/' + encodeURIComponent(CFG.whatsapp || '') + '?text=' + encodeURIComponent(message);
	}

	function updateWhatsAppLinks() {
		document.querySelectorAll('[data-whatsapp-order]').forEach(function (link) {
			link.setAttribute('href', whatsappHref(whatsappMessage()));
		});
	}

	/* ── Product card markup (JS-rendered lists) ───────────────── */
	function productThumbHTML(product) {
		if (product.image) {
			return '<img class="thumb" src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" width="600" height="400" loading="lazy">';
		}
		return '<div class="thumb" aria-hidden="true">' + icon(product) + '</div>';
	}

	function productCardHTML(product) {
		var saved = getWishlist().indexOf(product.id) !== -1;
		var badge = product.badge
			? '<span class="card-badge">' + escapeHTML(product.badge) + '</span>'
			: '';
		return '' +
			'<article class="card product-card" data-product-id="' + escapeHTML(product.id) + '" data-product-name="' + escapeHTML(product.name) + '" data-product-price="' + product.price + '">' +
				'<div class="card-image">' +
					productThumbHTML(product) +
					badge +
					'<button type="button" class="card-wishlist' + (saved ? ' is-saved' : '') + '" data-wishlist-toggle="' + escapeHTML(product.id) + '" aria-label="' + (saved ? 'Remove ' : 'Save ') + escapeHTML(product.name) + (saved ? ' from' : ' to') + ' wishlist" aria-pressed="' + (saved ? 'true' : 'false') + '">' +
						'<i class="' + (saved ? 'fas' : 'far') + ' fa-heart" aria-hidden="true"></i>' +
					'</button>' +
				'</div>' +
				'<div class="card-content">' +
					'<h4>' + escapeHTML(product.name) + '</h4>' +
					'<p>' + escapeHTML(product.description) + '</p>' +
					'<div class="card-price">' + priceHTML(product) + '</div>' +
					'<button type="button" class="btn primary small add-to-cart-btn" data-add-to-cart>Add to Cart</button>' +
				'</div>' +
			'</article>';
	}

	/* ── Cart page ────────────────────────────────────────────── */
	function cartItemHTML(item) {
		var product = BY_ID.get(item.id);
		if (!product) return '';
		return '' +
			'<div class="cart-item" data-cart-row="' + escapeHTML(product.id) + '">' +
				'<div class="cart-item-image">' + productThumbHTML(product) + '</div>' +
				'<div class="cart-item-details">' +
					'<h4><a href="/' + escapeHTML(product.categorySlug) + '/#' + escapeHTML(product.id) + '">' + escapeHTML(product.name) + '</a></h4>' +
					'<p>' + escapeHTML(product.categoryName) + '</p>' +
				'</div>' +
				'<div class="cart-item-quantity">' +
					'<button type="button" class="qty-btn" data-cart-decrease aria-label="Decrease quantity of ' + escapeHTML(product.name) + '">&minus;</button>' +
					'<input type="number" value="' + item.qty + '" min="1" readonly aria-label="Quantity of ' + escapeHTML(product.name) + '">' +
					'<button type="button" class="qty-btn" data-cart-increase aria-label="Increase quantity of ' + escapeHTML(product.name) + '">+</button>' +
				'</div>' +
				'<div class="cart-item-price">' + money(product.price * item.qty) + '</div>' +
				'<button type="button" class="cart-item-remove" data-cart-remove aria-label="Remove ' + escapeHTML(product.name) + ' from cart">' +
					'<i class="fas fa-times" aria-hidden="true"></i>' +
				'</button>' +
			'</div>';
	}

	function fillTotals(root, totals) {
		if (!root) return;
		var shippingText = totals.subtotal === 0 ? money(0) : (totals.shipping === 0 ? 'Free' : money(totals.shipping));
		root.querySelectorAll('[data-subtotal]').forEach(function (el) { el.textContent = money(totals.subtotal); });
		root.querySelectorAll('[data-shipping]').forEach(function (el) { el.textContent = shippingText; });
		root.querySelectorAll('[data-vat]').forEach(function (el) { el.textContent = money(totals.vat); });
		root.querySelectorAll('[data-total]').forEach(function (el) { el.textContent = money(totals.total); });

		var note = 'Free shipping on orders over ' + money(CFG.freeShippingThreshold) + '.';
		if (totals.subtotal > 0) {
			note = totals.shipping === 0
				? 'You have unlocked free shipping.'
				: 'Add ' + money(totals.remainingForFreeShipping) + ' more for free shipping.';
		}
		root.querySelectorAll('[data-shipping-note]').forEach(function (el) { el.textContent = note; });
	}

	function renderCartPage() {
		var list = document.querySelector('[data-cart-list]');
		if (!list) return;

		var empty = document.querySelector('[data-cart-empty]');
		var summary = document.querySelector('[data-cart-summary]');
		var cart = getCart();
		var totals = cartTotals(cart);

		if (!cart.length) {
			list.hidden = true;
			list.innerHTML = '';
			if (empty) empty.hidden = false;
			if (summary) summary.hidden = true;
			return;
		}

		if (empty) empty.hidden = true;
		list.hidden = false;
		if (summary) summary.hidden = false;
		list.innerHTML = cart.map(cartItemHTML).join('');
		fillTotals(document, totals);
	}

	/* ── Checkout page ────────────────────────────────────────── */
	function renderCheckoutPage() {
		var itemsRoot = document.querySelector('[data-checkout-items]');
		if (!itemsRoot) return;

		var wrap = document.querySelector('[data-checkout-wrap]');
		var empty = document.querySelector('[data-checkout-empty]');
		var success = document.querySelector('[data-order-success]');
		var cart = getCart();
		var totals = cartTotals(cart);

		if (!cart.length) {
			itemsRoot.innerHTML = '';
			if (wrap) wrap.hidden = true;
			if (success) success.hidden = true;
			if (empty) empty.hidden = false;
			return;
		}

		if (wrap) wrap.hidden = false;
		if (empty) empty.hidden = true;
		itemsRoot.innerHTML = cart.map(function (item) {
			var product = BY_ID.get(item.id);
			if (!product) return '';
			return '' +
				'<div class="summary-item">' +
					'<div class="summary-item-image">' + productThumbHTML(product) + '</div>' +
					'<div class="summary-item-details">' +
						'<h4>' + escapeHTML(product.name) + '</h4>' +
						'<p>Qty: ' + item.qty + '</p>' +
					'</div>' +
					'<div class="summary-item-price">' + money(product.price * item.qty) + '</div>' +
				'</div>';
		}).join('');
		fillTotals(document, totals);
	}

	/* ── Wishlist page ────────────────────────────────────────── */
	function renderWishlistPage() {
		var list = document.querySelector('[data-wishlist-list]');
		if (!list) return;

		var empty = document.querySelector('[data-wishlist-empty]');
		var actions = document.querySelector('[data-wishlist-actions]');
		var ids = getWishlist();
		var products = ids.map(function (id) { return BY_ID.get(id); }).filter(Boolean);

		if (!products.length) {
			list.hidden = true;
			list.innerHTML = '';
			if (empty) empty.hidden = false;
			if (actions) actions.hidden = true;
			return;
		}

		if (empty) empty.hidden = true;
		list.hidden = false;
		list.innerHTML = products.map(productCardHTML).join('');
		if (actions) actions.hidden = false;
		syncWishlistButtons();
	}

	/* ── Add to cart / wishlist delegation ────────────────────── */
	function bindProductActions() {
		document.addEventListener('click', function (event) {
			var addButton = event.target.closest('.add-to-cart-btn, .card-quick-add');
			if (addButton) {
				event.preventDefault();
				var card = addButton.closest('[data-product-id]');
				if (!card) return;
				addToCart(card.getAttribute('data-product-id'));

				if (addButton.classList.contains('add-to-cart-btn')) {
					if (!addButton.dataset.originalLabel) {
						addButton.dataset.originalLabel = addButton.textContent.trim();
					}
					addButton.classList.add('is-added');
					addButton.textContent = 'Added';
					window.clearTimeout(addButton._resetTimer);
					addButton._resetTimer = window.setTimeout(function () {
						addButton.classList.remove('is-added');
						addButton.textContent = addButton.dataset.originalLabel;
					}, 1500);
				}
				return;
			}

			var wishButton = event.target.closest('[data-wishlist-toggle]');
			if (wishButton) {
				event.preventDefault();
				toggleWishlist(wishButton.getAttribute('data-wishlist-toggle'));
			}
		});

		var cartList = document.querySelector('[data-cart-list]');
		if (cartList) {
			cartList.addEventListener('click', function (event) {
				var row = event.target.closest('[data-cart-row]');
				if (!row) return;
				var id = row.getAttribute('data-cart-row');
				if (event.target.closest('[data-cart-increase]')) {
					setQty(id, 1);
				} else if (event.target.closest('[data-cart-decrease]')) {
					setQty(id, -1);
				} else if (event.target.closest('[data-cart-remove]')) {
					removeFromCart(id);
				}
			});
		}

		var addAll = document.querySelector('[data-wishlist-add-all]');
		if (addAll) {
			addAll.addEventListener('click', function () {
				var ids = getWishlist();
				if (!ids.length) return;
				ids.forEach(function (id) { addToCart(id, true); });
				toast(ids.length + (ids.length === 1 ? ' piece added' : ' pieces added') + ' to cart');
			});
		}
	}

	/* ── Mobile navigation ────────────────────────────────────── */
	function bindMobileNav() {
		var toggle = document.querySelector('[data-nav-toggle]');
		var nav = document.getElementById('main-nav');
		var backdrop = document.querySelector('[data-nav-backdrop]');
		if (!toggle || !nav) return;

		var iconEl = toggle.querySelector('i');

		function open() {
			if (window.closeSearchOverlay) window.closeSearchOverlay();
			nav.classList.add('is-open');
			toggle.classList.add('is-open');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.setAttribute('aria-label', 'Close menu');
			if (iconEl) iconEl.className = 'fas fa-times';
			if (backdrop) {
				backdrop.hidden = false;
				requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
			}
			document.body.classList.add('nav-open');
		}

		function close() {
			nav.classList.remove('is-open');
			toggle.classList.remove('is-open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('aria-label', 'Open menu');
			if (iconEl) iconEl.className = 'fas fa-bars';
			if (backdrop) backdrop.classList.remove('is-visible');
			document.body.classList.remove('nav-open');
			window.setTimeout(function () {
				if (backdrop && !nav.classList.contains('is-open')) backdrop.hidden = true;
			}, 300);
		}

		window.closeMobileNav = close;

		toggle.addEventListener('click', function () {
			if (nav.classList.contains('is-open')) close();
			else open();
		});

		if (backdrop) backdrop.addEventListener('click', close);

		nav.addEventListener('click', function (event) {
			if (event.target.closest('a')) close();
		});

		window.addEventListener('resize', function () {
			if (window.innerWidth > 1024 && nav.classList.contains('is-open')) close();
		});
	}

	/* ── Search overlay ───────────────────────────────────────── */
	function bindSearch() {
		var toggle = document.querySelector('.search-toggle');
		var overlay = document.getElementById('search-overlay');
		var closeButton = document.querySelector('.search-close');
		var input = document.getElementById('site-search');
		if (!toggle || !overlay) return;

		function open() {
			if (window.closeMobileNav) window.closeMobileNav();
			overlay.classList.add('active');
			toggle.setAttribute('aria-expanded', 'true');
			document.body.classList.add('search-open');
			if (input) {
				window.setTimeout(function () { input.focus(); }, 50);
			}
		}

		function close() {
			overlay.classList.remove('active');
			toggle.setAttribute('aria-expanded', 'false');
			document.body.classList.remove('search-open');
		}

		window.closeSearchOverlay = close;

		toggle.addEventListener('click', open);
		if (closeButton) closeButton.addEventListener('click', close);
		overlay.addEventListener('click', function (event) {
			if (event.target === overlay) close();
		});

		var form = overlay.querySelector('form');
		if (form) {
			form.addEventListener('submit', function (event) {
				if (input && !input.value.trim()) {
					event.preventDefault();
					input.focus();
					return;
				}
				close();
			});
		}

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				close();
				if (window.closeMobileNav) window.closeMobileNav();
			}
		});
	}

	/* ── Product filtering (search + sort) ────────────────────── */
	function bindProductFilter() {
		var page = document.querySelector('.page-products');
		if (!page) return;

		var params = new URLSearchParams(window.location.search);
		var query = (params.get('q') || '').trim();
		var sort = (params.get('sort') || '').trim().toLowerCase();
		if (!query && !sort) return;

		var labels = {
			'new': 'New Arrivals',
			'popular': 'Best Sellers',
			'sale': 'On Sale'
		};
		var sections = page.querySelectorAll('[data-products-section]');
		var total = 0;

		sections.forEach(function (section) {
			var visible = 0;
			section.querySelectorAll('.product-card').forEach(function (card) {
				var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
				var badges = (card.getAttribute('data-badges') || '').toLowerCase();
				var match = !query || haystack.indexOf(query.toLowerCase()) !== -1;

				if (sort === 'new') match = match && badges.indexOf('new') !== -1;
				if (sort === 'popular') match = match && /best seller|popular/.test(badges);
				if (sort === 'sale') match = match && card.getAttribute('data-sale') === 'true';

				card.classList.toggle('is-search-hidden', !match);
				if (match) visible += 1;
			});
			section.hidden = visible === 0;
			total += visible;
		});

		page.classList.add('is-filtering');

		var bar = document.getElementById('filter-bar');
		var title = bar ? bar.querySelector('[data-filter-title]') : null;
		var status = bar ? bar.querySelector('[data-filter-status]') : null;

		if (title) {
			title.textContent = query ? 'Search results for “' + query + '”' : (labels[sort] || 'Filtered Products');
		}
		if (status) {
			status.textContent = total === 0
				? 'No pieces found' + (query ? ' for “' + query + '”' : '') + '. Try a different search or clear the filter.'
				: total + (total === 1 ? ' piece found' : ' pieces found') + (query ? ' for “' + query + '”' : '');
		}
		if (bar) bar.hidden = false;
	}

	/* ── Netlify forms ────────────────────────────────────────── */
	function setFormStatus(form, message, type) {
		var el = form.querySelector('[data-form-status]');
		if (!el && form.parentElement) {
			el = form.parentElement.querySelector('[data-form-status]');
		}
		if (!el) return;
		el.textContent = message;
		el.classList.remove('is-success', 'is-error');
		if (type) el.classList.add('is-' + type);
	}

	function submitNetlifyForm(form) {
		if (DEMO) {
			return new Promise(function (resolve) {
				window.setTimeout(function () { resolve({ demo: true }); }, 600);
			});
		}
		var body = new URLSearchParams();
		new FormData(form).forEach(function (value, key) {
			body.append(key, value);
		});
		return fetch('/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString()
		}).then(function (response) {
			if (!response.ok) throw new Error('Request failed: ' + response.status);
			return { demo: false };
		});
	}

	function makeOrderNumber() {
		return 'LITTY-' + Math.random().toString(36).slice(2, 7).toUpperCase();
	}

	function prepareCheckout(form, orderNumber) {
		var cart = getCart();
		if (!cart.length) {
			setFormStatus(form, 'Your cart is empty. Add a piece before sending an order.', 'error');
			return false;
		}
		var totals = cartTotals(cart);
		var lines = cart.map(function (item) {
			var product = BY_ID.get(item.id);
			return item.qty + ' × ' + product.name + ' (' + money(product.price) + ' each) — ' + money(product.price * item.qty);
		});
		var summary = lines.join('\n') +
			'\n\nSubtotal: ' + money(totals.subtotal) +
			'\nShipping: ' + (totals.shipping === 0 ? 'Free' : money(totals.shipping)) +
			'\nVAT: ' + money(totals.vat) +
			'\nTotal: ' + money(totals.total);

		var hidden = form.querySelector('#order-summary');
		if (hidden) hidden.value = summary;
		var reference = form.querySelector('#order-reference');
		if (reference) reference.value = orderNumber;
		form._orderSummary = summary;
		return true;
	}

	function handleOrderSuccess(form, result, orderNumber) {
		var wrap = document.querySelector('[data-checkout-wrap]');
		var empty = document.querySelector('[data-checkout-empty]');
		var success = document.querySelector('[data-order-success]');
		var numberEl = document.querySelector('[data-order-number]');
		var demoNote = document.querySelector('[data-demo-note]');
		var whatsapp = document.querySelector('[data-order-whatsapp]');

		saveCart([]);

		if (wrap) wrap.hidden = true;
		if (empty) empty.hidden = true;
		if (success) success.hidden = false;
		if (numberEl) numberEl.textContent = orderNumber;
		if (demoNote) demoNote.hidden = !result.demo;
		if (whatsapp) {
			var message = 'Hi Litty! I just sent order request ' + orderNumber + '.\n\n' + form._orderSummary;
			whatsapp.setAttribute('href', whatsappHref(message));
		}
		if (success) success.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	function bindForms() {
		var messages = {
			newsletter: 'Thanks! You are on the list.',
			contact: 'Thanks — your message is on its way. We usually reply within 1–2 business days.',
			'track-order': 'Request received. We will email your order status within one business day.'
		};

		document.querySelectorAll('form[data-netlify]').forEach(function (form) {
			form.addEventListener('submit', function (event) {
				event.preventDefault();

				if (!form.checkValidity()) {
					form.reportValidity();
					return;
				}

				var isCheckout = form.getAttribute('data-checkout') === 'true';
				var orderNumber = isCheckout ? makeOrderNumber() : '';
				if (isCheckout && !prepareCheckout(form, orderNumber)) return;

				var button = form.querySelector('[type="submit"]');
				var originalLabel = button ? button.textContent : '';
				if (button) {
					button.disabled = true;
					button.textContent = isCheckout ? 'Sending…' : 'Sending…';
				}
				setFormStatus(form, '', '');

				submitNetlifyForm(form).then(function (result) {
					if (isCheckout) {
						handleOrderSuccess(form, result, orderNumber);
					} else {
						var message = messages[form.getAttribute('name')] || 'Thanks — your message has been sent.';
						if (result.demo) message += ' (Demo mode: this is delivered once the site is on Netlify.)';
						setFormStatus(form, message, 'success');
						form.reset();
					}
				}).catch(function () {
					setFormStatus(
						form,
						'Sorry, we could not send that. Please try again, or email ' + (CFG.email || 'us') + '.',
						'error'
					);
				}).finally(function () {
					if (button) {
						button.disabled = false;
						button.textContent = originalLabel;
					}
				});
			});
		});
	}

	/* ── Category nav ─────────────────────────────────────────── */
	function bindCategoryNav() {
		var scroller = document.querySelector('.category-nav-inner');
		if (!scroller) return;
		var active = scroller.querySelector('.category-nav-item.active');
		if (!active || scroller.scrollWidth <= scroller.clientWidth + 1) return;
		var scrollerRect = scroller.getBoundingClientRect();
		var activeRect = active.getBoundingClientRect();
		var target = scroller.scrollLeft + (activeRect.left - scrollerRect.left) - (scroller.clientWidth - activeRect.width) / 2;
		scroller.scrollLeft = Math.max(0, target);
	}

	/* ── Init ─────────────────────────────────────────────────── */
	function init() {
		bindMobileNav();
		bindSearch();
		bindProductActions();
		bindForms();
		bindProductFilter();
		bindCategoryNav();
		window.addEventListener('load', bindCategoryNav);

		syncWishlistButtons();
		updateCounts();
		renderCartPage();
		renderCheckoutPage();
		renderWishlistPage();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
