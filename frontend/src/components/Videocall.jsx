import {
    Chat,
    Channel,
    ChannelList,
    Window,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    useCreateChatClient,
  } from "stream-chat-react";
  import "stream-chat-react/dist/css/v2/index.css";
  
  const apiKey = "qnvsedx5rvkf";
  const userId = "1234";
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCJ9.7yMo0llhhT7uX8XaC-b0NiLcfawusrzgJ7KD0Fg_YwU";
  
  const filters = { members: { $in: [userId] }, type: "messaging" };
  const options = { presence: true, state: true };
  const sort = { last_message_at: -1 };
  
  const Videocall = () => {
    const client = useCreateChatClient({
      apiKey,
      tokenOrProvider: token,
      userData: { id: userId },
    });

    const chatClient = client.client;
  
    if (!client) return <div>Loading...</div>;
  
    return (
      <Chat client={client}>
        <ChannelList sort={sort} filters={filters} options={options} />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    );
  };

  export default Videocall