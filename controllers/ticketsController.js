const mailsModel = require('../models/mail')

const getTickets = async (req, res) => {
    try {
        const tickets = await mailsModel.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getSingleTicket = async (req, res) => {
    try {
        const ticket = await mailsModel.findOne({
            ID: req.params.id,
        });

        if (!ticket) {
            res.status(404).json({ message: "No such entry !" });
        } else {
            res.status(200).json(ticket);
        }
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const sendResponseTicket = async (req, res) => {
    try {
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.email,
                pass: process.env.pass,
            },
        });

        console.log(req)
        
        const mailOptions = {
            from: process.env.email,
            to: req.body.receiver,
            subject: req.body.subject,
            text: req.body.text,
        };
        
        //send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error:', error);
            }
            console.log('Email sent:', info.response);
        });

        res.status(200).json({message: "Ticket Response sent"});

    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getTickets,
    getSingleTicket,
    sendResponseTicket
}