
const express = require("express");
const jwt = require("jsonwebtoken")
const noteRoute = express.Router();

require('dotenv').config()
const secretKey = process.env.secretKey;

const { NoteModel } = require("../models/Note.model")



const authorization = async (req, res, next) => {
    let token = req.headers.authorization
    console.log(token)


    if (!token) {
        return res.status(401).send({ "error": "Please Login !" })

    }

    tokenValue = token.replace('Bearer ', "")

    // const decoded = jwt.verify(tokenValue, "secrzet")
    jwt.verify(tokenValue, secretKey, async (err, decoded) => {
        if (err) {
            return res.send({ "error": err.message })
        }

        req.body.author = decoded.author;
        req.body.authorID = decoded.authorID;
        next();
    })
}


noteRoute.get("/", async (req, res) => {

    let token = req.headers.authorization;
    if (!token) {
        return res.send(false)
    }
    tokenValue = token.replace('Bearer ', "")

    // let decoded = jwt.verify(tokenValue, "secret")

    jwt.verify(tokenValue, secretKey, async (err, decoded) => {
        if (err) {
            return res.send({ "error": err.message })
        }
        data = await NoteModel.find({ authorID: decoded.authorID })
        res.send(data)

    })



})


noteRoute.post("/create", authorization, async (req, res) => {

    let note = NoteModel(req.body)
    await note.save();
    res.send({ "messege": "one note has been added" })
})


noteRoute.patch("/update/:id", async (req, res) => {

    if (req.params.id) {

        let token = req.headers.authorization;
        if (!token) {
            return res.send(false)
        }

        tokenValue = token.replace('Bearer ', "")
        let decoded = jwt.verify(tokenValue, secretKey)

        note = await NoteModel.findOne({ _id: req.params.id })
        if (decoded.authorID == note.authorID) {
            await NoteModel.findByIdAndUpdate({ _id: req.params.id }, req.body)
            // await NoteModel.updateMany({ authorID: decoded.authorID }, { $set: req.body })

            res.send({ "messege": "Document has been updated " })
        }
        else {
            res.status(401).send({ "error": "You are not allowed to update others notes" })
        }
    }
    else {
        res.status(401).send({ "error": "please provide id " })
    }

})

//   delete

noteRoute.delete("/delete/:id", async (req, res) => {

    if (req.params.id) {
        let token = req.headers.authorization;
        if (!token) {
            return res.send(false)
        }

        tokenValue = token.replace('Bearer ', "")
        let decoded = jwt.verify(tokenValue, secretKey)
        note = await NoteModel.findOne({ _id: req.params.id })

        if (decoded.authorID == note.authorID) {
            await NoteModel.findByIdAndDelete({ _id: req.params.id })
            // await NoteModel.updateMany({ authorID: decoded.authorID }, { $set: req.body })
            res.send({ "messege": "Document has been deleted" })
        }
        else {
            res.status(401).send({ "error": "You are not allowed to delete others notes" })

        }
    }
    else {
        res.status(401).send({ "error": "please provide id " })
    }

})

module.exports = { noteRoute }