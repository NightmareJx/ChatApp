const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const chatModel = require("../models/chatModel");

const allMessages = async (req, res) => {
  try {
    const message = await Message.find({ chat: req.params.chatID })
      .populate("sender", "name pic email")
      .populate("chat");

    return res.status(200).json(message);
  } catch (error) {
    return res.status(400).json(400);
  }
};

const sendMessage = async (req, res) => {
  const { content, chatID } = req.body;
  if (!content || !chatID) {
    return res
      .status(400)
      .json({ error: "Invalid data passed to the request" });
  }

  const newMessage = {
    // its the user id
    sender: req.user,
    content: content,
    chat: chatID,
  };

  try {
    // create a new message and ppopulate through sender and get the name and pic
    // populate chat and get the whole doc
    //populate through users of the chat in message doc and give them the name pic email
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // it update the latest message in the chatModel
    await chatModel.findByIdAndUpdate(req.body.chatID, {
      latestMessage: message,
    });

    // return populated full message
    return res.status(200).json(message);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  allMessages,
};
