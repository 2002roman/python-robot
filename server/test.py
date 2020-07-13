from socketIO_client import SocketIO, LoggingNamespace

with SocketIO('http://carinspider.herokuapp.com', 23212, LoggingNamespace) as socketIO:
    socketIO.emit('aaa')
    socketIO.wait(seconds=1)