// sample the right parameters for the whole duration of the study
var practice_problems = [64, 15838, 4305];
var sample_problems = [17648,13565,7246,10950,14000,8232,2290,5663,1710];
var user_id = Math.random().toString().slice(2,8);
var robot_order = Math.random() > 0.5 ? [0,1] : [1,0];
var first_experiment_order =  practice_problems.concat(sample_problems.slice().sort(x => 0.5-Math.random()));
var second_experiment_order = practice_problems.concat(sample_problems.slice().sort(x => 0.5-Math.random()));


var trial_string = `robot_brief.html?trial_id=0&user_id=${user_id}&robot_order=${robot_order}&exp0_order=${first_experiment_order}&exp1_order=${second_experiment_order}`;

$(document).ready(function(){
    $("#start").attr('href', trial_string);
    $("#agree").click(function(){
    	$("#page1").css("display", "none");
    	$("#task_description").css("display", "unset");
    });
    $("#check_answer").click(function () {
    	let ans1 = $("input[name='gridsize']:checked").val();
    	let ans2 = $("input[name='nnocolor']:checked").val();
    	let ans3 = $("input[name='exptask']:checked").val();
    	if (ans1 == "49" && ans2 == "1" && ans3 == "fewest") {
    		window.location = `${trial_string}`
    	} else {
    		alert("some quiz answer(s) are wrong, please correct them first before continuing")
    	}
    });
});
