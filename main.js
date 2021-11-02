const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();

const subsRouter = require('./routers/subsRouter');



app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended : false}));

require('./configs/database');
app.use('/api/subs', subsRouter);

app.listen(8000);


