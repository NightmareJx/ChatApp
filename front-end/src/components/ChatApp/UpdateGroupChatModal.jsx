import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Button,
  Box,
  FormControl,
  Input,
  useToast,
  Stack,
  Skeleton,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { useChatContext } from "../../hook/useChatContext";
import UserBadgeItem from "./UserBadgeItem";
import axios from "axios";
import UserListItem from "./UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [searchResult, SetSearchResult] = useState([]);
  const [loading, SetLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const { selectedChat, SetselectedChat, user } = useChatContext();
  const toast = useToast();

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove users from the group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      SetLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupdelete",
        {
          chatID: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? SetselectedChat() : SetselectedChat(data);
      setFetchAgain(!fetchAgain);
      SetLoading(false);
      fetchMessages();
    } catch (error) {
      SetLoading(false);
      return toast({
        title: "Failed to search the user",
        description: error.message || JSON.stringify(error),
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      return toast({
        title: "Please Fill The Group Name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      console.log(config);
      console.log(selectedChat._id);

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatID: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      SetselectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      return toast({
        title: `The Group has been Renamed To ${groupChatName}!`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } catch (err) {
      setRenameLoading(false);
      setGroupChatName("");
      return toast({
        title: "Failed to create group chat",
        description: err.message || JSON.stringify(err),
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      SetSearchResult([]);
      return;
    }

    try {
      SetLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config);
      console.log(data);
      SetSearchResult(data);
      SetLoading(false);
    } catch (err) {
      SetLoading(false);
      return toast({
        title: "Failed to search the user",
        description: err.message || JSON.stringify(err),
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      return toast({
        title: "User Already in Group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    console.log(selectedChat.groupAdmin._id, user._id);
    if (selectedChat.groupAdmin._id !== user._id) {
      return toast({
        title: "Only admins can add users to the group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    try {
      SetLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatID: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      SetselectedChat(data);
      setFetchAgain(!fetchAgain);
      SetLoading(false);
    } catch (error) {
      SetLoading(false);
      return toast({
        title: "Failed to search the user",
        description: error.message || JSON.stringify(error),
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  return (
    <>
      <IconButton onClick={onOpen} display={"flex"} icon={<ViewIcon />}>
        Open Modal
      </IconButton>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"} pb={3}>
              {selectedChat.users.map((u) => {
                return (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleRemove(u)}
                  />
                );
              })}
            </Box>
            <FormControl display={"flex"}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User To The Group"
                mb={3}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Stack>
                <Skeleton height="45px" />
                <Skeleton height="45px" />
                <Skeleton height="45px" />
              </Stack>
            ) : searchResult && searchResult.length > 0 ? (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave The Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
