const express = require('express');
const router = express.Router();
const Task = require('../models/task'); 

router.get('/', async (req, res) => {
    const { title, done, due, limit, page } = req.query;
    const today = new Date();
    
    const queryOptions = {
        where: {},
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: limit && page ? parseInt(limit, 10) * (parseInt(page, 10) - 1) : undefined
    };
  
    if (title) {
        queryOptions.where.title = { [Sequelize.Op.like]: `%${title}%` };
    }
    if (done) {
        queryOptions.where.done = done === 'true';
    }
    if (due === '1') {
        queryOptions.where.due_date = { [Sequelize.Op.lte]: today };
    } else if (due === '0') {
        queryOptions.where.due_date = { [Sequelize.Op.gte]: today };
    }
  
    try {
        const tasks = await Task.findAll(queryOptions);
        res.send(tasks);
    } catch (error) {
        console.log('Error fetching tasks:', error); 
        res.status(500).send('Internal Server Error');
    }
  });
  
  router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            res.send(task);
        } else {
            res.status(404).send('Task not found');
        }
    } catch (error) {
        console.log('Error fetching task by ID:', error); 
        res.status(500).send('Internal Server Error');
    }
  });
  
  router.post('/', async (req, res) => {
    try {
        const { title, description, due_date, type_id } = req.body;
        if (!title || !description) {
            return res.status(400).send('Title and description are required');
        }
        const newTask = await Task.create({ title, description, due_date, type_id });
        res.status(201).send(newTask);
    } catch (error) {
        console.log('Error creating task:', error); 
        res.status(500).send('Internal Server Error');
    }
  });

  router.put('/:id', async (req, res) => {
    const taskId = req.params.id;
    const { title, description, due_date, type_id, done } = req.body;
    const update_date = new Date();

    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).send("Tâche non trouvée");
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.due_date = due_date || task.due_date;
        task.type_id = type_id || task.type_id;
        task.done = done !== undefined ? done : task.done;
        task.update_date = update_date;

        await task.save();
        res.json(task.toJSON());
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour de la tâche");
    }
});
 

  router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.destroy();
            res.send('Task deleted');
        } else {
            res.status(404).send('Task not found');
        }
    } catch (error) {
        console.log('Error deleting task:', error); 
        res.status(500).send('Internal Server Error');
    }
  }
);
module.exports = router;