const server = require('http').createServer()
const io = require('socket.io')(server)

io.on('connection', function (client) {
  client.on('register', handleRegister)

  client.on('join', handleJoin)

  client.on('leave', handleLeave)

  client.on('message', handleMessage)

  client.on('chatrooms', handleGetChatrooms)

  client.on('availableUsers', handleGetAvailableUsers)

  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
    handleDisconnect()
  })

  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})

server.listen(5000, function (err) {
  if (err) throw err
  console.log('listening on port 3000')
})

function handleRegister(userName, callback) {
    if (!clientManager.isUserAvailable(userName))
      return callback('user is not available')
  
    const user = clientManager.getUserByName(userName)
    clientManager.registerClient(client, user)
  
    return callback(null, user)
  }

  function handleEvent(chatroomName, createEntry) {
    return ensureValidChatroomAndUserSelected(chatroomName)
      .then(function ({ chatroom, user }) {
        // append event to chat history
        const entry = { user, ...createEntry() }
        chatroom.addEntry(entry)
  
        // notify other clients in chatroom
        chatroom.broadcastMessage({ chat: chatroomName, ...entry })
        return chatroom
      })
  }

  const members = new Map()
  let chatHistory = []
  
  function broadcastMessage(message) {
    members.forEach(m => m.emit('message', message))
  }
  
  function addEntry(entry) {
    chatHistory = chatHistory.concat(entry)
  }
  
  function getChatHistory() {
    return chatHistory.slice()
  }
  
  function addUser(client) {
    members.set(client.id, client)
  }
  
  function removeUser(client) {
    members.delete(client.id)
  }
  
  function serialize() {
    return {
      name,
      image,
      numMembers: members.size
    }
  }
  function handleJoin(chatroomName, callback) {
    const createEntry = () => ({ event: `joined ${chatroomName}` })
  
    handleEvent(chatroomName, createEntry)
      .then(function (chatroom) {
        // add member to chatroom
        chatroom.addUser(client)
  
        // send chat history to client
        callback(null, chatroom.getChatHistory())
      })
      .catch(callback)
  }
  
function handleDisconnect() {
    // remove user profile
    clientManager.removeClient(client)
    // remove member from all chatrooms
    chatroomManager.removeClient(client)
  }