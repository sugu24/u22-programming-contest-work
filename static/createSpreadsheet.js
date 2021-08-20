var jexcelData
var undownload = document.getElementById('undownload')
var download = document.getElementById('download')
var finish = document.getElementById('finish')
var i = 0

var createSpreadsheet = function(){
    var loop = document.getElementById('question-number').textContent
    var table = document.getElementById('table')
    if(i < loop){
        try{
            var title = document.getElementById('question-title').textContent
        }catch(e){
            if (e instanceof TypeError) var title = ""
        }
        try{
            var question = document.getElementById('question-question').textContent
        }catch(e){
            if (e instanceof TypeError) var question = ""
        }
        try{
            var answer = document.getElementById('question-answer').textContent
        }catch(e){
            if (e instanceof TypeError) var answer = ""
        }
        try{
            var ac_member = document.getElementById('question-ac-member').textContent
        }catch(e){
            if (e instanceof TypeError) var ac_member = ""
        }
        try{
            var submit_member = document.getElementById('question-submit-member').textContent
        }catch(e){
            if (e instanceof TypeError) var submit_member = ""
        }      
        document.getElementById('question-id').remove()
        document.getElementById('question-title').remove()
        document.getElementById('question-question').remove()
        document.getElementById('question-answer').remove()
        document.getElementById('question-ac-member').remove()
        document.getElementById('question-submit-member').remove()
        member_dict = {}
        var member = ""
        for (var j = 0; j < submit_member.length; j++){
            if (submit_member[j] == ","){
                if(member in member_dict) member_dict[member][0] += 1
                else member_dict[member] = [1,0]
                member = ""
            }
            else member += submit_member[j]
        }
        for (var j = 0; j < ac_member.length; j++){
            if(ac_member[j] == ","){
                if(member in member_dict) member_dict[member][1] += 1
                member = ""
            }
            else member += submit_member[j]
        }
        data = [
            ["問題タイトル", title,""],
            ["問題文", question,""],
            ["回答", answer,""],
            [],
            ["メンバー名", "提出回数", "正解回数"],
        ]
        Object.keys(member_dict).forEach(function(key){
            data.push([key, member_dict[key][0], member_dict[key][1]])
        })
        jexcelData = jexcel(table, {data:data})
        i += 1
        download.hidden = false
        undownload.hidden = false
    }
    else{
        finish.hidden = false
    }
}

window.onload = createSpreadsheet()

download.onclick = function(e){
    e.preventDefault()
    jexcelData.download()
    while(table.firstChild) table.removeChild(table.firstChild)
    download.hidden = true
    undownload.hidden = true
    createSpreadsheet()
}

undownload.onclick = function(e){
    e.preventDefault()
    while(table.firstChild) table.removeChild(table.firstChild)
    download.hidden = true
    undownload.hidden = true
    createSpreadsheet()
}

