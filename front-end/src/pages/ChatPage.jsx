import React, { useState } from "react";
import { useChatContext } from "../hook/useChatContext";
import { Box } from "@chakra-ui/react";
import SideDrower from "../components/ChatApp/SideDrower";
import MyChats from "../components/ChatApp/MyChats";
import ChatBox from "../components/ChatApp/ChatBox";

const ChatPage = () => {
  const { user } = useChatContext();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrower />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
