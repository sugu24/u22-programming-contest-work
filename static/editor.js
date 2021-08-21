var editor = document.getElementById("editor");
var lines = document.getElementById("lines");
var linesArr = ["num0"];
var progArr=["line0"];
var [row, bfrrow] = [1,1];
var html;
var index = 1;
var pos_editor_topleft
var pos_cursor
var font_sizes = {"0.375":8, "0.5":8, "0.75":8, "1":8, "1.125":8, "1.2":8, "1.349":8.1481 ,"1.5":8, "1.65":8, "1.875": 8, "2.25":8, "2.625":8, "3":8, "3.75":8, "4.5":8, "6":8, "7.5":8, }


var getHtml = function(){
    html = editor.innerHTML;
}

var getCursorLocate = function(){
    pos_editor_topleft = editor.getBoundingClientRect()
    pos_cursor = window.getSelection().getRangeAt(0)
    var ele = document.createElement('span')
    ele.innerHTML = "&npbs"
    pos_cursor.insertNode(ele)
    pos_cursor = ele.getBoundingClientRect()
    ele.parentElement.removeChild(ele)
    if(pos_cursor.x === 0)return false
    else return true
};

var getHeight = function(e){
    // line height = 20px
    bfrrow = row;
    if(getCursorLocate())
        row = Math.min(progArr.length, Math.max(1,Math.floor((pos_cursor.top-pos_editor_topleft.top)/20+1)))
    //return Math.floor((pos_cursor.top-pos_editor_topleft.top)/20+1);
}

var noStringLine = function(){
    if(progArr.length > row && document.getElementById(progArr[row-1]).innerHTML == "\n")
        document.getElementById(progArr[row-1]).innerHTML = "<br>"
}

var changeLine = function(){
    progArr=[];
    var i = 0;
    var d
    // document.querySelectorAll('#editor>div[id]')
    [].forEach.call(editor.childNodes, function(elm){
        var id = elm.getAttribute('id');
        if(i != 0 && document.getElementById(id).innerHTML.length === 0)
            document.getElementById(id).remove();
        else{
            if((d = progArr.indexOf(id)) !== -1) {
                var ele = document.getElementById(id);
                ele.id = "line"+index;
                index += 1;
                progArr[d] = ele.id
            }
            progArr.push(id);
        }
        i += 1;
    });
}

var firstDiv = function(){
    if (html.length === 0)editor.innerHTML = '<div id="line0"><br></div>';
}

var setlines = function(){
    if (linesArr.length == progArr.length)return
    else if(linesArr.length > progArr.length){
        for(var i = linesArr.length-1; i >= Math.max(1,progArr.length); i--){
            document.getElementById(linesArr[i]).remove()
            linesArr.pop()
        }
    }
    else{
        var line_ele
        for(var i = linesArr.length; i < progArr.length; i++){
            line_ele = document.createElement("div")
            line_ele.id = "num" + (i);
            line_ele.textContent = (i+1);
            lines.appendChild(line_ele);
            linesArr.push("num"+(i));
        }
    }
}

var markline = function(){
    if(linesArr[bfrrow-1] != null)
        document.getElementById(linesArr[bfrrow-1]).classList.remove("focusline")
    if(linesArr[row-1] != null)
        document.getElementById(linesArr[row-1]).classList.add("focusline")
}

var innerTab = function(){
    var start = leftOfCursor()
    var prog = document.getElementById(progArr[row-1])
    var text = prog.innerText.substr(0, start) + "&nbsp;&nbsp;&nbsp;&nbsp;" + prog.innerText.substr(start, prog.innerText.length)
    prog.innerHTML = createCode(text)
}

var kakkoInner = function(){
    var start = leftOfCursor()
    var prog = document.getElementById(progArr[row-1])
    var text_bfr = prog.innerText.substr(0,start)
    var text_aft = prog.innerText.substr(start, prog.innerText.length)
    var kakko = text_bfr[text_bfr.length-1]
    if(kakko == "{") return text_bfr + "}" + text_aft
    else if(kakko == "[") return text_bfr + "]" + text_aft
    return ""
}

var addTab = function(){
    var res = ""
    var bfrprog = document.getElementById(progArr[row-1]).innerText
    for (var i = 0; i < bfrprog.length && (bfrprog[i].charCodeAt(0) === 160 || bfrprog[i].charCodeAt(0) === 32); i++){
        res += "&nbsp;"
    }
    return res
}

var insertLine = function(add_tab){
    var prog = document.getElementById(progArr[row-1])
    if(prog.innerHTML.length === 0){
        prog.innerHTML = "<br>"
        return false
    }else if(prog.innerText[prog.innerText.length-1] == "[" || prog.innerText[prog.innerText.length-1] == "{"){
        var inserthtml = document.createElement("div")
        inserthtml.id = "line" + index
        index += 1
        inserthtml.innerHTML = add_tab + "&nbsp;&nbsp;&nbsp;&nbsp;"
        prog.after(inserthtml)
        return true
    }
    return false
}

var createCode = function(txt){
    var res = ""
    var token = ""
    var is_str = false
    for(var i = 0; i <= txt.length; i++){
        if (i == txt.length || txt[i].charCodeAt(0) === 32 || txt[i].charCodeAt(0) === 160 || txt[i] == "{" || txt[i] == "}" ||
            txt[i] == "(" || txt[i] == ")" || txt[i] == ";"){
            if (token == "break" || token == "continue")
                res += '<span class="token token_green">' + token + '</span>' 
            else if(token.indexOf("..") != -1){
                if (i == txt.length || txt[i] == ";" || txt[i] == "{")
                    res = '<span class="token token_blue">' + res + token + '</span>'
                else continue
            }else if(token == "print" || token == "global" || token == "return")
                res += '<span class="token token_cyan">' + token + '</span>'
            else
                res += token

            token = ""
            if(i != txt.length & txt[i] != "&nbsp;") res += txt[i]
            else if(i != txt.length) res += "&nbsp;"
        }
        else if(txt[i] == "#"){
            res += token + '<span class="token token_orange">#' + txt.substr(i+1,txt.length-1) + '<\span>'
            token = ""
            i = txt.length
        }
        else if(txt[i] == "\""){
            if (is_str){
                res += token + '\"' + '</span>' 
                is_str = false
            }
            else{
                res += token  + '<span class="token token_red">' + '\"'
                is_str = true
            }
            token = ""
        }
        else{
            token += txt[i]
            if(token[token.length-1] == "?"){
                res += token.substr(0,token.length-1) + '<span class="token token_blue">?</span>'
                token = ""
            }
            else if(token.length > 1 && token[token.length-2] == "-" && token[token.length-1] == ">"){
                res += token.substr(0,token.length-2) + '<span class="token token_blue">-></span>'
                token = ""
            }
        }
    }
    return res
}


var charCheck = function(char){
    if((char === 160 || (char >= 0x00 && char < 0x81) ||
    (char === 0xf8f0) ||
    (char >= 0xff61 && char < 0xffa0) ||
    (char >= 0xf8f1 && char < 0xf8f4))) return true
    else return false
}

var leftOfCursor = function(){
    var zoom_level = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth * 100;
    var left_length = parseInt((pos_cursor.x-pos_editor_topleft.x-5)/font_sizes[Math.floor(zoom_level*1000)/1000])
    var line_prog = document.getElementById(progArr[row-1]).innerText
    var res = 0;
    
    for(var i = 0; i < line_prog.length; i++){
        var char = line_prog[i].charCodeAt(0);
        if (charCheck(char)){
            left_length -= 1;
        }else{
            left_length -= 2;
        }
        if (left_length >= 0) res += 1
        else break
    }
    return res
}

var isComment = function(){
    var prog = document.getElementById(progArr[row-1]).innerText
    for(var i = leftOfCursor()-2; i >= 0; i--)
        if(prog[i] == "#") return true
    return false
}

var isString = function(){
    var prog = document.getElementById(progArr[row-1]).innerText
    var c = 0
    var f = leftOfCursor()
    for(var i = 0; i < f; i++)
        if (prog[i] == "\"")c += 1
    if(c % 2 === 1 && prog[f-1] != "\"") return true
    else return false
}

var getkeyup = function(e){
    getHtml();
    firstDiv();
    if(e.keyCode === 13){
        var add_tab = addTab()
        var bfr_kakko = insertLine(add_tab)
    } 
    changeLine();
    setlines();
    getHeight(e)
    if(isComment() || isString()) return
    if(window.getSelection().toString().length === 0 & e.keyCode !== 13){
        var prog = document.getElementById(progArr[row-1])
        var text = prog.innerText;
        if(e.keyCode === 219) text = kakkoInner()
        prog.innerHTML = createCode(text)
        setcaret(row, leftOfCursor())
    }
    else if(e.keyCode === 13){
        var prog = document.getElementById(progArr[row-1])
        row -= bfr_kakko
        prog.innerHTML = add_tab + prog.innerHTML
        setcaret(row, add_tab.length+4*bfr_kakko)
    }
    markline();
}

var getkeydown = function(e){
    getHtml();
    firstDiv()
    changeLine();
    setlines();
    if(e.keyCode === 9){
        e.preventDefault()
        getCursorLocate(e)
        innerTab();
        setcaret(row, leftOfCursor()+4)
    }
    noStringLine();
    markline()
}

var getclick = function(e){
    getCursorLocate(e)
    getHeight(e)
    markline();     
}

var setcaret = function(r, left_of_cursor){
    if(document.getElementById(progArr[r-1]).innerText.length === 0)return
    var caretline = document.querySelector("#"+progArr[r-1]).childNodes
    var line_text = document.getElementById(progArr[r-1]).innerText
    if(left_of_cursor == undefined) left_of_cursor = leftOfCursor();

    var lastlength = 0
    for(var i = left_of_cursor-1; i >= 0 && line_text[i] != "\n"; i--)
        lastlength += 1
    
    var ind = -1;
    var l = 0;
    var f = true;
    for(var i = 0; i < caretline.length && f; i++){
        if(lastlength === 0)break
        var txt = "";
        l = 0;
        if(caretline[i].innerHTML != undefined)
            txt = caretline[i].innerText
        else if(caretline[i].data != undefined)
            txt = caretline[i].data

        for(var j = 0; j < txt.length; j++){
            l += 1
            lastlength -= 1
            if(lastlength === 0)break
        }
        ind += 1;
    }
    
    if(caretline[Math.max(0,ind)] == undefined)return
    
    var selection = window.getSelection()
    var range = document.createRange()
    if(caretline[Math.max(0,ind)].childNodes.length === 0){
        range.setStart(caretline[Math.max(0,ind)], l)
        range.setEnd(caretline[Math.max(0,ind)], l)
    }
    else{
        range.setStart(caretline[Math.max(0,ind)].childNodes[0], l)
        range.setEnd(caretline[Math.max(0,ind)].childNodes[0], l)
    }
    selection.removeAllRanges()
    selection.addRange(range)
}

var paste = function(){
    getCursorLocate()
    var ind = 1;
    progArr = [];
    
    [].forEach.call(editor.childNodes, function(elm){
        var id = elm.getAttribute('id');
        var tmp = document.getElementById(id)
        elm.removeAttribute('style')
        elm.removeAttribute('class')

        if(tmp == null){
            tmp.id = "line" + index
            id = elm.id
            index += 1
        }
        while((progArr.indexOf(id)) !== -1) {
            id = "line" + index;
            tmp.id = id
            index += 1;
        }
        
        progArr.push(id)

        if(row == ind){
            tmp = document.getElementById(id).innerText
            console.log(tmp, ind, document.getElementById(id).innerText.length)
            var linetext = "";
            var pasteline = null;
            var inserthtml
            for (var j = 0; j < tmp.length; j++){
                if (tmp[j] == "\n") ind += 1;
                else linetext += tmp[j]
                if (tmp[j] == "\n" || j == tmp.length-1){
                    linetext = createCode(linetext)
                    //console.log(linetext)
                    if(pasteline == null){
                        pasteline = document.getElementById(progArr[progArr.length-1])
                        if(linetext.length === 0) linetext = "<br>"
                        document.getElementById(progArr[progArr.length-1]).innerHTML = linetext                        
                    }
                    else{
                        inserthtml = document.createElement("div")
                        inserthtml.id = "line" + index
                        index += 1
                        pasteline.after(inserthtml)
                        progArr.push(inserthtml.id)
                        if(linetext.length === 0) linetext = "<br>"
                        //console.log(linetext)
                        document.getElementById(progArr[progArr.length-1]).innerHTML = linetext
                        pasteline = document.getElementById(progArr[progArr.length-1])
                    }
                    linetext = ""
                }
            }
        }
        else ind += 1
    });
}

var pasteAfterCursorPosition = function(right_of_cursor, txt){
    var res = 0
    for(var i = txt.length - right_of_cursor - 2; i >= 0 && txt[i] != "\n"; i--)
        res += 1
    return res
}

var innerPaste = function(pastetext){
    var prog = document.getElementById(progArr[row-1])
    var left_of_cursor = leftOfCursor()
    var tmp = prog.innerText.length
    prog.innerText = prog.innerText.substr(0, left_of_cursor) + pastetext + prog.innerText.substr(left_of_cursor, prog.innerText.length)
    return pasteAfterCursorPosition(tmp - left_of_cursor - 1, prog.innerText)
}

var deleteProg = function(){
    window.getSelection().deleteFromDocument()
    setcaret(row, leftOfCursor())
}

var getpaste = function(e){
    e.preventDefault()
    getCursorLocate()
    var pastetext = e.clipboardData.getData("text/plain")
    var newline = (pastetext.match(/\n/g) || []).length
    if(window.getSelection().toString().length > 0) deleteProg()
    var right_of_cursor = innerPaste(pastetext);
    paste()
    setcaret(row+newline, right_of_cursor)
    bfrrow = row
    row += newline
    setlines();    
    markline()
}

editor.addEventListener("keyup",  getkeyup)
editor.addEventListener("keydown",  getkeydown)
editor.addEventListener("click",  getclick)
editor.addEventListener("paste", getpaste)



// ---------------- リセット ---------------- //
var deleteOutput = function(){
    document.getElementById("output").innerText = ""
}

// ---------------- submit program ---------------- //
var getProgram = function(){
    var whole_program = "";
    [].forEach.call(editor.childNodes, function(elm){
        whole_program += elm.innerText
        if(elm.innerText != "\n")whole_program += "\n";
    });
    return whole_program
}


$('#ajax_exec').on('submit', function(e) {
    e.preventDefault()
    var program = getProgram()
    var input = document.getElementById('input').value
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'exec', 'program_data': program, 'input_data': input},
        'dataType': 'json'
    })
    .done(function(response){
        var time_data = new Date()
        var string = time_data.getHours() + ':' + time_data.getMinutes() + ':' + time_data.getSeconds() + '>\n' + response.result + "\n\n"
        document.getElementById("output").innerHTML = string + document.getElementById("output").innerHTML
    })
})

$('#ajax_submit').on('submit', function(e) {
    e.preventDefault()
    var program = getProgram()
    $.ajax({
        'url': '',
        'type': 'POST',
        'data': {'type': 'submit','program_data': program},
        'dataType': 'json'
    })
    .done(function(response){
        var time_data = new Date()
        var string = time_data.getHours() + ':' + time_data.getMinutes() + ':' + time_data.getSeconds() + '>\n' + response.result + "\n\n"
        document.getElementById("output").innerHTML = string + document.getElementById("output").innerHTML
    })
})
