require('dotenv').config();
const express = require('express');
const prisma = require('./prismaClient');
const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { email, name } = req.body;
  const user = await prisma.user.create({ data: { email, name } });
  res.json(user);
});

app.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ include: { author: true } });
  res.json(posts);
});

app.post('/posts', async (req, res) => {
  const { title, content, authorId } = req.body;
  const post = await prisma.post.create({ data: { title, content, authorId } });
  res.json(post);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
