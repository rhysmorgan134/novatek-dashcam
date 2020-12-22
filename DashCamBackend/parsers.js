const cmd = {};

cmd['3014'] = function(data) {
    console.log('converting: ', data)
    let res = {}
    for(let i=0; i<data.Cmd.length;i++) {

        res[data.Cmd[i]] = data.Status[i]
    }
    return res;
};

module.exports = cmd