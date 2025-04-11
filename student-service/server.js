const app = require("./src/app");
require("dotenv").config({ path: "./.env" });

const PORT = 8009;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
