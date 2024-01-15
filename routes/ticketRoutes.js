const express = require('express');
const mailsController = require('../controllers/ticketsController');

const router = express.Router();

//GET Recent blogs
router.get("/tickets", mailsController.getTickets);

router.get("/tickets/:id", mailsController.getSingleTicket);

router.post("/tickets/send", mailsController.sendResponseTicket);

//Exporting Modules
module.exports = router;