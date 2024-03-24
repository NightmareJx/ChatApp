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

const Signup = () => {
  const [show, SetShow] = useState(false);
  const [name, SetName] = useState("");
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [confirmpassword, SetConfirmpassword] = useState("");
  const [pic, SetPic] = useState("");
  const [loading, SetLoading] = useState(false);
  const toast = useToast();

  const handleReload = () => {
    window.location.reload();
  };

  const handleClick = () => {
    SetShow(!show);
  };

  const PostDetails = (pics) => {
    // showing an alert chakraUI
    SetLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please Select profile image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    // sending img to Cloudinary
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "Chatty");
      data.append("cloud_name", "dha1jprrp");
      fetch("https://api.cloudinary.com/v1_1/dha1jprrp/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.url) {
            // Check if data and data.url are defined
            SetPic(data.url.toString());
            console.log(data.url.toString());
          } else {
            console.error("Error uploading image:", data);
          }
          SetLoading(false);
        });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    SetLoading(true);
    if (!name || !email || !password || !confirmpassword) {
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
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Does Not Match",
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
        "/api/user",
        { name, email, password, pic },
        config
      );
      toast({
        title: "Registration was Successful",
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
        title: err.message,
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
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter You username"
          onChange={(e) => SetName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter You email"
          onChange={(e) => SetEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
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

      <FormControl id="passwordConfirmation" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter You password"
            onChange={(e) => SetConfirmpassword(e.target.value)}
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Upload Image</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => PostDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
