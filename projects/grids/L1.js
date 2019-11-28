// some helpers
const add = (a, b) => a + b;

// takes in said, turn to dict
function said_to_dict(said){
    var ret = {};
    Object.entries(said).forEach(([key, value]) => {
        ret[value[0]] = value[1];
    });
    return ret;
}
// takes in a shape index and return a dictionary of coordinate-> shape 
function shape_id_to_shape_dict(shape_id){
    let myshapes = all_shapes[shape_id];
    return said_to_dict(myshapes);
}

// take in a shape index and return all possible utterances, including empty 
// that does not already exist in the past utterances said
function S0(shape_id, said){
    // turn said into a dionctary
    let said_dict = said_to_dict(said);
    let shape_dict = shape_id_to_shape_dict(shape_id);
    var to_say = [];
    for (var i=0; i<L; i+=1) {
        for (var j=0; j<L; j+=1) {
            if (said_dict[[i,j]] == undefined){
                if (shape_dict[[i,j]] !== undefined){
                    to_say.push([[i,j], shape_dict[[i,j]]]);
                } else {
                    to_say.push([[i,j], [2,0]]);
                }
            }
        }
    }
    return to_say;
}

// takes in a shape index and a list of past utterance (potentially empty)
// returns for each possible next example to utter, along with their probability
function S11(shape_id, said){
   let legal_utters = S0(shape_id, said);
   var legal_utters_weights = [];

   let said_dict = said_to_dict(said);

   // past set is either a base-case of set of all things, or what L0 reduced
   let past_set = said.length == 0 ? 'ALL' : L0(said_dict);

    Object.entries(legal_utters).forEach(([key, value]) => {
        // optimise a bit, if past set is already a unique program, push 1
        if (past_set.size == 1) {
            legal_utters_weights.push(1.0);
        } else {
            let new_say = said_to_dict([value]);
            let new_set = L0(new_say);
            let new_count = past_set == 'ALL' ? new_set.size : intersect([new_set, past_set]).size;
            legal_utters_weights.push(1.0 / new_count);
        }
    });
    
    // normalise
    let summ = legal_utters_weights.reduce(add);
    let legal_utters_probs = legal_utters_weights.map(x => x / summ);

    return [legal_utters, legal_utters_probs];
}

// given a shape id and an utterance (multiple), returns logPs1(utt | shape_id)
function logS1(shape_id, utters){
    var logpr = 0.0;
    for (var ii = 0; ii < utters.length; ii++){
        let say = utters[ii];
        let said = utters.slice(0,ii);
        let s11 = S11(shape_id, said);
        let s11_new_say = s11[0];
        let s11_new_probs = s11[1];
        // console.log("HI");
        // console.log(say);
        // console.log(said);
        // console.log(s11[0]);
        for (var j = 0; j < s11_new_say.length; j++){
            // console.log(s11_new_say[j]);
            if (String(s11_new_say[j]) == String(say)) {
                logpr += Math.log2(s11_new_probs[j]);
            }
        }
    }
    return logpr;
}



function L1(examples) {
    var utters = [];
    // examples to utterances
    Object.entries(examples).forEach(([key, value]) => {
        utters.push([[Number(key[0]), Number(key[2])], value]);
    });
    console.log(utters);

    let l0_candidates = Array.from(L0(examples));
    if (l0_candidates.length > 120) {
        console.log("too big "+l0_candidates.length);
        return l0_candidates;
    }
    console.log(l0_candidates);

    console.log("num programs ", l0_candidates.length);
    var s1logprs = [];
    for (var j=0; j<l0_candidates.length; j++){
        console.log(j)
        let s1logpr = logS1(l0_candidates[j], utters);
        s1logprs.push([-s1logpr, l0_candidates[j]]);
    }
    console.log(s1logprs);
        // console.log(S11(l0_candidates[2], []));
    let sorted_cands = s1logprs.sort();
    return sorted_cands.map(x => x[1]);
}



