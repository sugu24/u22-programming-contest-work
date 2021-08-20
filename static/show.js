// ---------- websocket ---------- //
var roomName = document.getElementById('username-span').innerText + '_' + document.getElementById('group-name-span').innerText
var ac_members = new Set()
var dataSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
    + roomName + '_show'
    +'/'
)

dataSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data)
    if(data.flag == 'updata_question'){
        console.log(data.message)
        document.getElementById('question').value = data.message
    }
    else if(data.flag == 'select_question'){
        document.getElementById('question').value = data.message1
        var ac_member_csv = data.message2
        ac_members = new Set()
        var member = ""
        for (var i = 0; i < ac_member_csv.length; i++){
            if (ac_member_csv[i] == ','){
                ac_members.add(member)
                member = ""
            }
            else member += ac_member_csv[i]
        }
        if (data.message3 === 0){
            document.getElementById('parsent').innerText = 0
        }
        else document.getElementById('parsent').innerText = Math.min(parseFloat(100*ac_members.size/data.message3), 80)
    }
    else if(data.flag == 'next_question'){
        document.getElementById('question').value = data.message
        document.getElementById('parsent').innerText = 0
    }
    else if(data.flag == 'ac_member'){
        ac_members.add(data.message1)
        document.getElementById('parsent').innerText = Math.min(parseFloat(100*ac_members.size/data.message2), 80)
    }
};

dataSocket.onclose = function(e) {
    console.error('data socket closed unexpectedly');
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
        'data': {'type': 'ajax-get-ac-parsent'},
        'dataType': 'json',
        success: function(response){
            var ac_member_csv = response.ac_member
            var join_member = response.join_member
            ac_members = new Set()
            var member = ""
            for (var i = 0; i < ac_member_csv.length; i++){
                if (ac_member_csv[i] == ','){
                    ac_members.add(member)
                    member = ""
                }
                else member += ac_member_csv[i]
            }
            if (join_member === 0){
                document.getElementById('parsent').innerText = 0
            }
            else document.getElementById('parsent').innerText = Math.min(parseFloat(100*ac_members.size/join_member), 80)
        }
    })
})