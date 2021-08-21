import string, random, subprocess
import threading
from channels.layers import get_channel_layer
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from .models import GroupModel, UserModel, QuestionModel 
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
# channel
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# end

# Create your views here.
channel_layer = get_channel_layer()

def selectView(request):
    if request.method == 'POST':
        if 'editor' in request.POST:
            return redirect('editor')
        elif 'administorator' in request.POST:
            return redirect('createGroup')
        elif 'show' in request.POST:
            return redirect('selectShow')
        elif 'login' in request.POST:
            return redirect('login')
        elif 'logout' in request.POST:
            if request.user.is_authenticated:
                return redirect('logout')
            else:
                return render(request, 'select.html', {'error': 'ログインしていません'})
    else:
        return render(request, 'select.html', {})


def editorView(request):
    def resultProgram(program, input_data, file_name):
        gd_name = file_name + ".gd"
        ll_name = file_name + ".ll"
        input_name = file_name + '.txt'
        subprocess.run(['touch', '{}'.format(gd_name)])
        with open('{}'.format(gd_name), 'w') as fp:
            fp.write(program)
        
        subprocess.run(['touch', '{}'.format(input_name)])
        with open('{}'.format(input_name), 'w') as fp:
            fp.write(input_data)

        debug = subprocess.Popen(['dcc', '{}'.format(gd_name), '-o', '{}'.format(ll_name)], encoding='utf-8', stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        timer = threading.Timer(1, debug.kill)
        try:
            timer.start()
            debug_out, debug_error = debug.communicate()
        finally:
            timer.cancel()
            if debug_out is None and debug_error is None:
                return "error"
        
        subprocess.Popen(['rm', '{}'.format(gd_name)])
        if len(debug_error) == 0:
            exec = subprocess.Popen(['lli', '{}'.format(ll_name), '<', '{}'.format(input_data)], encoding='utf-8', stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            timer = threading.Timer(1, exec.kill)
            try:
                timer.start()
                result, error =  exec.communicate()
            finally:
                timer.cancel()
                subprocess.Popen(['rm', '{}'.format(ll_name), '{}'.format(input_name)])
                if result is None and error is None:
                    return "実行時間が長すぎます。無限ループか入力待ちの可能性があります。"
            return result
        else:
            return debug_error

    def checkAnswer(a,b):
        a_cut_index = 1
        while len(a) > a_cut_index and ord(a[len(a)-a_cut_index]) != 10:
            a_cut_index += 1
        if len(a) == a_cut_index:a_cut_index = 0

        b_cut_index = 1
        while len(b) > b_cut_index and ord(b[len(b)-b_cut_index]) != 10:
            b_cut_index += 1
        if len(b) == b_cut_index:b_cut_index = 0

        if a[:len(a)-a_cut_index] == b[:len(b)-b_cut_index]:return True
        else: return False


    if request.method == 'POST':
        program = request.POST.get('program_data')
        type = request.POST.get('type')
        file_name = "".join([random.choice(string.ascii_letters+string.digits) for i in range(10)])
        if type == 'submit' and request.user.is_authenticated:
            try:
                user_object = UserModel.objects.get(user=request.user)
                if user_object.join_group is not None:
                    group_object = user_object.join_group
                    question_object = QuestionModel.objects.get(pk=group_object.focus_question)
                    input_data = question_object.input
                    result = resultProgram(program, input_data, file_name)
                    
                    if checkAnswer(question_object.answer, result):
                        channel_name = user_object.join_group.admin_name + '_' + user_object.join_group.group_name + '_adminScreen'
                        async_to_sync(channel_layer.group_send)(
                            channel_name,{
                                "type": "send_data",
                                "flag": "ac_member",
                                "message": user_object.user.username
                            }
                        )
                        
                        channel_name = user_object.join_group.admin_name + '_' + user_object.join_group.group_name + '_show'
                        question_object.ac_member = question_object.ac_member + user_object.user.username + ','
                        async_to_sync(channel_layer.group_send)(
                            channel_name,{
                                "type": "send_data",
                                "flag": "ac_member",
                                "message": user_object.user.username
                            }
                        )
                        result = "正解"
                    else:
                        result = "不正解"
                    question_object.submit_member = question_object.submit_member + user_object.user.username + ','
                    question_object.save()
                else:
                    result ="グループに参加していません"
            except ObjectDoesNotExist:
                result = "問題が設定されていません"
            d = {'result': result}
            return JsonResponse(d)
        elif type == 'exec':
            input_data = request.POST.get('input_data')
            result = resultProgram(program, input_data, file_name)
            d = {'result':result}
            return JsonResponse(d)
        else:
            d = {'result': "実行されませんでした"}
            return JsonResponse(d)
    elif request.user.is_authenticated:
        object = UserModel.objects.get(user=request.user)
        if object.join_group is None:
            join_group = "なし"
        else:
            join_group = object.join_group.group_name
        return render(request, 'editor.html', {'join_group': join_group})
    else:
        return render(request, 'editor.html', {})


@login_required
def joinGroupView(request):
    if request.method == 'POST':
        admin_name_data = request.POST.get('admin_name_data')
        group_password_data = request.POST.get('group_password_data')
        group_name_data = request.POST.get('group_name_data')
        try:
            group_object = GroupModel.objects.filter(admin_name=admin_name_data)
            group_object = group_object.get(group_name=group_name_data)
            if group_password_data == group_object.join_password:
                user_object = UserModel.objects.get(user=request.user)

                joined_group = user_object.join_group
                user_object.join_group = group_object
                user_object.save()
                
                if joined_group is not None:
                    channel_name = joined_group.admin_name + '_' + joined_group.group_name + '_adminScreen'
                    async_to_sync(channel_layer.group_send)(
                        channel_name,{
                            "type": "send_data",
                            "flag": "remove_member",
                            "message": user_object.user.username,     
                        }
                    )
                    channel_name = joined_group.admin_name + '_' + joined_group.group_name + '_show'
                    async_to_sync(channel_layer.group_send)(
                        channel_name,{
                            "type": "send_data",
                            "flag": "remove_member",
                            "message": user_object.user.username
                        }
                    )

                channel_name = user_object.join_group.admin_name + '_' + user_object.join_group.group_name + '_adminScreen'
                async_to_sync(channel_layer.group_send)(
                    channel_name,{
                        "type": "send_data",
                        "flag": "join_member",
                        "message": user_object.user.username
                    }
                )
                channel_name = user_object.join_group.admin_name + '_' + user_object.join_group.group_name + '_show'
                async_to_sync(channel_layer.group_send)(
                    channel_name,{
                        "type": "send_data",
                        "flag": "join_member",
                        "message": user_object.user.username
                    }
                )
                # end

                return redirect('editor')
            else:
                return render(request, 'joinGroup.html', {'error': 'パスワードが一致しません'})
        except ObjectDoesNotExist:
            return render(request, 'joinGroup.html', {'error': '管理者またはグループ名が一致しません'})
    else:
        return render(request, 'joinGroup.html', {})


def selectsignView(request):
    if request.method == 'POST':
        if 'signup' in request.POST:
            return redirect('signup')
        elif 'login' in request.POST:
            return redirect('login')
    else:
        return render(request, 'selectsign.html', {})


def signupView(request):
    if request.method == 'POST':
        username_data = request.POST.get('username_data')
        password_data = request.POST.get('password_data')
        if "," in username_data:return render(request, 'signup.html', {'error': 'ユーザーネームに , は使用できません'})
        try:
            User.objects.create_user(username_data, '', password_data)
            user = authenticate(request, username=username_data, password=password_data)
            login(request, user)
            object = UserModel.objects.create(user=user)
            object.save()
            return redirect('select')
        except IntegrityError:
            return render(request, 'signup.html', {'error': 'この管理者名は既に使われています'})
    else:
        return render(request, 'signup.html', {})


def loginView(request):
    if request.method == 'POST':
        if 'login' in request.POST:
            username_data = request.POST.get('username_data')
            password_data = request.POST.get('password_data')
            user = authenticate(username=username_data, password=password_data)
            if user is not None:
                login(request, user)
                next_url = request.GET.get('next')
                if next_url is None:
                    return redirect('select')
                else:
                    return redirect(next_url)
            else:
                return render(request, 'login.html', {'error': 'ユーザー名またはパスワードを確認してください'})
        elif 'signup' in request.POST:
            return redirect('signup')
    return render(request, 'login.html', {})


def logoutView(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('select')
    else:
        return redirect('select')

@login_required
def createGroupView(request):
    def banGroupName(group, groups):
        if ',' in group:return True
        for i in groups:
            if i.group_name == group:
                return True
        return False

    if request.method == 'POST':
        if 'create_group' in request.POST:
            group_name_data = request.POST.get('group_name_data')
            group_password_data = request.POST.get('group_password_data')
            screen_password_data = request.POST.get('screen_password_data')

            object = UserModel.objects.get(user=request.user)
            
            if banGroupName(group_name_data, GroupModel.objects.filter(admin=request.user)):
                return render(request, 'createGroup.html', {'error': 'グループ名は既に使われているか , が使われています'})
            
            object = GroupModel.objects.create(
                admin = request.user,
                admin_name = request.user.username,
                group_name = group_name_data,
                join_password = group_password_data,
                screen_password = screen_password_data
            )
            object.save()
            return redirect('adminScreen',object.pk)
        elif 'created_group' in request.POST:
            return redirect('createdGroup')
        elif 'login' in request.POST:
            return redirect('login')
    else:
        return render(request, 'createGroup.html', {})

@login_required
def createdGroupView(request):
    object_list = GroupModel.objects.filter(admin=request.user)
    return render(request, 'createdGroup.html', {'object_list': object_list})


@login_required
def adminScreenView(request,pk):
    group_object = GroupModel.objects.get(pk=pk)
    if group_object.admin != request.user:return redirect('select')

    if request.method == 'POST':
        type = request.POST.get('type')
        if 'dissolution' in request.POST:
            #　スプレットシート作成
            return redirect('createSpreadsheet',pk)
        elif type == 'ajax-submit-next-question':
            question = request.POST.get('question')
            title = request.POST.get('title')
            answer = request.POST.get('answer')
            input = request.POST.get('input')
            if input is None: input = ""
            question_object = QuestionModel.objects.create(
                group = group_object,
                title = title,
                question = question,
                answer = answer,
                input = input
            )
            question_object.save()
            group_object.focus_question = question_object.pk
            group_object.save()
            next_question = str(group_object.focus_question) + ' . ' + question_object.title            
            d = {'question': next_question}
            
            channel_name = group_object.admin_name + '_' + group_object.group_name + '_show'
            async_to_sync(channel_layer.group_send)(
                channel_name,{
                    "type": "send_data",
                    "flag": "next_question",
                    "message": question_object.question
                }
            )

            return JsonResponse(d)
        elif type == 'ajax-submit-updata':
            question = request.POST.get('question')
            title = request.POST.get('title')
            answer = request.POST.get('answer')
            input = request.POST.get('input')
            if input is None:input = ""
            question_object = QuestionModel.objects.get(pk=group_object.focus_question)
            question_object.question = question
            question_object.title = title
            question_object.answer = answer
            question_object.input = input
            question_object.save()
            d = {'result': True}

            channel_name = group_object.admin_name + '_' + group_object.group_name + '_show'
            async_to_sync(channel_layer.group_send)(
                channel_name,{
                    "type": "send_data",
                    "flag": "updata_question",
                    "message": question_object.question
                }
            )
            
            return JsonResponse(d)
        elif type == 'ajax-submit-select-question':
            select_question_id = int(request.POST.get('select_question_id'))
            try:
                select_question = QuestionModel.objects.get(pk=select_question_id)
            except ObjectDoesNotExist:
                return JsonResponse({"type":"error","error":"問題が見つかりませんでした"})
            group_object.focus_question = select_question.pk
            group_object.save()
            title = select_question.title
            question = select_question.question
            answer = select_question.answer
            input = select_question.input
            focus_question = str(select_question_id) + ' . ' + title
            ac_members = select_question.ac_member
            d = {'type':'correct', 'title':title, 'question':question, 'answer':answer, 'input': input, 'focus_question': focus_question, 'ac_members': ac_members}
            
            channel_name = group_object.admin_name + '_' + group_object.group_name + '_show'
            async_to_sync(channel_layer.group_send)(
                channel_name,{
                    "type": "send_datas",
                    "flag": "select_question",
                    "message1": select_question.question,
                    "message2": select_question.ac_member
                }
            )

            return JsonResponse(d)
    else:
        group_object = GroupModel.objects.get(pk=pk)
        group_name = group_object.group_name
        join_password = group_object.join_password
        screen_password = group_object.screen_password
        focus_q = group_object.focus_question
        member_list = UserModel.objects.filter(join_group=group_object)
        title = ''
        question = ''
        answer = ''
        input = ''

        if focus_q == -1:
            focus_q = "なし"
        else:
            select_question = QuestionModel.objects.get(pk=focus_q)
            title = select_question.title
            question = select_question.question
            answer = select_question.answer
            input = select_question.input
            focus_q = str(focus_q) + ' . ' + QuestionModel.objects.get(pk=focus_q).title
            
            channel_name = group_object.admin_name + '_' + group_object.group_name + '_show'
            async_to_sync(channel_layer.group_send)(
                channel_name,{
                    "type": "send_datas",
                    "flag": "select_question",
                    "message1": select_question.question,
                    "message2": select_question.ac_member
                }
            )
        
        created_questions = QuestionModel.objects.filter(group=group_object)
        try:
            ac_members = QuestionModel.objects.get(pk=group_object.focus_question).ac_member
        except ObjectDoesNotExist:
            ac_members = ""

        return render(request, 'adminScreen.html', {'join_password': join_password,'screen_password': screen_password,\
             'group_name': group_name, 'focus_question':focus_q, 'created_questions': created_questions, 'title':title,\
                  'question':question, 'answer':answer, 'input':input, 'member_list':member_list, 'ac_members': ac_members})


@login_required
def selectShowView(request):
    if request.method == 'POST':
        group_name_data = request.POST.get('group_name_data')
        screen_password_data = request.POST.get('screen_password_data')
        try: 
            groups = GroupModel.objects.filter(admin=request.user).get(group_name=group_name_data)
        except ObjectDoesNotExist:
            return render(request, 'selectShow.html', {"error":"一致するグループ名がありません"})
        if groups.screen_password == screen_password_data:
            return redirect('show', groups.pk)
        else:
            return render(request, 'selectShow.html', {"error": "パスワードが一致しません"})
    return render(request, 'selectShow.html', {})


@login_required
def showView(request, pk):
    try:
        group_object = GroupModel.objects.get(pk=pk)
    except ObjectDoesNotExist:
        return redirect('select')
    if request.user != group_object.admin: 
        return redirect('select')
    group_name = group_object.group_name
    try: 
        question_object = QuestionModel.objects.get(pk=group_object.focus_question)
    except ObjectDoesNotExist:
        return render(request, 'show.html', {'question':"問題は設定されていません", 'ac_parsent':'', 'group_name': group_name})
    
    if request.method == 'POST':
        type = request.POST.get('type')
        if type == 'ajax_get_member':
            ac_member = question_object.ac_member
            join_member = UserModel.objects.filter(join_group=group_object)
            join_members = []
            for i in join_member:
                join_members.append(i.user.username)
            d = {'ac_member':ac_member, 'join_member': join_members}
            return JsonResponse(d)
    else:
        question = question_object.question
        return render(request, 'show.html', {'question':question, 'group_name': group_name})


@login_required
def createSpreadsheetView(request, pk):
    group_object = GroupModel.objects.get(pk=pk)
    if group_object.admin != request.user:
        return redirect('select')
    if request.method == 'POST':
        group_object.delete()
        return redirect('select')
    
    group_questions = QuestionModel.objects.filter(group=group_object)
    group_question_count = group_questions.count()
    group_name = group_object.group_name
    return render(request, 'createSpreadsheet.html', {'group_question_count':group_question_count,'group_questions':group_questions, 'group_name': group_name})
