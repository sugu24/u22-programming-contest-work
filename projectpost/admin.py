from django.contrib import admin
from .models import GroupModel, QuestionModel, UserModel

# Register your models here.
admin.site.register(GroupModel)
admin.site.register(UserModel)
admin.site.register(QuestionModel)