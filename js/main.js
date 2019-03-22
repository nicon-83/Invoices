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
    for (let item of data) {
        let tr = $('<tr/>');
        tr.append(`
            <td>${new Date(item.date_created).toLocaleDateString()}</td>
            <td><a href="" class="to-invoice">${item.number}</a></td>
            <td>${new Date(item.date_supply).toLocaleDateString()}</td>
            <td>${item.comment}</td>
            <td class="align-middle">
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-success">Изменить</button>
                    <button class="btn btn-sm btn-danger">Удалить</button>
                </div>
            </td>`);
        tbody.append(tr);
    }

    table.append(tbody);

    return table;
}

$(document).ready(function () {
    $('#create-invoice').click(function () {
        window.location = './create.html';
    });

    $('.container').on('click', '.to-invoice', function (event) {
        event.preventDefault();
    });

    $.ajax({
        type: "GET",
        url: 'https://nicon83-invoices.herokuapp.com/invoices',
        success: function (data) {
            let table = createTable(data);
            $('#content').append(table);
        }
    });
});

