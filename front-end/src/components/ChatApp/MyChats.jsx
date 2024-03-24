import React, { useEffect, useState } from "react";
import { useChatContext } from "../../hook/useChatContext";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./GroupChatModal";
import { getSender } from "../../config/getSender";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:4000";
var socket;

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const { user, selectedChat, SetselectedChat, chats, setChats, refetch } =
    useChatContext();
  const [LatestMessage, setLatestMessage] = useState([]);

  const toast = useToast();

  // Socket.io setup
  useEffect(() => {
    const newSocket = io(ENDPOINT);
    newSocket.emit("setup", user);
    newSocket.on("connected", () => {
      setSocketConnected(true);
    });
    newSocket.on("new message", (newMessageReceived) => {
      console.log("New message received:", newMessageReceived);
      setLatestMessage([newMessageReceived]);
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (socketConnected) {
    console.log("connected");
  }

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the chat ",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("UserInfo")));
    fetchChats();
  }, [refetch]);

  console.log(LatestMessage);
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir={"column"}
      alignItems={"center"}
      p={3}
      bg={"white"}
      w={{ base: "100%", md: "31%" }}
      borderRadius={"lg"}
      borderWidth={"1px"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily={"Work sans"}
        display={"flex"}
        w={"100%"}
        justifyContent={"space-between"}
        alignContent={"center"}
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display={"flex"}
        flexDir={"column"}
        p={3}
        bg={"#F8F8F8"}
        w={"100%"}
        h={"100%"}
        borderRadius={"lg"}
        overflowY={"hidden"}
      >
        {chats ? (
          <Stack overflowY={"scroll"} overflowX={"hidden"}>
            {chats.map((chat) => (
              <Box
                onClick={() => SetselectedChat(chat)}
                cursor={"pointer"}
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius={"lg"}
                key={chat._id}
              >
                <Text>
                  <b>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </b>
                </Text>
                <Text>
                  {LatestMessage.length ? (
                    <span style={{ display: "inline-block" }}>
                      {LatestMessage[0].sender.name} :{" "}
                      {LatestMessage[0].content}
                    </span>
                  ) : chat.latestMessage ? (
                    <span style={{ display: "inline-block" }}>
                      {chat.latestMessage.sender.name} :{" "}
                      {chat.latestMessage.content}
                    </span>
                  ) : (
                    <span style={{ display: "inline-block" }}>
                      No Messages Yet
                    </span>
                  )}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
