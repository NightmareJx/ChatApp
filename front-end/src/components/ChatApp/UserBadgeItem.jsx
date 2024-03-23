import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      p={1}
      m={1}
      bg="purple"
      color="white"
      fontSize={12}
      cursor="pointer"
      onClick={() => handleFunction()} // Call handleFunction when clicked
      borderRadius="md"
      display="flex"
      alignItems="center"
    >
      {user.name} <CloseIcon pl={1} />
    </Box>
  );
};

export default UserBadgeItem;
