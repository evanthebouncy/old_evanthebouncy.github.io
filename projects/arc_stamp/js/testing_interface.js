
// Internal state.
var CURRENT_INPUT_GRID = new Grid(3, 3);
var CURRENT_OUTPUT_GRID = new Grid(3, 3);
var TEST_PAIRS = new Array();
var CURRENT_TEST_PAIR_INDEX = 0;
var COPY_PASTE_DATA = new Array();

// Evan internal state
var CUR_STAMP = 0;
var TARGETS = {};
var REC = {};
var STAMPS = [];
var TASK_NAME = "";

// each action item is (example_id[example0, example1, etc], io_id[0 is input, 1 is output], x, y, stamp_id)
// for example : var ACTION_SEQUENCE = [[0, 0, 2, 3, 0], [0, 1, 3, 1, 1]];
var ACTION_SEQUENCE = [];


// Cosmetic.
var EDITION_GRID_HEIGHT = 500;
var EDITION_GRID_WIDTH = 500;
var MAX_CELL_SIZE = 100;




function resetTask() {
    CURRENT_INPUT_GRID = new Grid(3, 3);
    TEST_PAIRS = new Array();
    CURRENT_TEST_PAIR_INDEX = 0;
    $('#task_preview').html('');
    $('#list_of_stamps').html('');
    $('#task_reconstruction').html('');
    REC = {};
    STAMPS = [];
    CUR_STAMP = 0;
    ACTION_SEQUENCE = [];
    resetOutputGrid();
}

function refreshEditionGrid(jqGrid, dataGrid) {
    fillJqGridWithData(jqGrid, dataGrid);
    setUpEditionGridListeners(jqGrid);
    fitCellsToContainer(jqGrid, dataGrid.height, dataGrid.width, EDITION_GRID_HEIGHT, EDITION_GRID_HEIGHT);
    initializeSelectable();
}

function refresh_stamp_grid(stamp_grid, dataGrid) {
    return;
}

function syncFromEditionGridToDataGrid() {
    copyJqGridToDataGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function syncFromDataGridToEditionGrid() {
    refreshEditionGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function getSelectedSymbol() {
    selected = $('#symbol_picker .selected-symbol-preview')[0];
    return $(selected).attr('symbol');
}

function setUpEditionGridListeners(jqGrid) {
    jqGrid.find('.cell').click(function(event) {
        cell = $(event.target);
        symbol = getSelectedSymbol();
        console.log(symbol);
        // console.log(cell, cell["x"]);
        mode = $('input[name=tool_switching]:checked').val();
        // TODO: put the synchronization of the EditionGrid to be the current stamp being clicked on, and thus we can compute fl00dfill properties easily.
        // Now it is only synchronizing the one and only output_edition_grid, hence it is still buggy.
        if (mode == 'floodfill') {
            // If floodfill: fill all connected cells.
            syncFromEditionGridToDataGrid();
            grid = CURRENT_OUTPUT_GRID.grid;
            floodfillFromLocation(grid, cell.attr('x'), cell.attr('y'), symbol);
            syncFromDataGridToEditionGrid();
        }
        else if (mode == 'edit') {
            // Else: fill just this cell.
            setCellSymbol(cell, symbol);
        }

        // each time we click we re-synch all the stamps
        for (var stamp_idx = 0; stamp_idx < STAMPS.length; stamp_idx++) {
            copyJqGridToDataGrid($(`#stamp_${stamp_idx}`), STAMPS[stamp_idx]);
        }

    });
}

function setUpReconstructionGridListeners(jqGrid) {
    console.log(jqGrid);
    const parent_id = jqGrid.attr("id");
    const example_id = parseInt(parent_id.split("_")[1]);
    const io_str = parent_id.split("_")[0];
    const io_id = parent_id.includes("input") ? 0 : 1;
    console.log(parent_id);

    jqGrid.find('.cell').click(function(event) {
        let cell = $(event.target);
        let x = parseInt(cell.attr("x"));
        let y = parseInt(cell.attr("y"));
        console.log("hiiii");
        console.log(parent_id, x, y);
        // each action item is (example_id[example0, example1, etc], io_id[0 is input, 1 is output], x, y, stamp_id)
        // the jquery grid has y and x flipped like a n00b
        ACTION_SEQUENCE.push([example_id, io_id, y, x, CUR_STAMP]);
        run_action_sequence();
    });

    // set up high-light of corresponding cell
    jqGrid.find('.cell').hover(function(event) {
        let cell = $(event.target);
        cell.css("border-color", "white");
        let x = parseInt(cell.attr("x"));
        let y = parseInt(cell.attr("y"));
        $(`#pair_preview_${example_id} .${io_str}_preview .cell`).filter(`.x_${x}`).filter(`.y_${y}`).css("border-color", "white");
    }, function(event) {
        let cell = $(event.target);
        cell.css("border-color", "#555");
        let x = parseInt(cell.attr("x"));
        let y = parseInt(cell.attr("y"));
        $(`#pair_preview_${example_id} .${io_str}_preview .cell`).filter(`.x_${x}`).filter(`.y_${y}`).css("border-color", "#555");
    });

}

function resizeOutputGrid() {
    size = $('#output_grid_size').val();
    size = parseSizeTuple(size);
    height = size[0];
    width = size[1];

    jqGrid = $('#output_grid .edition_grid');
    syncFromEditionGridToDataGrid();
    dataGrid = JSON.parse(JSON.stringify(CURRENT_OUTPUT_GRID.grid));
    CURRENT_OUTPUT_GRID = new Grid(height, width, dataGrid);
    refreshEditionGrid(jqGrid, CURRENT_OUTPUT_GRID);
}

function resetOutputGrid() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = new Grid(3, 3);
    syncFromDataGridToEditionGrid();
    resizeOutputGrid();
}

function copyFromInput() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_INPUT_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
}

function fillPairPreview(pairId, inputGrid, outputGrid) {
    var pairSlot = $('#pair_preview_' + pairId);
    if (!pairSlot.length) {
        // Create HTML for pair.
        pairSlot = $('<div id="pair_preview_' + pairId + '" class="pair_preview" index="' + pairId + '"></div>');
        pairSlot.appendTo('#task_preview');
    }
    var jqInputGrid = pairSlot.find('.input_preview');
    if (!jqInputGrid.length) {
        jqInputGrid = $('<div class="input_preview"></div>');
        jqInputGrid.appendTo(pairSlot);
    }
    var jqOutputGrid = pairSlot.find('.output_preview');
    if (!jqOutputGrid.length) {
        jqOutputGrid = $('<div class="output_preview"></div>');
        jqOutputGrid.appendTo(pairSlot);
    }
    TARGETS[pairId] = [inputGrid, outputGrid];

    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 200, 200);
    fillJqGridWithData(jqOutputGrid, outputGrid);
    fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 200, 200);
}

function check_reconstruction() {
    var all_reconstruct_good = true;
    Object.keys(REC).forEach(function(key) {
        let same_input = grid_equal(REC[key][0], TARGETS[key][0]);
        let same_output = grid_equal(REC[key][1], TARGETS[key][1]);
        if (same_input != true) {
            alert(`not same on input ${key} on ${[same_input[1], same_input[0]]}`);
            all_reconstruct_good = false;
        }
        if (same_output != true) {
            alert(`not same on output ${key} on ${[same_output[1], same_output[0]]}`);
            all_reconstruct_good = false;
        }
    });
    if (all_reconstruct_good){
        alert(`evertyhing same, attempting to save on server of parse ${TASK_NAME}`);
        store_parse(TASK_NAME, STAMPS, ACTION_SEQUENCE);
    }
}

function fillPairReconstruction(pairId, inputGrid, outputGrid) {
    var inputGrid = blank_grid_like(inputGrid);
    var outputGrid = blank_grid_like(outputGrid);
    REC[pairId] = [inputGrid, outputGrid]


    var pairSlot = $('#pair_reconstruction_' + pairId);
    if (!pairSlot.length) {
        // Create HTML for pair.
        pairSlot = $('<div id="pair_reconstruction_' + pairId + '" class="pair_preview" index="' + pairId + '"></div>');
        pairSlot.appendTo('#task_reconstruction');
    }
    var jqInputGrid = pairSlot.find('.input_preview');
    if (!jqInputGrid.length) {
        jqInputGrid = $(`<div class="input_preview" id="input_${pairId}"></div>`);
        jqInputGrid.appendTo(pairSlot);
    }
    var jqOutputGrid = pairSlot.find('.output_preview');
    if (!jqOutputGrid.length) {
        jqOutputGrid = $(`<div class="output_preview" id="output_${pairId}"></div>`);
        jqOutputGrid.appendTo(pairSlot);
    }

    // fillJqGridWithData(jqInputGrid, inputGrid);
    // setUpReconstructionGridListeners(jqInputGrid);
    // fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 200, 200);

    // fillJqGridWithData(jqOutputGrid, outputGrid);
    // setUpReconstructionGridListeners(jqOutputGrid);
    // fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 200, 200);
}

function undo_stamp_placement() {
    ACTION_SEQUENCE.pop();
    run_action_sequence();
}

function run_action_sequence() {
    // wipe all the reconstruction grids blank ! 
    Object.keys(REC).forEach(function(key) {
        const inputGrid = REC[key][0];
        const outputGrid = REC[key][1];
        wipe_grid(inputGrid);
        wipe_grid(outputGrid);
    });

    // update the stamp_grid with the corresponding stamps
    for (var stamp_idx = 0; stamp_idx < STAMPS.length; stamp_idx++) {
        copyJqGridToDataGrid($(`#stamp_${stamp_idx}`), STAMPS[stamp_idx]);
    }

    // update the grid values based on action sequence
    ACTION_SEQUENCE.forEach(action => {
        let io_id = action[0];
        let in_out_id = action[1];
        let xx = action[2];
        let yy = action[3];
        let stamp_id = action[4];

        let rec_grid = REC[io_id][in_out_id];
        let stamp_grid = STAMPS[stamp_id];
        console.log(rec_grid);
        console.log(stamp_grid);
        console.log("HFIKDSJFKDSL");
        // place stamp at x,y of rec
        apply_stamp(rec_grid, xx, yy, stamp_grid);
    });      

    $('#reconstruction_text').html(ACTION_SEQUENCE.map(a => a.join(",")).join("] p["));
    synch_reconstruction();
}

function synch_reconstruction() {
    Object.keys(REC).forEach(function(key) {
        //console.log(key, REC[key]);
        const jqInputGrid = $(`#input_${key}`)
        const jqOutputGrid = $(`#output_${key}`)
        const inputGrid = REC[key][0];
        const outputGrid = REC[key][1];

        fillJqGridWithData(jqInputGrid, inputGrid);
        setUpReconstructionGridListeners(jqInputGrid);
        fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 200, 200);

        fillJqGridWithData(jqOutputGrid, outputGrid);
        setUpReconstructionGridListeners(jqOutputGrid);
        fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 200, 200);
    });
}

function loadJSONTask(train, test) {
    resetTask();
    $('#modal_bg').hide();
    $('#error_display').hide();
    $('#info_display').hide();

    for (var i = 0; i < train.length; i++) {
        pair = train[i];
        values = pair['input'];
        input_grid = convertSerializedGridToGridObject(values)
        values = pair['output'];
        output_grid = convertSerializedGridToGridObject(values)
        console.log(i);
        console.log(input_grid);
        console.log(output_grid);
        fillPairPreview(i, input_grid, output_grid);
        fillPairReconstruction(i, input_grid, output_grid);
    }
    synch_reconstruction();
    // for (var i=0; i < test.length; i++) {
    //     pair = test[i];
    //     TEST_PAIRS.push(pair);
    // }
    // values = TEST_PAIRS[0]['input'];
    // CURRENT_INPUT_GRID = convertSerializedGridToGridObject(values)
    // fillTestInput(CURRENT_INPUT_GRID);
    // CURRENT_TEST_PAIR_INDEX = 0;
    // $('#current_test_input_id_display').html('1');
    // $('#total_test_input_count_display').html(test.length);
}

function display_task_name(task_name, task_index, number_of_tasks) {
    big_space = '&nbsp;'.repeat(4); 
    document.getElementById('task_name').innerHTML = (
        'Task name:' + big_space + task_name + big_space + (
            task_index===null ? '' :
            ( String(task_index) + ' out of ' + String(number_of_tasks) )
        )
    );
}

function loadTaskFromFile(e) {
    var file = e.target.files[0];
    if (!file) {
        errorMsg('No file selected');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;

        try {
            contents = JSON.parse(contents);
            train = contents['train'];
            test = contents['test'];
        } catch (e) {
            errorMsg('Bad file format');
            return;
        }
        loadJSONTask(train, test);

        $('#load_task_file_input')[0].value = "";
        display_task_name(file.name, null, null);
    };
    reader.readAsText(file);
}

function loadTask(task_index) {
    var subset = "training";
    $.getJSON("https://api.github.com/repos/fchollet/ARC/contents/data/" + subset, function(tasks) {
        var task = tasks[task_index];
        TASK_NAME = task['name'].split('.')[0];
        retrieve_parse(TASK_NAME);
        $.getJSON(task["download_url"], function(json) {
            try {
                train = json['train'];
                test = json['test'];
            } catch (e) {
                errorMsg('Bad file format');
                return;
            }
            loadJSONTask(train, test);
            //$('#load_task_file_input')[0].value = "";
            infoMsg("Loaded task training/" + task["name"]);
            display_task_name(task['name'], task_index, tasks.length);
        })
        .error(function(){
          errorMsg('Error loading task');
        });
    })
    .error(function(){
      errorMsg('Error loading task list');
    });
}

function randomTask() {
    var task_index = Math.floor(Math.random() * 400)
    loadTask(task_index);
}

function nextTestInput() {
    if (TEST_PAIRS.length <= CURRENT_TEST_PAIR_INDEX + 1) {
        errorMsg('No next test input. Pick another file?')
        return
    }
    CURRENT_TEST_PAIR_INDEX += 1;
    values = TEST_PAIRS[CURRENT_TEST_PAIR_INDEX]['input'];
    CURRENT_INPUT_GRID = convertSerializedGridToGridObject(values)
    fillTestInput(CURRENT_INPUT_GRID);
    $('#current_test_input_id_display').html(CURRENT_TEST_PAIR_INDEX + 1);
    $('#total_test_input_count_display').html(test.length);
}

function submitSolution() {
    syncFromEditionGridToDataGrid();
    reference_output = TEST_PAIRS[CURRENT_TEST_PAIR_INDEX]['output'];
    submitted_output = CURRENT_OUTPUT_GRID.grid;
    if (reference_output.length != submitted_output.length) {
        errorMsg('Wrong solution.');
        return
    }
    for (var i = 0; i < reference_output.length; i++){
        ref_row = reference_output[i];
        for (var j = 0; j < ref_row.length; j++){
            if (ref_row[j] != submitted_output[i][j]) {
                errorMsg('Wrong solution.');
                return
            }
        }

    }
    infoMsg('Correct solution!');
}

function fillTestInput(inputGrid) {
    jqInputGrid = $('#evaluation_input');
    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 400, 400);
}

function copyToOutput() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_INPUT_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
}

function initializeSelectable() {
    try {
        $('.selectable_grid').selectable('destroy');
    }
    catch (e) {
    }
    toolMode = $('input[name=tool_switching]:checked').val();
    if (toolMode == 'select') {
        infoMsg('Select some cells and click on a color to fill in, or press C to copy');
        $('.selectable_grid').selectable(
            {
                autoRefresh: false,
                filter: '> .row > .cell',
                start: function(event, ui) {
                    $('.ui-selected').each(function(i, e) {
                        $(e).removeClass('ui-selected');
                    });
                }
            }
        );
    }
}

// Evan's Code
function render_stamp(stamp_id, stamp_grid) {
    let height = stamp_grid.height;
    let width = stamp_grid.width;
    var new_stamp = $('<div id="stamp_' + stamp_id + '" class="stamp" index="' + stamp_id + `">stamp ${stamp_id}</div>`);

    refreshEditionGrid(new_stamp, stamp_grid);
    let show_stamp_size = Math.min(Math.max(30*height, 30*width), 400);

    fitCellsToContainer(new_stamp, height, width, show_stamp_size, show_stamp_size);

    // make the use stamp button ========
    const new_stamp_use = $(`<button id="stamp_use_${stamp_id}" class="use_stamp_button">use stamp ${stamp_id}</button>`);
    new_stamp_use.click(function(event){
        CUR_STAMP = stamp_id;
        // clear other butotn to white
        $(".use_stamp_button").css("background-color", "white");
        // set self color to green
        $(this).css("background-color", "#90EE90");
    });

    // make a container that wraps the use_stamp button and the stamp itself
    var stamp_container = $(`<div class="stamp_container"></div>`);
    new_stamp_use.appendTo(stamp_container);
    new_stamp.appendTo(stamp_container);
    
    stamp_container.appendTo('#list_of_stamps');
}

// re-render all the stamps
function render_stamps() {
    $('#list_of_stamps').html('');
    for (var ii = 0; ii < STAMPS.length; ii ++){
        render_stamp(ii, STAMPS[ii]);
    }
}

function add_stamp() {

    // make the stamp =======

    // step 1 : add a blank stamp of the right size to the canvas
    let size = parseSizeTuple($('#stamp_size').val());
    let height = size[0];
    let width = size[1];
    let blank_grid = transparent_grid(height, width);
    STAMPS.push(blank_grid);
    // step 2 : re-render all the stamps
    render_stamps();
}

function copy_stamp() {
    let last_stamp = STAMPS[STAMPS.length-1];
    let last_stamp_again = JSON.parse(JSON.stringify(last_stamp));
    STAMPS.push(last_stamp_again);
    render_stamps();
}

function rotateRight(array) {
    var result = [];
    array.forEach(function (a, i, aa) {
        a.forEach(function (b, j, bb) {
            result[bb.length - j - 1] = result[bb.length - j - 1] || [];
            result[bb.length - j - 1][i] = b;
        });
    });
    return result;
}
function rotate_stamp() {
    let last_stamp = STAMPS[STAMPS.length-1];
    let orig_height = last_stamp.height;
    let orig_width = last_stamp.width;
    let rot_stamp_grid = rotateRight(last_stamp.grid);
    last_stamp.height = orig_width;
    last_stamp.width = orig_height;
    last_stamp.grid = rot_stamp_grid;
    render_stamps();
}

function flip_stamp() {
    let last_stamp = STAMPS[STAMPS.length-1];
    last_stamp.grid.reverse();
    render_stamps();    
}

function recolor_stamp() {
    let last_stamp = STAMPS[STAMPS.length-1];
    for (var ii = 0; ii < last_stamp.height; ii++) {
        for (var jj = 0; jj < last_stamp.width; jj++) {
            if (last_stamp.grid[ii][jj] != 10) {
            last_stamp.grid[ii][jj] = (last_stamp.grid[ii][jj] + 1 ) % 10;
            }
        }
    }
    render_stamps();
}

// Initial event binding.

$(document).ready(function () {
    $('#symbol_picker').find('.symbol_preview').click(function(event) {
        symbol_preview = $(event.target);
        $('#symbol_picker').find('.symbol_preview').each(function(i, preview) {
            $(preview).removeClass('selected-symbol-preview');
        })
        symbol_preview.addClass('selected-symbol-preview');

        toolMode = $('input[name=tool_switching]:checked').val();
        if (toolMode == 'select') {
            $('.edition_grid').find('.ui-selected').each(function(i, cell) {
                symbol = getSelectedSymbol();
                setCellSymbol($(cell), symbol);
            });
        }
    });

    $('.edition_grid').each(function(i, jqGrid) {
        setUpEditionGridListeners($(jqGrid));
    });

    $('.load_task').on('change', function(event) {
        loadTaskFromFile(event);
    });

    $('.load_task').on('click', function(event) {
      event.target.value = "";
    });

    $('input[type=radio][name=tool_switching]').change(function() {
        initializeSelectable();
    });
    
    $('input[type=text][name=size]').on('keydown', function(event) {
        if (event.keyCode == 13) {
            resizeOutputGrid();
        }
    });

    $('body').keydown(function(event) {
        // Copy and paste functionality.
        if (event.which == 67) {
            // Press C

            selected = $('.ui-selected');
            if (selected.length == 0) {
                return;
            }

            COPY_PASTE_DATA = [];
            for (var i = 0; i < selected.length; i ++) {
                x = parseInt($(selected[i]).attr('x'));
                y = parseInt($(selected[i]).attr('y'));
                symbol = parseInt($(selected[i]).attr('symbol'));
                COPY_PASTE_DATA.push([x, y, symbol]);
            }
            infoMsg('Cells copied! Select a target cell and press V to paste at location.');

        }
        if (event.which == 86) {
            // Press P
            if (COPY_PASTE_DATA.length == 0) {
                errorMsg('No data to paste.');
                return;
            }
            selected = $('.edition_grid').find('.ui-selected');
            if (selected.length == 0) {
                errorMsg('Select a target cell on the output grid.');
                return;
            }

            jqGrid = $(selected.parent().parent()[0]);

            if (selected.length == 1) {
                targetx = parseInt(selected.attr('x'));
                targety = parseInt(selected.attr('y'));

                xs = new Array();
                ys = new Array();
                symbols = new Array();

                for (var i = 0; i < COPY_PASTE_DATA.length; i ++) {
                    xs.push(COPY_PASTE_DATA[i][0]);
                    ys.push(COPY_PASTE_DATA[i][1]);
                    symbols.push(COPY_PASTE_DATA[i][2]);
                }

                minx = Math.min(...xs);
                miny = Math.min(...ys);
                for (var i = 0; i < xs.length; i ++) {
                    x = xs[i];
                    y = ys[i];
                    symbol = symbols[i];
                    newx = x - minx + targetx;
                    newy = y - miny + targety;
                    res = jqGrid.find('[x="' + newx + '"][y="' + newy + '"] ');
                    if (res.length == 1) {
                        cell = $(res[0]);
                        setCellSymbol(cell, symbol);
                    }
                }
            } else {
                errorMsg('Can only paste at a specific location; only select *one* cell as paste destination.');
            }
        }
    });

    randomTask();
});
