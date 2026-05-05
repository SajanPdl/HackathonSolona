import 'dotenv/config';
import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from './prismaClient';

const app = express();
app.use(express.json());

const handleValidation = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return null;
};

// Users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', param('id').isInt(), async (req: Request, res: Response) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/users', [body('email').isEmail(), body('name').optional().isString()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, name } = req.body;
  const user = await prisma.user.create({ data: { email, name } });
  res.status(201).json(user);
});

app.put('/users/:id', [param('id').isInt(), body('email').optional().isEmail(), body('name').optional().isString()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = Number(req.params.id);
  const { email, name } = req.body;
  try {
    const user = await prisma.user.update({ where: { id }, data: { email, name } });
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'User not found or update failed' });
  }
});

app.delete('/users/:id', param('id').isInt(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'User not found or delete failed' });
  }
});

// Posts
app.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ include: { author: true } });
  res.json(posts);
});

app.get('/posts/:id', param('id').isInt(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id }, include: { author: true } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/posts', [body('title').isString().notEmpty(), body('authorId').isInt()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, content, authorId } = req.body;
  try {
    const post = await prisma.post.create({ data: { title, content, authorId } });
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: 'Create failed', details: e });
  }
});

app.put('/posts/:id', [param('id').isInt(), body('title').optional().isString(), body('authorId').optional().isInt()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = Number(req.params.id);
  const { title, content, authorId } = req.body;
  try {
    const post = await prisma.post.update({ where: { id }, data: { title, content, authorId } });
    res.json(post);
  } catch (e) {
    res.status(404).json({ error: 'Post not found or update failed' });
  }
});

app.delete('/posts/:id', param('id').isInt(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = Number(req.params.id);
  try {
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'Post not found or delete failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
