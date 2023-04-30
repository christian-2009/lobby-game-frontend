import React, { useState, useContext, useEffect } from "react";
import { socket } from "socket";
import UserContext from "context/UserContext";
import Text from "components/Text";
import TextArea from "components/TextArea";
import { MessagesType } from "interfaces";
import { getNextLetter } from "utils";

interface Props {
  messagesReceived: MessagesType[];
}

interface KeysPressedType {
  [index: string]: boolean;
}

export default function Chat({ messagesReceived }: Props) {
  const { username, room } = useContext(UserContext);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [message, setMessage] = useState<string>();
  const [keysPressed, setKeysPressed] = useState<KeysPressedType>({});

  const mostRecentMessage = messagesReceived[messagesReceived.length - 1];

  useEffect(() => {
    if (mostRecentMessage?.username === "ChatBot") {
      return;
    }
    setMessage(getNextLetter(messagesReceived));
  }, [messagesReceived]);

  const onSubmit = () => {
    if (message !== "") {
      const __createdtime__ = Date.now();
      // Send message to server. We can't specify who we send the message to from the frontend. We can only send to server. Server can then send message to rest of users in room
      socket.emit("send_message", { username, room, message, __createdtime__ });

      setMessage((m) => getNextLetter(messagesReceived));
    }
  };

  const checkCommandAltPressed = () =>
    //TODO make it so that we can press alt unless there is only 1 message
    keysPressed["Alt"] || keysPressed["Meta"];

  const onKeyDown = (e: any) => {
    setKeysPressed({ ...keysPressed, [e.key]: true });

    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    } else if (e.key === "Backspace") {
      if (!message || message.length <= 1) {
        e.preventDefault();
        return;
      } else if (checkCommandAltPressed()) {
        if (e.key === "Backspace") {
          e.preventDefault();
          return;
        }
      }
    }
  };

  const onKeyUp = (e: any) => {
    setKeysPressed({ ...keysPressed, [e.key]: false });
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const disableInput = () => {
    if (messagesReceived.length > 0) {
      if (mostRecentMessage?.username === username) return true;
    }
  };

  console.log(`[cs] messagesReceived`, messagesReceived);

  return (
    <div className="chat">
      <TextArea
        onSubmit={onSubmit}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        value={message}
        placeholder={"Type Here"}
        disabled={disableInput()}
      />
      {/* <Text.BodyLarge
        optionalStyles={{ fontFamily: "Roboto Slab", marginBottom: "10px" }}
      >
        Type Here
      </Text.BodyLarge>
      <textarea
        className="text-area"
        style={{
          borderBottomColor: isFocused ? "black" : undefined,
        }}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
        value={message}
      /> */}
      {/* <Button
        onClick={onSubmit}
        text={"Send"}
        optionalStyles={{
          width: "15%",
          marginTop: 0,
          marginLeft: "1.5em",
        }}
      /> */}
    </div>
  );
}