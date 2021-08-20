from django.urls import path
from .views import selectView, editorView, joinGroupView, createGroupView, selectShowView, adminScreenView, signupView, loginView, selectsignView, createdGroupView, showView, createSpreadsheetView, logoutView

urlpatterns = [
    path('select/', selectView, name='select'),
    path('selectsign/', selectsignView, name='selectsign'),
    path('signup/', signupView, name='signup'),
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
    path('editor/', editorView, name='editor'),
    path('joinGroup/', joinGroupView, name="joinGroup"),
    path('createGroup/', createGroupView, name='createGroup'),
    path('selectShow/', selectShowView, name='selectShow'),
    path('show/<int:pk>', showView, name='show'),
    path('adminScreen/<int:pk>', adminScreenView, name='adminScreen'),
    path('createdGroup/', createdGroupView, name='createdGroup'),
    path('createSpreadsheet/<int:pk>', createSpreadsheetView, name='createSpreadsheet'),
]