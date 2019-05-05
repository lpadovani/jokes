const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("superagent");

// Endpoint for drift conversation api, you'll want to leave DEFINELY_QA as undefined or false.
const CONVERSATION_API_BASE = process.env.DEFINELY_QA
  ? "https://driftapiqa.com/v1/conversations"
  : "https://driftapi.com/v1/conversations";

// Endpoint for joke fetch.
const JOKE_URL = "http://api.icndb.com/jokes/random";
const JOKE_PHRASE = "tell me a joke";

const TOKEN = "";
console.log("token", TOKEN);
console.log("conversation api", CONVERSATION_API_BASE);

// Send a drift message to be posted by the drift api.
const sendMessage = (conversationId, message) => {
  console.log(
    "endpoint ",
    CONVERSATION_API_BASE + `/${conversationId}/messages`
  );
  console.log("message ", message);
  return request
    .post(CONVERSATION_API_BASE + `/${conversationId}/messages`)
    .set("Content-Type", "application/json")
    .set(`Authorization`, `bearer ${TOKEN}`)
    .send(message)
    .catch(err => console.log("error", err));
};

const handleMessage = (orgID, data) => {
  const messageBody = data.body;
  const messageID = data.conversationId;

  if (messageBody.includes(JOKE_PHRASE)) {
    getRandomJoke(orgID, messageID);
  } else {
    console.log("you didn't ask for a joke");
  }
};
const getRandomJoke = (orgID, messageID) => {
  let joke = "";
  request.get(JOKE_URL).then(res => {
    joke = res.body.value.joke;
    sendMessage(
      messageID,
      JSON.stringify({
        orgId: orgID,
        body: joke,
        type: "private_prompt"
      })
    ).catch(err => console.log("error", err));
  });
};

const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.listen(PORT, () => console.log(`Drift app listening on port ${PORT}!`));
app.post("/api", (req, res) => {
  // console.log('body', JSON.stringify(req.body));
  // new_message is a particular drift event type for the web hook.
  if (req.body.type === "new_message") {
    handleMessage(req.body.orgId, req.body.data);
  }
  return res.send("ok");
});
