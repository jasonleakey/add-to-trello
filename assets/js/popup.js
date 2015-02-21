$(function() {
    if (!localStorage.trello_token) {
        showSettings();
        return;
    }

    // Deauthorize Trello
    $('#logout').click(function() {
        api.deauthorize();
    });

    // Change list dropdown when the user changes the board
    $('.js-boards').change(changeList);

    // Add the new card
    $('#submit').click(function() {
        var data = [];
        $(".add-card-form").serializeArray().map(function(x){data[x.name] = x.value;});

        api.submitCard(data);
    });

    // get the current tab info and insert into the form
    getCurrentTab(function(tab) {
        $('.js-card-title').val(tab.title);
        $('.js-card-description').text(tab.url);
    });

    // hit API to get boards and insert into the add form
    api.getBoards(loadBoardsAndLists);
});

function loadBoardsAndLists() {
    var boards   = JSON.parse(localStorage.getItem('trello_boards'));
    var defaults = JSON.parse(localStorage.getItem('select_defaults'));

    // set the defaults to first board and first list if none present
    if (!defaults) {
        defaults = setDefaults(boards);
    }

    $.each(boards, function(key, board) {
        var boardSelected = false;
        if (defaults.board_id == board.id) boardSelected = true;

        // append the board
        $('.js-boards').append(createOption(board, boardSelected));

        if (boardSelected) {
            $.each(board.lists, function(key, list) {
                var listSelected = false;
                if (defaults.list_id == list.id) listSelected = true;

                // append the list
                $('.js-lists').append(createOption(list, listSelected));
            });
        }
    });
}

function changeList() {
    var id     = $(this).val();
    var boards = JSON.parse(localStorage.getItem('trello_boards'));
    var lists  = $.grep(boards, function(e){ return e.id === id; })[0].lists;

    // clear the lists dropdown
    $('.js-lists').html('');

    $.each(lists, function(key, list) {
        var listSelected = false;
        if (key == 0) listSelected = true;

        // append the list
        $('.js-lists').append(createOption(list, listSelected));
    });
}

function getCurrentTab(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];

        callback(tab);
    });
}

function createOption(data, isSelected) {
    var option = $('<option>', { value: data.id })
        .text(data.name);

    if (isSelected) {
        option.attr('selected', 'selected');
    }

    return option;
}

function setDefaults(boards) {
    localStorage.setItem('select_defaults', JSON.stringify({
        board_id: boards[0].id,
        list_id: boards[0].lists[0].id
    }));

    return JSON.parse(localStorage.getItem('select_defaults'));
}
