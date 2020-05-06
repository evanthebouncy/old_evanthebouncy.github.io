
var firebaseConfig = {
  apiKey: "AIzaSyDz8HP0WftrMi61sncVumipTboEYaTFiqQ",
  authDomain: "arc-labels.firebaseapp.com",
  databaseURL: "https://arc-labels.firebaseio.com",
  projectId: "arc-labels",
  storageBucket: "arc-labels.appspot.com",
  messagingSenderId: "1061311925293",
  appId: "1:1061311925293:web:0624cb2828956364403ca4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var fbase = firebase.database();

// put stuff into database
function store_parse(problem_id, stamps, action_sequence){
  let rand_id = Math.random().toString().slice(2,8);
  let ref_loc = `parse_data/${problem_id}/${rand_id}`;
  console.log(ref_loc);

  var ref = fbase.ref(ref_loc);
  let to_put = {
      'stamps' : stamps.map(stamp => stamp.grid),
      'action_sequence' : action_sequence,
  }
  ref.once("value", function(snapshot) {
      ref.set(to_put);
      alert(`stamp and parse of ${problem_id} stored to database`)
  });  
}

function retrieve_parse(problem_id) {
    let ref_tot = fbase.ref(`parse_data/${problem_id}`);
    ref_tot.on("value", function(snapshot) {
        let stats = snapshot.val();
        console.log(stats);
        if (stats == null) {
            $("#is_solved").html("This Task Has NOOOO Human Label");
        } else {
            $("#is_solved").html("This Task Has YES YES YES Human Label")
        }
    });
}

// read the database
    // let ref_loc = `${experiment_batch}/${user_id}/data`;
    // console.log(ref_loc);

    // var ref = fbase.ref(ref_loc);
    // var user_white = 0;
    // var user_blue = 0;
    // ref.on("value", function(snapshot) {
    //     let stats = snapshot.val();
    //     let white_blue = get_white_blue(stats);
    //     console.log("white blue", white_blue);
    //     user_white = white_blue[0] / 10;
    //     user_blue = white_blue[1] / 10;

    //     console.log(user_white, user_blue);
    //     }, function (error) {
    //     console.log("Error: " + error.code);
    // });

