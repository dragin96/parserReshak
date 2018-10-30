const request = require('request');
const iconv  = require('iconv-lite');
const jsdom = require('jsdom');
const fs = require('fs');

const { JSDOM } = jsdom;

function get_document(url, success) {
	request.get({
		url: url,
		encoding: null,
		headers: {
			'User-Agent': 'ReshakParser'
		}
	}, (err, res, body) => {
		if (err)
			return console.log(err);

		var dom = new JSDOM(iconv.decode(body, 'cp1251'));

		document = dom.window.document;

		success(document);
	});
}

function fetch_menu() {
	get_document('https://reshak.ru/', document => {
		console.log('get classes');

		var class_list = {};

		for (var menu_link of document.querySelector('.tablemenu').querySelectorAll('a')) {
			var class_url = menu_link.getAttribute('href');
			var class_name = menu_link.textContent.trim();

			if (class_url != '/') {
				fetch_books(`https://reshak.ru${class_url}`, data => {
					class_list[class_name] = data;
				});

				break;
			}
		}

		fs.writeFileSync('data.json', JSON.stringify(class_list));
	});
}

function fetch_books(url, success) {
	get_document(url, document => {
		console.log('get books', url);

		var book_list = {};

		for (var book of document.querySelector('#dle-content').querySelectorAll('.base.shortstory')) {
			var book_node = book.querySelector('a');
			var book_url = book_node.getAttribute('href');
			var book_name = book_node.textContent.trim();

			if (book_url.length > 0) {
				fetch_book(`https://reshak.ru${book_url}`, data => {
					book_list[book_name] = data;
				});
			}
		}

		success(book_list);
	});
}

function fetch_book(url, success) {
	get_document(url, document => {
		console.log('get book', url);

		var slidemenu = document.querySelector('.contentlist-index');

		if (slidemenu)
			slidemenu = slidemenu.querySelector('#slidemenu');
		else
			slidemenu = null;

		var razdel = document.querySelector('#razdel');

		if (slidemenu) {
			var units = slidemenu.querySelectorAll('.sublnk1');
			var unit_names = slidemenu.querySelectorAll('span.sublnk');

			var unit_list = {};

			for (var i = 0; i < units.length; i++) {
				unit_list[unit_names[i].textContent] = {};

				for (var unit of units) {
					var part_name = null;

					for (var child of unit.childNodes) {
						if (child.nodeType == 3 && child.textContent.trim().length > 3) {
							part_name = child.textContent.trim();

							unit_list[unit_names[i].textContent][part_name] = [];
						} else if (child.nodeType == 1) {
							if (part_name && child.getAttribute('href'))
								unit_list[unit_names[i].textContent][part_name].push(child.getAttribute('href'));
						}
					}
				}
			}

			return success(unit_list);
		}

		if (razdel) {
			var task_list = {};

			for (var task of razdel.querySelectorAll('a')) {
				if (task.getAttribute('href').slice(-3) != 'old') {
					task_list[task.textContent] = task.getAttribute('href');
				}
			}

			return success(task_list);
		}
	});
}

fetch_menu();