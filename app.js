var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);
usernames = {}

app.get('/' , function(req,res){
  res.sendFile(__dirname + '/index1.html')
});

app.get('/admin' , function(req,res){
  res.sendFile(__dirname + '/admin.html')
});
io.sockets.on('connection', function(socket){
  socket.on('newuser',function(data,callback){
    console.log(data)
    if(data in usernames){
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      usernames[socket.username] = socket;
      updateUsernames();
    }
  });
  socket.on('getuser',function(data){
    io.sockets.emit('allusers' , Object.keys(usernames));
  });
  //updateUsernames
function updateUsernames() {
    io.sockets.emit('usernames' , Object.keys(usernames));
  }
  //send messages
  socket.on('send message',function(data , callback){

    var message = data.trim();
    if(message.substr(0,3) === '/w ') {
      message = message.substr(3);
      var index = message.indexOf(' ');
      if(index != -1){
        var name = message.substring(0,index)
        var msg = message.substring(index+1);
        if(name in usernames) {
           usernames[name].emit('whisper', {msg :msg, un : socket.username});
        } else {
          callback('Error enter a valid user')
        }
      } else {
          callback('Please enter a message...')
      }
    }else {
      console.log(message)
      io.sockets.emit('new message', {msg :message, un : socket.username});
    }

  });

  //disconnect
  socket.on('disconnect' , function(data){
    if (!socket.username) return ;
    delete usernames[socket.username];
    updateUsernames();
  });

  //admin broadcast
  socket.on('broadcastMessage' , function(data){
      io.sockets.emit('adminBroadcast' , data);
  });
});
