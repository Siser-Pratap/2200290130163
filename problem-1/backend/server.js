import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 9876;

const window_size = 10;

let window = [];

const key = {
  'p': 'primes',
  'f': 'fibo',
  'e': 'even',
  'r': 'rand'
};

app.use(cors());
app.use(express.json());


app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;
  const type = key[numberId];
  const url = `http://20.244.56.144/evaluation-service/${type}`;
  let newNumbers = [];
  
  const response = await Promise.race([axios.get(url, {headers:{Authorization: `Bearer ${process.env.TOKEN}`}}),new Promise((_, reject) => setTimeout(() => reject('timeout'), 500))]);
  console.log(response.data);
  newNumbers = response.data.numbers;
  const windowPrevState = [...window];

  
  newNumbers.forEach(num => {
    if (!window.includes(num)) {
      if (window.length >= window_size){
        window.shift();
      }
      window.push(num);
    }
  });

  const avg = window.length? parseFloat((window.reduce((a, b) => a + b, 0) / window.length).toFixed(2)): 0.00;

  res.json({windowPrevState,windowCurrState: [...window],numbers: newNumbers,avg});
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
