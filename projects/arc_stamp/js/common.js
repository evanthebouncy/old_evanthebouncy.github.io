
class Grid {
    constructor(height, width, values) {
        console.log(values);
        this.height = height;
        this.width = width;
        this.grid = new Array(height);
        for (var i = 0; i < height; i++){
            this.grid[i] = new Array(width);
            for (var j = 0; j < width; j++){
                if (values != undefined && values[i] != undefined && values[i][j] != undefined){
                    this.grid[i][j] = values[i][j];
                } else {
                    this.grid[i][j] = 0;
                }
            }
        }
    }
}

function grid_equal(grid1, grid2){
    if (grid1.height != grid2.height || grid1.width != grid2.width) {
        return false;
    }
    for (var i = 0; i < grid1.height; i++){
        for (var j = 0; j < grid1.width; j++){
            if (grid1.grid[i][j] != grid2.grid[i][j]){
                return [i,j];
            }
        }
    }
    return true;
}

function wipe_grid(grid) {
    for (var i = 0; i < grid.height; i++) {
        for (var j = 0; j < grid.width; j++) {
            grid.grid[i][j] = 0;
        }
    }
}

function transparent_grid(height, width) {
    var xx = [];
    for (var i = 0; i < height; i++){
        var yy = [];
        for (var j = 0; j < width; j++){
            yy.push(10);
        }
        xx.push(yy);
    }
    return new Grid(height, width, xx);
}

function blank_grid_like(grid){
    return new Grid(grid.height, grid.width, undefined);
}

// take rec_grid, go to x,y coordinate, apply stamp
function apply_stamp(rec_grid, x, y, stamp_grid){
    for (var yy = 0; yy < stamp_grid.height; yy++){
        for (var xx = 0; xx < stamp_grid.width; xx++){
            let stamp_loc_x = x + xx;
            let stamp_loc_y = y + yy;
            if (stamp_loc_x < rec_grid.width && stamp_loc_y < rec_grid.height) {
                if (stamp_grid.grid[yy][xx] != 10){
                    rec_grid.grid[stamp_loc_y][stamp_loc_x] = stamp_grid.grid[yy][xx];
                }
            } 
        }
    }
}

function floodfillFromLocation(grid, i, j, symbol) {
    i = parseInt(i);
    j = parseInt(j);
    symbol = parseInt(symbol);

    target = grid[i][j];
    
    if (target == symbol) {
        return;
    }

    function flow(i, j, symbol, target) {
        if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
            if (grid[i][j] == target) {
                grid[i][j] = symbol;
                flow(i - 1, j, symbol, target);
                flow(i + 1, j, symbol, target);
                flow(i, j - 1, symbol, target);
                flow(i, j + 1, symbol, target);
            }
        }
    }
    flow(i, j, symbol, target);
}

function parseSizeTuple(size) {
    size = size.split('x');
    if (size.length != 2) {
        alert('Grid size should have the format "3x3", "5x7", etc.');
        return;
    }
    if ((size[0] < 1) || (size[1] < 1)) {
        alert('Grid size should be at least 1. Cannot have a grid with no cells.');
        return;
    }
    if ((size[0] > 30) || (size[1] > 30)) {
        alert('Grid size should be at most 30 per side. Pick a smaller size.');
        return;
    }
    return size;
}

function convertSerializedGridToGridObject(values) {
    height = values.length;
    width = values[0].length;
    return new Grid(height, width, values)
}

function fitCellsToContainer(jqGrid, height, width, containerHeight, containerWidth) {
    candidate_height = Math.floor((containerHeight - height) / height);
    candidate_width = Math.floor((containerWidth - width) / width);
    size = Math.min(candidate_height, candidate_width);
    size = Math.min(MAX_CELL_SIZE, size);
    jqGrid.find('.cell').css('height', size + 'px');
    jqGrid.find('.cell').css('width', size + 'px');
}

function fillJqGridWithData(jqGrid, dataGrid) {
    jqGrid.empty();
    height = dataGrid.height;
    width = dataGrid.width;
    for (var i = 0; i < height; i++){
        var row = $(document.createElement('div'));
        row.addClass('row');
        for (var j = 0; j < width; j++){
            var cell = $(document.createElement('div'));
            cell.addClass('cell');
            cell.addClass(`x_${i}`);
            cell.addClass(`y_${j}`);
            cell.attr('x', i);
            cell.attr('y', j);
            setCellSymbol(cell, dataGrid.grid[i][j]);
            row.append(cell);
        }
        jqGrid.append(row);
    }
}

function copyJqGridToDataGrid(jqGrid, dataGrid) {
    row_count = jqGrid.find('.row').length
    if (dataGrid.height != row_count) {
        return
    }
    col_count = jqGrid.find('.cell').length / row_count
    if (dataGrid.width != col_count) {
        return
    }
    jqGrid.find('.row').each(function(i, row) {
        $(row).find('.cell').each(function(j, cell) {
            dataGrid.grid[i][j] = parseInt($(cell).attr('symbol'));
        });
    });
}

function setCellSymbol(cell, symbol) {
    cell.attr('symbol', symbol);
    classesToRemove = ''
    for (i = 0; i < 11; i++) {
        classesToRemove += 'symbol_' + i + ' ';
    }
    cell.removeClass(classesToRemove);
    cell.addClass('symbol_' + symbol);
}

function errorMsg(msg) {
    $('#error_display').stop(true, true);
    $('#info_display').stop(true, true);

    $('#error_display').hide();
    $('#info_display').hide();
    $('#error_display').html(msg);
    $('#error_display').show();
    $('#error_display').fadeOut(5000);
}

function infoMsg(msg) {
    $('#error_display').stop(true, true);
    $('#info_display').stop(true, true);

    $('#info_display').hide();
    $('#error_display').hide();
    $('#info_display').html(msg);
    $('#info_display').show();
    $('#info_display').fadeOut(5000);
}
