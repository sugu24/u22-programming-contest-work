import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class DataConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
            self.channel_name
        )
        print(type(self.room_name))
        self.accept()
    

    def disconnect(self, clone_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_name,
            self.channel_name
        )

    
    def receive(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,{'type': 'send_data', 'msg': message}
        )


    def send_data(self, event):
        message = event['message']
        type = event['type']
        flag = event['flag']
        self.send(text_data=json.dumps({'type': type, 'flag': flag,'message':message}))

    
    def send_datas(self, event):
        message1 = event['message1']
        message2 = event['message2']
        flag = event['flag']
        type = event['type']
        self.send(text_data=json.dumps({'type': type, 'flag': flag,'message1':message1, 'message2':message2}))
    

    def send_data_three(self, event):
        message1 = event['message1']
        message2 = event['message2']
        message3 = event['message3']
        flag = event['flag']
        type = event['type']
        self.send(text_data=json.dumps({'type': type, 'flag': flag,'message1':message1, 'message2':message2, 'message3':message3}))