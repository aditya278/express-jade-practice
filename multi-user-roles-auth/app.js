const express = require('express');
const app = express();
require('./dbConnect');

const port = process.env.PORT || 3000;

app.use(express.json());
//importing the routes
const adminRouter = require('./routes/admin');
const customerRouter = require('./routes/customer');
const authRouter = require('./routes/auth');
const customerProfile = require('./routes/customer/profile');

app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer/profile', customerProfile);

app.listen(port, () => {
  console.log("Listening at Port: ", port);
})