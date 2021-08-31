var ac_member_set = new Set()
var join_member_set = new Set()
var ac_member_no_join_set = new Set()

// %表示
var showParcent = function(){
    if (join_member_set.size === 0) document.getElementById('parsent').innerText = 0
    else document.getElementById('parsent').innerText = Math.min(parseInt(100*ac_member_set.size/join_member_set.size), 80)
}

// ---------- websocket ---------- //
var roomName = document.getElementById('username-span').innerText + '_' + document.getElementById('group-name-span').innerText
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var dataSocket = new WebSocket(
    ws_scheme + "://"
    + window.location.host
    + '/ws/'
    + roomName + '_show'
    +'/'
)

dataSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if(data.flag == 'updata_question'){
        // 受け取ったメッセージをquestionに設定
        document.getElementById('question').value = data.message
    }
    else if(data.flag == 'select_question'){
        // 受け取ったメッセージをquestionに設定
        document.getElementById('question').value = data.message1

        // acしたメンバーをcsv形式で受け取る
        var ac_member_csv = data.message2

        ac_member_set = new Set()
        ac_member_no_join_set = new Set()
        var member = ""
        
        for (var i = 0; i < ac_member_csv.length; i++){
            if (ac_member_csv[i] == ','){
                // 参加しているメンバーならac_memberへ
                if(join_member_set.has(member))ac_member_set.add(member)
                else ac_member_no_join_set.add(member)
                member = ""
            }
            else member += ac_member_csv[i]
        }
        // パーセント表示
        showParcent()
    }
    else if(data.flag == 'next_question'){
        // 問題設定と初期設定
        document.getElementById('question').value = data.message
        ac_member_set = new Set()
        ac_member_no_join_set = new Set()

        // パーセントを0にする
        document.getElementById('parsent').innerText = 0
    }
    else if(data.flag == 'ac_member'){
        // acメンバーを踏まえたパーセント表示
        ac_member_set.add(data.message)
        showParcent()
    }
    else if(data.flag == 'join_member'){
        join_member_set.add(data.message)
        
        // すでにacしているメンバーが参加したらacメンバーに入れる
        if(ac_member_no_join_set.has(data.message)){
            ac_member_no_join_set.delete(data.message)
            ac_member_set.add(data.message)
        }
        //パーセント表示
        showParcent()
    }
    else if(data.flag == 'remove_member'){
        // acメンバーが脱退したらac_member_no_join_setに入れる
        if(ac_member_set.has(data.message)){
            ac_member_set.delete(data.message)
            ac_member_no_join_set.add(data.message)
        }
        join_member_set.delete(data.message)

        // パーセント表示
        showParcent()
    }
};

dataSocket.onclose = function(e) {
    alert('リアルタイム通信がタイムアウトになりました。\nリロードしてください');
};


// ----------- ajax ----------- //
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

$(document).ready(function() {
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'ajax_get_member'},
        'dataType': 'json',
        success: function(response){
            var ac_member_csv = response.ac_member

            // 初期設定
            join_member_set = new Set(response.join_member)
            ac_member_set = new Set()
            ac_member_no_join_set = new Set()
            
            var member = ""
            for (var i = 0; i < ac_member_csv.length; i++){
                if (ac_member_csv[i] == ','){
                    // 参加メンバーとacメンバーの積集合
                    if(join_member_set.has(member))ac_member_set.add(member)
                    else ac_member_no_join_set.add(member)
                    member = ""
                }
                else member += ac_member_csv[i]
            }

            // パーセント設定
            showParcent()
        }
    })
})
