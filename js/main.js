import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import popper from 'popper.js';

window.$ = $;

function createTable(data) {

	let table = $('<table/>');
	table.addClass('table');
	let thead = $('<thead/>');
	thead.addClass('thead-light');
	let thead_tr = $('<tr/>');
	let theadColumns = ['Create', 'No', 'Supply', 'Comment', ''];
	for (let col of theadColumns) {
		thead_tr.append(`<th scope="col">${col}</th>`);
	}
	thead.append(thead_tr);
	table.append(thead);

	let tbody = $('<tbody/>');
	if (data.length > 0) {
		for (let item of data) {
			let tr = $('<tr/>');
			tr.append(`
	            <td>${new Date(item.date_created).toLocaleDateString()}</td>
	            <td><a href="" class="to-invoice">${item.number}</a></td>
	            <td>${new Date(item.date_supply).toLocaleDateString()}</td>
	            <td>${item.comment}</td>
	            <td class="align-middle">
	                <div class="btn-group" role="group">
	                    <button class="btn btn-sm btn-success">Edit</button>
	                    <button class="btn btn-sm btn-danger">Delete</button>
	                </div>
	            </td>`);
			tbody.append(tr);
		}
	} else {
		let tr = $('<tr/>');
		tr.append(`<td class="text-center" colspan="${theadColumns.length}">По запросу данные не найдены</td>`);
		tbody.append(tr);
	}

	table.append(tbody);

	return table;
}

function getFilteredData() {
	let search = $('#search').val();
	let filter = $('#filter option:selected').text();
	let order = $('#order option:selected').text();
	let order_type = $('#order-type option:selected').text();
	let url = `https://nicon83-invoices.herokuapp.com/invoices?q=${search}&number=${filter}&_sort=${order}&_order=${order_type}`;

	if (filter === 'all') url = `https://nicon83-invoices.herokuapp.com/invoices?q=${search}&_sort=${order}&_order=${order_type}`;
	if (order_type === 'none') url = `https://nicon83-invoices.herokuapp.com/invoices?q=${search}&number=${filter}&_sort=${order}`;
	if (filter === 'all' && order_type === 'none') url = `https://nicon83-invoices.herokuapp.com/invoices?q=${search}&_sort=${order}`;

	return new Promise((resolve, reject) => {
		$.ajax({
			type: "GET",
			url: url,
			success: data => resolve(data)
		})
	});
}

$(document).ready(function () {

	//заполняем селекты
	$.ajax({
		type: "GET",
		url: 'https://nicon83-invoices.herokuapp.com/invoices',
		success: function (data) {
			let invoices;
			invoices = data;
			$.each(invoices[0], (key, value) => {
				$('#order').append($('<option>', {
					value: key,
					text: key
				}));
			});
			$.each(invoices, (key, value) => {
				$('#filter').append($('<option>', {
					value: value.number,
					text: value.number
				}));
			});
		}
	});

	//назначаем обработчик ошибок ajax
	$(document).ajaxError(function (event, request, settings) {
		console.error('Ajax error in file: ', event.currentTarget.documentURI);
	});

	//заполнение таблицы первичными данными
	if (document.URL.indexOf('index.html') !== -1) {
		$.ajax({
			type: "GET",
			url: 'https://nicon83-invoices.herokuapp.com/invoices',
			success: function (data) {
				let table = createTable(data);
				$('#table-content').append(table);
			}
		});
	}

	//обработчики событий
	$('#create-invoice').click(() => window.location = './create.html');

	let container = $('.container');
	container.on('click', '.to-invoice', event => event.preventDefault());

	container.on('click', '#go', async event => {
		event.preventDefault();
		try {
			let data = await getFilteredData();
			let table_content = $('#table-content');
			table_content.empty();
			let table = createTable(data);
			table_content.append(table);
		} catch (error) {
			console.error(error);
		}
	});
});

