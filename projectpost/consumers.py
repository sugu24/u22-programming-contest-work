import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()
    

    async def disconnect(self, clone_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    
    async def receive(self, message):
        await self.channel_layer.group_send(
            self.room_name,{'type': 'send_data', 'msg': message}
        )


    async def send_data(self, event):
        message = event['message']
        type = event['type']
        flag = event['flag']
        print(1,flag)
        await self.send(text_data=json.dumps({'type': type, 'flag': flag,'message':message}))
        print(2,flag)

    
    async def send_datas(self, event):
        message1 = event['message1']
        message2 = event['message2']
        flag = event['flag']
        type = event['type']
        await self.send(text_data=json.dumps({'type': type, 'flag': flag,'message1':message1, 'message2':message2}))
