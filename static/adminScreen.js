var ac_member_set = new Set()

var setAcMember = function(){
    var ac_member = document.getElementById('hidden-ac-members').innerText
    var div_ac_member = document.getElementById('ac-members')
    var member = ""
    for (var i = 0; i < ac_member.length; i++){
        if (ac_member[i] == ',') {
            if (!ac_member_set.has(member)){
                console.log(member)
                ac_member_set.add(member)
                div_ac_member.innerHTML += member
                div_ac_member.innerHTML += '<br>'
            }
            member = ""
        }else member += ac_member[i]
    }

    document.getElementById('hidden-ac-members').innerText = ""
}
window.onload = setAcMember()


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

$('#ajax-submit-next-question').on('submit', function(e) {
    e.preventDefault()
    var title = document.getElementById("title").value
    var question = document.getElementById("question").value
    var answer = document.getElementById("answer").value
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'ajax-submit-next-question','title': title, 'question': question, 'answer': answer},
        'dataType': 'json',
        success: function(response){
            var option = document.createElement('option')
            option.value = response.question
            option.text = response.question
            document.getElementById('created-question').appendChild(option)
            document.getElementById('focus_question_text').innerText = '現在の問題 : ' + response.question
            document.getElementById('ac_members').innerHTML = ""
        }
    })
})

$('#ajax-submit-updata').on('submit', function(e) {
    e.preventDefault()
    var title = document.getElementById("title").value
    var question = document.getElementById("question").value
    var answer = document.getElementById("answer").value
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'ajax-submit-updata','title': title, 'question': question, 'answer': answer},
        'dataType': 'json',
        success: function(response){
            console.log('complate')
        }
    })
})

$('#ajax-submit-select-question').on('submit', function(e) {
    e.preventDefault()
    var select_question = document.getElementById("created-question").value
    var select_question_id = ""
    for (var i = 0; i < select_question.length; i++){
        if (select_question[i] == '.')break
        select_question_id += select_question[i]
    }
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'ajax-submit-select-question','select_question_id': select_question_id},
        'dataType': 'json',
        success: function(response){
            document.getElementById('focus_question_text').innerText = '現在の問題 : ' + response.focus_question
            document.getElementById('title').value = response.title
            document.getElementById('question').value = response.question
            document.getElementById('answer').value = response.answer
            document.getElementById('hidden-ac-members').innerText = response.ac_members
            ac_member_set = new Set()
            setAcMember()
        }
    })
})

// $('#ajax-submit-jexcel').on('submit', function(e) {
//     e.preventDefault()
//     $.ajax({
//         'url': '',
//         'type': 'POST',
//         'data': {'type': 'ajax-submit-jexcel'},
//         'dataType': 'json',
//         success: function(response){
//             jexcel(document.getElementById('parent'), {data:[1,1]})
//             console.log(1)
//         }
//     })
// })

// ----------- websocket ----------- //
var roomName = document.getElementById('username-span').innerText + '_' + document.getElementById('group_name_span').innerText

var dataSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
    + roomName + '_adminScreen'
    +'/'
)

dataSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const join_members = document.getElementById('join-members')
    const ac_members = document.getElementById('ac-members')
    if (data.flag == "join_member"){ 
        join_members.innerHTML += data.message + '<br>'
    }else if(data.flag == "remove_member"){
        var join_member = join_members.innerText
        var member = ""
        join_members.innerHTML = ""
        for (var i = 0; i < join_member.length;i++){
            if (join_member[i].charCodeAt(0) === 10){
                if(member != data.message){
                    join_members.innerHTML += member + '<br>'
                }
                member = ""
            }
            else member += join_member[i]
        }
    }
    else if(data.flag == "ac_member"){
        if (!ac_member_set.has(data.message)){
            ac_members.innerHTML += data.message + '<br>'
            ac_member_set.add(data.message)
        }
    }
};

dataSocket.onclose = function(e) {
    console.error('data socket closed unexpectedly');
};