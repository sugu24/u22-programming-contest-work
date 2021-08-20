from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class GroupModel(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    admin_name = models.CharField(max_length=20, default="")
    group_name = models.CharField(default="", max_length=20)
    join_password = models.CharField(max_length=20)
    screen_password = models.CharField(max_length=20)
    focus_question = models.IntegerField(null=True, blank=True,default=-1)


class UserModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    join_group = models.ForeignKey(GroupModel, null=True, blank=True, on_delete=models.SET_NULL)


class QuestionModel(models.Model):
    group = models.ForeignKey(GroupModel, on_delete=models.CASCADE)
    title = models.CharField(max_length=30)
    question = models.CharField(max_length=200)
    answer = models.TextField()
    ac_member = models.TextField(default="")
    submit_member = models.TextField(default="")


#class QuestionModel(models.Model):
