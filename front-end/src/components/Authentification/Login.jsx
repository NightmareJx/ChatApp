import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const Login = () => {
  const [show, SetShow] = useState(false);
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [loading, SetLoading] = useState(false);
  const toast = useToast();

  const handleReload = () => {
    window.location.reload();
  };

  const handleClick = () => {
    SetShow(!show);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    SetLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill All The Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      SetLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );
      toast({
        title: "Login was Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("UserInfo", JSON.stringify(data));
      SetLoading(false);
      handleReload();
    } catch (err) {
      toast({
        title: "Error occurred",
        description: err.response.data.error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      SetLoading(false);
    }
  };

  return (
    <VStack spacing={"5px"}>
      <FormControl id="Logemail" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          placeholder="Enter You email"
          onChange={(e) => SetEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="Logpassword" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="Enter You password"
            onChange={(e) => SetPassword(e.target.value)}
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>

      <Button
        variant={"solid"}
        colorScheme="red"
        width={"100%"}
        onClick={() => {
          SetEmail("guest@example.com");
          SetPassword("Guest@123456789");
        }}
      >
        Login as guest
      </Button>
    </VStack>
  );
};

export default Login;
