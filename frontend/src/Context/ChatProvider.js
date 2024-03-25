import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, SetSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [refetch, setRefetch] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Fixed JSON.parse
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        SetSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        refetch,
        setRefetch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
