const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateId } = require('../middleware/validators');
const { deleteNote, updateNote } = require('../controllers/notes');


const noteController = require("../controllers/notes.js");


// get all notes
router.get("/api/notes", noteController.getAll);

// get one note
router.get("/api/notes/(:id)", noteController.getNote);

// delete note by id
router.delete('/api/notes/:id', [
    check('id')
        .trim()
        .notEmpty()
        .withMessage("Id cannot be empty")
        .custom(validateId)
], noteController.deleteNote);

router.patch('/api/notes/:id', [
    check('id')
        .trim()
        .notEmpty()
        .withMessage("Id cannot be empty")
        .custom(validateId),
    check('temperature')
        .trim()
        .notEmpty()
        .withMessage("Temperature must be set")
        .isNumeric()
        .withMessage("Temperature must be numeric value")
        .custom((value) => {
            if (value >= -80 && value <= 50) {
                return true;

            } else {
                throw new Error("Temperature must be between +50 and -80");
            }
        }),
    check('comment')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage("Comment must be between 2 and 200 characters")
        .custom((value) => {
            if (!/^[A-Za-z0-9 .,'!&]+$/.test(value)) {
                throw new Error('Comment can only contain alphanumeric characters, spaces, and these special characters: .,\'!&');
            }
            return true;
        })


], noteController.updateNote);

module.exports = router;