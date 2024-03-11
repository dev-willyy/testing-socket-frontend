import { Fragment, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:5005');

function App() {
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  const messageInputRef = useRef(null);

  const joinClosedRoom = () => {
    if (room !== '') {
      if (userId !== '') {
        socket.emit('joinPrivateChat', room);
        setUserIsAuthenticated(true);
      }
    }
  };

  const getAndFormatMessages = (messages, data) => {
    const messageExists = messages.some((msg) => msg.timestamp === data.timestamp && msg.room === data.room);
    if (!messageExists) return [...messages, data];
    return messages;
  };

  const sendMessage = () => {
    const timestamp = new Date().getTime();
    const sentData = { message, room, userId, timestamp };

    socket.emit('sending', sentData);

    setIncomingMessages((prevMessages) => getAndFormatMessages(prevMessages, sentData));

    messageInputRef.current.value = '';
  };

  useEffect(() => {
    socket.on('receiving', (data) => {
      setIncomingMessages((prevMessages) => getAndFormatMessages(prevMessages, data));
    });
  }, []);

  return (
    <Fragment>
      {userIsAuthenticated ? (
        <main className="chat-container">
          <section className="chat-box">
            <div className="header">Chat Box</div>
            <div className="message-list">
              {/* NOTE: RENDER ONLY UNIQUE MESSAGES BASED ON TIMESTAMP AND ROOM  */}
              {[...new Map(incomingMessages.map((msg) => [`${msg.timestamp}-${msg.room}`, msg])).values()].map(
                (msg) => (
                  <div
                    key={`${msg.timestamp}-${msg.room}`}
                    className={`message ${userId === msg.userId ? 'sender-message' : 'recipient-message'}`}
                  >
                    {msg.message}
                  </div>
                )
              )}
            </div>
            <div className="input-container">
              <input
                ref={messageInputRef}
                type="text"
                placeholder="Message..."
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send Message</button>
            </div>
          </section>
        </main>
      ) : (
        <main className="userId-container">
          <section className="chat-box recipient">
            <aside className="input-container">
              <input
                type="text"
                placeholder="User Id..."
                className="userId-input"
                onChange={(e) => setUserId(e.target.value)}
              />
            </aside>
            <aside>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Room Number..."
                  className="roomNo-input"
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
              <div className="btn-container">
                <button onClick={joinClosedRoom}>Join Room</button>
              </div>
            </aside>
          </section>
        </main>
      )}
    </Fragment>
  );
}

export default App;
