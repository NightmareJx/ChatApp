import React, { useEffect, useState } from "react";
import { useChatContext } from "../../hook/useChatContext";
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../../config/getSender";
import ProfileModule from "./ProfileModule";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../../animation/dots.json";

const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, SetselectedChat, setRefetch, refetch } =
    useChatContext();
  const toast = useToast();

  //lottie option
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  //socket.io setup and check for usertyping
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) {
      return;
    }
    // check if typing is false we will set it to true and sendthe socket
    if (!isTyping) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // check if the user stopped tying 3s ago we will set typing to false
    // and send socket stop typing
    let lastTypingTime = new Date().getTime();
    var timerLenght = 3000;
    setTimeout(() => {
      var timerNow = new Date().getTime();
      var timeDiff = timerNow - lastTypingTime;

      if (timeDiff >= timerLenght && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLenght);
  };

  const fetchMessages = async () => {
    setLoading(true);
    if (!selectedChat) {
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data); // Update state directly with the fetched data array
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      return toast({
        title: "Failed to fetch messages",
        description: error.message || JSON.stringify(error),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          "/api/message/",
          {
            content: newMessage,
            chatID: selectedChat._id,
          },
          config
        );

        try {
          socket.emit("new message", data);
        } catch (error) {
          console.error("Error emitting 'new message' event:", error);
        }
        // we will send the message to socket.io as newrecievedmessage
        console.log("pass to socketio", data);
        // Append the new message to the existing messages array
        setMessages([...messages, data]);
      } catch (error) {
        return toast({
          title: "Failed to send the message",
          description: error.message || JSON.stringify(error),
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        });
      }
    }
  };

  // Fetch messages when component mounts or selectedChat changes
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedChatCompare = selectedChat;
  }, [selectedChat]); // Only refetch messages when selectedChat changes

  // i t will check every time if selectedchat or selectedchat id isnt the newmessage chat id
  // then we will display notification else if it is he will add it to the messages so we can display them all in realtime

  useEffect(() => {
    socket.on("message recieved", async (newMessageRecieved) => {
      setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      setRefetch(!refetch);
    });
  }, []);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => SetselectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModule user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
            position={"relative"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <div
                className="messages"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                }}
              >
                {/* Pass messages directly to ScrollableChat */}
                <ScrollableChat messages={messages} isTyping={isTyping} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={1}>
              {isTyping ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: "10px",
                    marginBottom: "0px",
                  }}
                >
                  <Tooltip label={user.name} placement="bottom-start" hasArrow>
                    <Avatar
                      mt={"7px"}
                      mr={1}
                      size={"sm"}
                      cursor={"pointer"}
                      name={user.name}
                      src={user.pic}
                    />
                  </Tooltip>
                  <span
                    style={{
                      paddingBottom: "35px",
                    }}
                  >
                    <div>
                      <Lottie
                        options={defaultOptions}
                        width={40}
                        style={{ marginLeft: 0, marginBottom: 5 }}
                      />
                    </div>
                  </span>
                </div>
              ) : null}
              <Input
                variant={"filled"}
                bg={"#E0E0E0"}
                placeholder="Enter your message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
        >
          <Text fontSize="3xl" pb={3} fontFamily={"Work sans"}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
