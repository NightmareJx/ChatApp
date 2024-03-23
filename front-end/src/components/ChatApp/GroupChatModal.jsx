import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useChatContext } from "../../hook/useChatContext";
import axios from "axios";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, SetSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = useChatContext();
  const toast = useToast();

  const handlDelete = (DelUser) => {
    console.log("delete");
    SetSelectedUsers(selectedUsers.filter((sel) => sel._id !== DelUser._id));
  };

  const handlGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      return toast({
        title: "User Already Added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
    SetSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query); // Update the search state with the provided query
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`, // Assuming user.token contains the valid token
          },
        };

        // Use the updated search state directly in the API request
        const { data } = await axios.get(`/api/user?search=${search}`, config);

        console.log(data);
        setLoading(false);
        setSearchResult(data);
      } catch (error) {
        setLoading(false);
        toast({
          title: "Failed to find users",
          description: { error },
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        });
      }
    };

    if (search) {
      fetchData();
    }
  }, [search, user.token]); // Watch for changes in search or user.token

  const HandleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      // Check if selectedUsers is empty
      return toast({
        title: "Please Fill All The Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    try {
      console.log(user.token);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Assuming user.token contains the valid token
        },
      };

      const usersIds = selectedUsers.map((u) => u._id); // Extract user IDs
      console.log(usersIds);

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(usersIds),
        },
        config
      );

      setChats([data, ...chats]);
      onClose(); // Call the onClose function correctly
      return toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } catch (error) {
      return toast({
        title: "Failed to create group chat",
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
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box width={"100%"} display={"flex"} flexWrap={"wrap"}>
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handlDelete(u)}
                />
              ))}
            </Box>

            {loading ? (
              <Spinner />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handlGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={HandleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
