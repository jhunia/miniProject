import express from "express";
import adminRoutes from "./admin/admin.route.js";
import userRoutes from "./user/user.route.js";
import { connectToDB } from "./config/mongodb.js";

const port = 2002;

const app = express();
app.use(express.json());

connectToDB();
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


app.listen(port, () => {
    console.log(`server is listening on port ${port} 🔌`)
})
