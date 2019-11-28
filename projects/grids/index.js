var L = 7;
var SHAPE = ['CUBE', 'SPHERE', 'EMPTY'];
var COLOR = ['R', 'G', 'B'];
var shape_idx = 0;
var color_idx = 0;
var examples = {};

var WW = 8;
var WW_SMOL = 4;

var OFFSETTOP = WW * 1.2;
var OFFSET2 = WW * 7;
var OFFSET3 = WW * 15;
var OFFSET4 = OFFSET3 + WW*3

let target_id = Math.floor(Math.random() * all_shapes.length);
let target = all_shapes[target_id];

var L0SETS = {};

// clear a grid canvas
function clear_grid_canvas(grid_canv_name){
    for (var i=0; i<L; i+=1) {
        for (var j=0; j<L; j+=1) {
            let boxstr = grid_canv_name+i+j;
            $(boxstr).css("background-image", '');
        }
    }
}

// fill a grid canvas with the EMPTY tile
function populate_empty_canvas(grid_canv_name){
    for (var i=0; i<L; i+=1) {
        for (var j=0; j<L; j+=1) {
            let boxstr = grid_canv_name+i+j;
            $(boxstr).css("background-image", 'url(assets/empty.png)');
        }
    }
}

// render a list of shapes onto grid vansaas
function render_shape_list(shape_list, grid_canv_name){
    Object.entries(shape_list).forEach( ([key, value]) => {
        let ii = value[0][0];
        let jj = value[0][1];
        let ss = value[1][0];
        let cc = value[1][1];
        let boxstr = grid_canv_name+ii+jj;
        let spritee = to_sprite(ss, cc);
        $(boxstr).css("background-image", 'url(assets/'+spritee+'.png)');
    });
}

// the target
function make_target(){
    for (var i=0; i<L; i+=1) {
        for (var j=0; j<L; j+=1) {
            let coord_i = i;
            let coord_j = j;
            var box = document.createElement("div"); 
            box.id = "target_box_"+i+j;
            box.className = "box smol";
            box.style.top = "" + (i*WW_SMOL + OFFSETTOP) + "vmin";
            box.style.left = "" + (j*WW_SMOL + 10) + "vmin";
            // $(box).hover(function(){
            //     $(this).css("border-width", "medium");
            // }, function(){
            //     $(this).css("border-width", "thin");
            // });
            // put empty
            $(box).css("background-image", 'url(assets/empty.png)');
            $("#grid").append(box);

        };
    };
    render_shape_list(target, "#target_box_");
}

// the candidates
function make_candidates(){
    for (var cand=0; cand<3; cand++){
        for (var i=0; i<L; i+=1) {
            for (var j=0; j<L; j+=1) {
                let coord_i = i;
                let coord_j = j;
                var box = document.createElement("div"); 
                box.id = "cand_box_"+cand+i+j;
                box.className = "box smol";
                box.style.top = "" + (i*WW_SMOL + OFFSETTOP + WW_SMOL * cand * 7.5) + "vmin";
                box.style.left = "" + (j*WW_SMOL + OFFSET4) + "vmin";
                // $(box).hover(function(){
                //     $(this).css("border-width", "medium");
                // }, function(){
                //     $(this).css("border-width", "thin");
                // });
                $("#grid").append(box);

            };
        };
    };

}


// the working grid
function make_working_grid(){
    for (var i=0; i<L; i+=1) {
        for (var j=0; j<L; j+=1) {
            let coord_i = i;
            let coord_j = j;
            var box = document.createElement("div"); 
            box.id = "box_"+i+j;
            box.className = "box";
            box.style.top = "" + (i*WW + OFFSETTOP) + "vmin";
            box.style.left = "" + (j*WW + OFFSET2) + "vmin";
            $(box).hover(function(){
                $(this).css("border-width", "thick");
            }, function(){
                $(this).css("border-width", "thin");
            });
            $("#grid").append(box);

            // on click update my background to match
            $(box).click(function(){
                if (examples[[coord_i, coord_j]] == undefined){
                    examples[[coord_i, coord_j]] = [shape_idx, color_idx]; 
                    render_plant();
                    return;
                } 
                if (examples[[coord_i, coord_j]] !== undefined){
                    delete examples[[coord_i, coord_j]];
                    render_plant();
                    return;
                }
            });

        };
    };
}

/* Creating the grid */
function make_layout() {
    // the target
    make_target();
    // the working grid
    make_working_grid();
    // the candidates
    make_candidates();

    // the controls for shapes
    for (var i=0; i<3; i++){
        var box = document.createElement("div"); 
        box.className = "box";
        box.style.top = "" + (OFFSETTOP + WW * 7.5) + "vmin";
        box.style.left = "" + (i*WW + WW*4 + OFFSET2) + "vmin";
        $(box).hover(function(){
            $(this).css("border-width", "thick");
        }, function(){
            $(this).css("border-width", "thin");
        });
        let myid = i;
        $(box).click(function(){
            shape_idx = myid;
            render_plant();
        });
        if (i == 0) { $(box).css("background-image", 'url(assets/cube.png)');}
        if (i == 1) { $(box).css("background-image", 'url(assets/sphere.png)');}
        if (i == 2) { $(box).css("background-image", 'url(assets/empty.png)');}
        $("#control").append(box);
    }

    // the control for colors
    for (var jj=0; jj<3; jj++){
        var box = document.createElement("div"); 
        box.className = "box";
        box.style.top = "" + (OFFSETTOP + WW * 9) + "vmin";
        box.style.left = "" + ((jj*WW) + WW*4 + OFFSET2) + "vmin";
        $(box).hover(function(){
            $(this).css("border-width", "thick");
        }, function(){
            $(this).css("border-width", "thin");
        });
        if (jj == 0) { $(box).css("background-image", 'url(assets/red.png)');}
        if (jj == 1) { $(box).css("background-image", 'url(assets/green.png)');}
        if (jj == 2) { $(box).css("background-image", 'url(assets/blue.png)');}
        let myid = jj;
        $(box).click(function(){
            color_idx = myid;
            render_plant();
        });
        $("#control").append(box);
    }

    // the thing to plant
    var box = document.createElement("div"); 
    box.className = "box big";
    box.id = "to_plant";
    box.style.top = "" + (OFFSETTOP + WW * 8) + "vmin";
    box.style.left = "" + (OFFSET2) + "vmin";
    $("#control").append(box);


    // ask the L0 robot ===========================
    var box = document.createElement("div"); 
    box.className = "interact";
    box.id = "L0";
    box.style.top = "" + (OFFSETTOP + WW * 1.5) + "vmin";
    box.style.left = "" + (OFFSET3) + "vmin";
    $(box).css("background-image", 'url(assets/robot_0.png)');
    // add the callback to solve the L0 problem
    $(box).click(function(){
        let l0_candidates = Array.from(L0(examples));

        let n_cands = Math.min(l0_candidates.length, 3)
        for (var cand_id = 0; cand_id < n_cands; cand_id++){
            let cand_shape = all_shapes[l0_candidates[cand_id]];
            clear_grid_canvas("#cand_box_"+cand_id);
            populate_empty_canvas("#cand_box_"+cand_id);
            render_shape_list(cand_shape, "#cand_box_"+cand_id);
        }
    });
    $(box).hover(function(){
        $(this).css("border-width", "thick");
    }, function(){
        $(this).css("border-width", "thin");
    });
    $("#control").append(box);

    // ask the L1 robot ========================== 
    var box = document.createElement("div"); 
    box.className = "interact";
    box.id = "L1";
    box.style.top = "" + (OFFSETTOP + WW * 3.5) + "vmin";
    box.style.left = "" + (OFFSET3) + "vmin";
    $(box).css("background-image", 'url(assets/robot.png)');
    // add the callback to solve the L0 problem
    $(box).click(function(){
        let l0_candidates = L0(examples);
        console.log("hi");
        // console.log(S11(l0_candidates[2], [[[2,2],[2,0]]]));
        let l1_candidates = L1(examples);

        let n_cands = Math.min(l1_candidates.length, 3)
        for (var cand_id = 0; cand_id < n_cands; cand_id++){
            let cand_shape = all_shapes[l1_candidates[cand_id]];
            clear_grid_canvas("#cand_box_"+cand_id);
            populate_empty_canvas("#cand_box_"+cand_id);
            render_shape_list(cand_shape, "#cand_box_"+cand_id);
        }
    });
    $(box).hover(function(){
        $(this).css("border-width", "thick");
    }, function(){
        $(this).css("border-width", "thin");
    });
    $("#control").append(box);






    // do the first render
    render_plant();
};

// from the ids to a particular sprite
function to_sprite(s_id, c_id){
    var to_plant = "";
    if (s_id == 2) {to_plant = "empty";}
    if (s_id == 0){
        if (c_id == 0) {to_plant = "cube_red";}
        if (c_id == 1) {to_plant = "cube_green";}
        if (c_id == 2) {to_plant = "cube_blue";}
    }
    if (s_id == 1){
        if (c_id == 0) {to_plant = "sphere_red";}
        if (c_id == 1) {to_plant = "sphere_green";}
        if (c_id == 2) {to_plant = "sphere_blue";}
    }
    return to_plant;
}

function render_plant(){

    // render the to_plant icon
    var to_plant_str = to_sprite(shape_idx, color_idx);
    $("#to_plant").css("background-image", 'url(assets/'+to_plant_str+'.png)');

    clear_grid_canvas("#box_");
    Object.entries(examples).forEach(([key, value]) => {
        let plant_str = to_sprite(value[0], value[1]);
        let boxstr = "#box_"+key[0]+key[2];
        $(boxstr).css("background-image", 'url(assets/'+plant_str+'.png)');
    });

};

$(document).ready(function(){
    make_layout(document.body);
    console.log("sup dawg");
})
