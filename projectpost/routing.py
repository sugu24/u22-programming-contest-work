from django.urls import re_path

from .consumers import DataConsumer

websocket_urlpatterns = [
    re_path(r'ws/(?P<room_name>\w+)/$', DataConsumer.as_asgi()),
]
