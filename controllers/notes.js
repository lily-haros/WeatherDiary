const express = require('express');
const Note = require('../models/Note');
const { validationResult } = require('express-validator');
const bodyParser = require('body-parser');

// get all notes
const getAll = async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        res.status(404).json({
            msg: "Not found"
        })
    }
};

// get one note
const getNote = async (req, res) => {
    try {

        const id = req.params.id;

        const note = await Note.findById(id);

        res.json(note);
    } catch (error) {
        res.status(404).json({
            msg: "Not found"
        })
    }
};


// delete note
const deleteNote = async (req, res) => {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const delNote = await Note.findByIdAndDelete(id);
        if (!delNote) {
            return res.status(404).json({ msg: `Note with id ${id} not found` });
        }
        console.log(delNote);
        res.json({
            msg: `Note-> ID: ${id} date: ${delNote.date}, temperature: ${delNote.temperature}, comment: '${delNote.comment}' deleted succesfully`
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateNote = async (req, res) => {
    const { id } = req.params;
    console.log("id in controllers is ", id);
    console.log("body in here is ", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const noteToUpdate = {
        temperature: req.body.temperature,
        comment: req.body.comment
    };

    try {
        const updatedNote = await Note.findByIdAndUpdate(id, noteToUpdate, { new: true });
        if (updatedNote) {
            res.json(
                {
                    msg: "note updated",
                    updatedNote
                }
            );
        } else {
            return res.status(400).json({ msg: "no note on that id" });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};




// export
module.exports = {
    deleteNote,
    getAll,
    getNote,
    updateNote
}

