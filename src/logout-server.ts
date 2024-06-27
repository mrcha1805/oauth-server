import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to handle the logout request
app.post("/logout", (req, res) => {
  // Logic to handle logout, e.g., clearing tokens or session data
  console.log("Logout request received");

  // For demonstration, we're just sending a response indicating logout success
  res.json({ message: "Logout successful" });
});

app.listen(3200, () => {
  console.log("Logout server is running on port 3200");
});
