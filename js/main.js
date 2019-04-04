import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import popper from 'popper.js';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css';

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
	                    <button class="btn btn-sm btn-success edit" data-id="${item.id}">Edit</button>
	                    <button class="btn btn-sm btn-danger delete" data-id="${item.id}">Delete</button>
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

function fillSelects() {
	$.ajax({
		type: "GET",
		url: 'https://nicon83-invoices.herokuapp.com/invoices',
		success: function (data) {
			let invoices;
			invoices = data;
			let order = $('#order');
			order.empty();
			$.each(invoices[0], (key, value) => {
				$('#order').append($('<option>', {
					value: key,
					text: key
				}));
			});
			let filter = $('#filter');
			filter.empty();
			filter.append('<option selected>all</option>');
			$.each(invoices, (key, value) => {
				$('#filter').append($('<option>', {
					value: value.number,
					text: value.number
				}));
			});
		}
	});
}

function createTableForUpdateInvoice(data) {
	let div = $('<div></div>');
	div.addClass('card');
	div.append(`<div id="create-form" class="card-body">
			<form>
				<span id="invoice-id" hidden>${data.id}</span>
				<div class="card mb-4">
					<div class="card-body">
						<div class="form-row mb-5">
						<div class="col">
						<label for="number" class="font-weight-bold text-secondary">Number:</label>
					<div class="input-group">
						<input type="text" class="form-control" id="number" placeholder="" value="${data.number}" required>
					<div class="input-group-append">
						<span class="input-group-text"><i class="fas fa-list-ol"></i></span>
					</div>
					</div>
					</div>
					<div class="col">
						<label for="invoice-date" class="font-weight-bold text-secondary">Invoice Date:</label>
					<div class="input-group">
						<input type="text" class="form-control" id="invoice-date" placeholder="" value="${data.date_created}"
					data-provide="datepicker"
					data-date-format="dd MM yyyy"
						>
						<div class="input-group-append">
						<span class="input-group-text"><i class="far fa-calendar-alt"></i></span>
					</div>
					</div>
					</div>
					</div>
				<div class="form-row mb-5">
					<div class="col-6">
					<label for="supply-date" class="font-weight-bold text-secondary">Supply
				Date:</label>
				<div class="input-group">
					<input type="text" class="form-control" id="supply-date" placeholder="" value="${data.date_supply}"
				data-provide="datepicker"
				data-date-format="dd MM yyyy"
					>
					<div class="input-group-append">
					<span class="input-group-text"><i class="far fa-calendar-alt"></i></span>
				</div>
				</div>
				</div>
				</div>
				<div class="form-row mb-5">
					<div class="col">
					<label for="comment" class="font-weight-bold text-secondary">Comment:</label>
				<textarea type="text" class="form-control" id="comment" placeholder="">${data.comment}</textarea>
					</div>
					</div>
					</div>
				</div>
				<div class="text-right">
				<button type="button" class="btn btn-primary" id="update">Update</button>
				</div>
			</form>
		</div>`
	);
	return div;
}

function getUpdateInvoiceData(invoiceId) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "GET",
			url: `https://nicon83-invoices.herokuapp.com/invoices/${invoiceId}`,
			success: data => resolve(data)
		})
	});
}

$(document).ready(function () {

	//заполняем селекты
	fillSelects();

	//назначаем обработчик ошибок ajax
	$(document).ajaxError(function (event, request, settings) {
		console.error('Ajax error in file: ', event.currentTarget.documentURI);
	});

	//заполнение таблицы первичными данными
	$.ajax({
		type: "GET",
		url: 'https://nicon83-invoices.herokuapp.com/invoices',
		success: function (data) {
			let table = createTable(data);
			$('#table-content').append(table);
		}
	});

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

	//create invoice
	$('#save').click(event => {
		event.preventDefault();
		let data = {
			number: $('#number').val(),
			date_created: $('#invoice-date').val(),
			date_supply: $('#supply-date').val(),
			comment: $('#comment').val()
		};

		$.ajax({
			type: "POST",
			contentType: "application/json",
			url: 'https://nicon83-invoices.herokuapp.com/invoices',
			data: JSON.stringify(data),
			success: function (data) {
				window.location = './index.html';
			}
		});
	});

	//update invoice
	container.on('click', '#update', event => {
		event.preventDefault();

		let invoiceId = $('#invoice-id').text();
		let data = {
			number: $('#number').val(),
			date_created: $('#invoice-date').val(),
			date_supply: $('#supply-date').val(),
			comment: $('#comment').val()
		};

		$.ajax({
			type: "PUT",
			contentType: "application/json",
			url: `https://nicon83-invoices.herokuapp.com/invoices/${invoiceId}`,
			data: JSON.stringify(data),
			success: function () {
				$.ajax({
					type: "GET",
					url: 'https://nicon83-invoices.herokuapp.com/invoices',
					success: function (invoices) {
						//показываем скрытые елементы
						$('#add-button').removeClass('hidden');
						$('#title').removeClass('hidden');
						$('#filters-form').removeClass('hidden');

						//меняем текст заголовка страницы
						$('#page-title').text('Invoices');

						//заполняем селекты
						fillSelects();

						let table_content = $('#table-content');
						table_content.empty();
						let table = createTable(invoices);
						table_content.append(table);
					}
				});
			}
		});
	});

	//show edit invoice page
	container.on('click', '.edit', async event => {
		event.preventDefault();

		//получаем данные
		let data = await getUpdateInvoiceData(event.target.dataset.id);

		//скрываем элементы
		$('#add-button').addClass('hidden');
		$('#title').addClass('hidden');
		$('#filters-form').addClass('hidden');

		//меняем текст заголовка страницы
		$('#page-title').text('Update Invoice');

		//выводим на страницу форму с текущими данными
		let div = createTableForUpdateInvoice(data);
		let table_content = $('#table-content');
		table_content.empty();
		table_content.append(div);
	});

	//delete invoice
	container.on('click', '.delete', event => {
		event.preventDefault();
		$.ajax({
			type: "DELETE",
			url: `https://nicon83-invoices.herokuapp.com/invoices/${event.target.dataset.id}`,
			success: function () {
				$.ajax({
					type: "GET",
					url: 'https://nicon83-invoices.herokuapp.com/invoices',
					success: function (data) {
						let table_content = $('#table-content');
						table_content.empty();
						let table = createTable(data);
						table_content.append(table);
						fillSelects();
					}
				});
			}
		});
	});
});

