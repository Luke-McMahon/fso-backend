require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("build"));
app.use(cors());

const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const url = `mongodb+srv://fullstack:${password}@cluster0.thyjmzk.mongodb.net/${database}?retryWrites=true&w=majority`;

const Person = require("./models/person");

morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
  )
);

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people);
    })
    .catch((e) => next(e));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((e) => next(e));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Persons name is missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "Persons number is missing",
    });
  }

  Person.find({})
    .then((people) => {
      const exists = people.some((p) => p.name === body.name);
      if (exists) {
        return response.status(400).json({
          error: "Name must be unique",
        });
      }
      const newPerson = new Person({
        name: body.name,
        number: body.number,
      });

      newPerson.save().then((savedPerson) => {
        response.json(savedPerson);
      });
    })
    .catch((e) => next(e));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((e) => {
      next(e);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  console.log(body);
  Person.findByIdAndUpdate(
    request.params.id,
    { number: body.number },
    { new: true }
  )
    .then((result) => {
      response.json(result);
    })
    .catch((e) => next(e));
});

app.get("/info", (request, response) => {
  Person.find({}).then((people) => {
    const info = `Phonebook has info for ${people.length} people`;
    const date = new Date();

    const data = `<p>${info}</p>
    <p>${date.toString()}</p>
    `;

    return response.send(data);
  });
});

const errorHandler = (error, request, response, next) => {
  console.error("TEST", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  return next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
