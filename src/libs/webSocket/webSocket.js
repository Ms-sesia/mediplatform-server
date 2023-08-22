import socketIo from "socket.io";

const webSocket = (httpServer) => {
  const io = socketIo(httpServer);

  io.on("connection", (socket) => {
    console.log("a user connected. user(socket) id:", socket.id);
    socket.on("hi", (data) => {
      console.log("hi의 연결 데이터:", data);

      socket.emit("hi", "hi");
    });

    socket.on("requestData", (message) => {
      console.log(`requeset from client: ${JSON.stringify(message)}`);

      const dataToSend = {
        text: "클라이언트로 보내는 웹소켓 서버의 메세지입니다.",
        number: 7,
      };
      socket.emit("responseData", dataToSend);
    });

    // socket.emit("serverData", "Hello from server!");

    socket.on("disconnect", () => {
      console.log("user disconnected.", socket.id);
    });
  });
};

export default webSocket;
