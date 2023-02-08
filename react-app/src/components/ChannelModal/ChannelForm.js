import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ChannelForm.module.css";
import {
  getChannelThunk,
  deleteChannelThunk,
  getUserChannelsThunk,
} from "../../store/channel";
import formatDateTime from "../formatDateTime";
import { io } from "socket.io-client";
let socket;

export default function ChannelForm({ setShowModal }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const channels = useSelector((state) => state.channel.channels);
  const [channel, setChannel] = useState(null);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    // open socket connection
    // create websocket
    socket = io();
    socket.on("chat", () => {
      dispatch(getChannelThunk(channel.id)).then((channel) => {
        setChannel(channel);
      });
    });
    socket.on("edit", () => {
      dispatch(getChannelThunk(channel.id)).then((channel) => {
        setChannel(channel);
      });
    });
    socket.on("delete", () => {
      dispatch(getChannelThunk(channel.id)).then((channel) => {
        setChannel(channel);
      });
    });
    //join room
    if (channel) {
      socket.emit("join", {
        user: user.username,
        room: channel.id,
      });
    }
    // when component unmounts, disconnect
    return () => {
      socket.disconnect();
    };
  }, [user, dispatch, channel]);

  const updateChatInput = (e) => {
    setChatInput(e.target.value);
  };

  const sendChat = (e) => {
    e.preventDefault();
    socket.emit("chat", {
      id: user.id,
      user: user.username,
      message: chatInput,
      channelId: channel.id,
      room: channel.id,
    });
    setChatInput("");
  };

  const getChannel = (channelId) => {
    dispatch(getChannelThunk(channelId)).then((channel) => {
      setChannel(channel);
    });
  };

  const editMessage = (message) => {
    socket.emit("edit", {
      id: message.id,
      message,
      room: channel.id,
    });
  };

  const deleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      socket.emit("delete", { id: messageId, room: channel.id });
    }
  };

  const deleteChannel = (channelId) => {
    if (window.confirm("Are you sure you want to delete this channel?")) {
      dispatch(deleteChannelThunk(channelId)).then(() => {
        if (channel.id === channelId) {
          setChannel(null);
        }
        dispatch(getUserChannelsThunk(user.id));
      });
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.channels}>
        <div>{user.username}'s Channels</div>
        {channels.map((channel) => {
          if (channel.users.length < 2) {
            channel.name = channel.users[0].username; //this code should never run if channels are properly getting deleted
          } else if (channel.users.length === 2) {
            const other_user = channel.users.find((channel_member) => {
              return channel_member.id !== user.id;
            });
            channel.name = other_user.username;
          } else {
            channel.name = `${channel.users[0].username} and ${
              channel.users.length - 1
            } others`;
          }
          return (
            <div
              key={`channel-${channel.id}`}
              onClick={() => getChannel(channel.id)}
              className={styles.channel}
            >
              <div>{channel.name ? channel.name : "general"}</div>
              <div
                className={styles.delete}
                onClick={() => deleteChannel(channel.id)}
              >
                <i className="fas fa-trash-can"></i>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.messages_main}>
        <div className={styles.messages}>
          {!channel && (
            <div className={styles.no_channel}>
              Select a channel to start chatting!
            </div>
          )}
          {channel &&
            channel.messages.map((message) => {
              return (
                <div key={`message-${message.id}`} className={styles.message}>
                  <div className={styles.message_header}>
                    <div className={styles.message_user_info}>
                      <strong className={styles.message_username}>
                        {message.user.username}
                      </strong>
                      <div>{formatDateTime(message.created_at)}</div>
                    </div>
                    {user.id === message.user.id && (
                      <div className={styles.message_icons}>
                        {/* <div
                          className={styles.message_edit}
                          onClick={() => editMessage(message)}
                        >
                          <i className="fas fa-edit"></i>
                        </div> */}
                        <div
                          className={styles.delete}
                          onClick={() => deleteMessage(message.id)}
                        >
                          <i className="fas fa-trash-can"></i>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>{message.message}</div>
                </div>
              );
            })}
        </div>
        {channel && (
          <form className={styles.form} onSubmit={sendChat}>
            <input
              className={styles.chat_input}
              value={chatInput}
              onChange={updateChatInput}
              placeholder={"Message"}
            />
          </form>
        )}
      </div>
    </div>
  );
}
