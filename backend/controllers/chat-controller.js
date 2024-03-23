const Chat = require("../models/chatModel");
const User = require("../models/UserModel");

const Get_Chat = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user } },
    })
      .sort({ updatedAt: -1 })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updateAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        return res.status(200).json(results);
      });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const accesChat = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "UserID pram not send with request" });
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user } } }, // Check if current user is in the chat
      { users: { $elemMatch: { $eq: userID } } }, // Check if the requested user is in the chat
    ],
  })
    .populate("users", "-password") // Populate the 'users' field, excluding 'password'
    .populate("latestMessage"); // Populate the 'latestMessage' field

  // Populating additional fields for clarity
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.json(isChat[0]); // Return the first chat found
  } else {
    // If no chat exists, create a new one
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userID], // Include current user and requested user in the chat
    };
  }

  try {
    // Create a new chat
    const createdChat = await Chat.create(chatData);
    // Fetch the newly created chat with populated users
    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    return res.status(200).json(FullChat); // Return the newly created chat
  } catch (error) {
    return res.status(400).json({ error: error.message }); // Handle any errors
  }
};

const Add_Group = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ error: "Please Fill All The Fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ error: "You need more than 2 users to form a group chat" });
  }

  // we need the current user to the group to
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Populate the 'users' field on the created chat
    await groupChat.populate("users", "-password");

    // Populate the 'latestMessage' field on the created chat
    await groupChat.populate("latestMessage");

    return res.status(200).json(groupChat);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const Rename_Group = async (req, res) => {
  const { chatID, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(400).json({ error: "Chat Not Found" });
  }

  return res.status(200).json(updatedChat);
};

const AddToGroup = async (req, res) => {
  const { chatID, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatID,
      { $push: { users: userId } },
      { new: true } // This option ensures that the updated document is returned
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(400).json({ error: "Chat Not Found" });
    }

    return res.status(200).json(added);
  } catch (err) {
    console.error("Error:", err); // Debugging log
    return res.status(400).json({ error: err.message });
  }
};

const Delete_Group = async (req, res) => {
  const { chatID, userId } = req.body;
  console.log(chatID, userId);
  const remove = await Chat.findByIdAndUpdate(
    chatID,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!remove) {
    return res.status(400).json({ error: "Chat Not Found" });
  }

  return res.status(200).json(remove);
};

module.exports = {
  accesChat,
  Get_Chat,
  Add_Group,
  Rename_Group,
  AddToGroup,
  Delete_Group,
};
