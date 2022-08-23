const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.static("build"));
app.use(cors());

morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
  )
);

let people = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const maxId = people.length > 1 ? Math.max(...people.map((p) => p.id)) : 0;
  return maxId + 1;
};

const checkIfExists = (body) => {
  const nameExists = people.filter((p) => p.name === body.name);
  return nameExists;
};

app.get("/api/persons", (request, response) => {
  response.json(people);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = people.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
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

  const exists = checkIfExists(body);
  if (exists.length > 0) {
    return response.status(409).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  people = people.concat(newPerson);
  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  people = people.filter((p) => p.id !== id);

  response.status(204).end();
});

app.get("/info", (request, response) => {
  const info = `Phonebook has info for ${people.length} people`;
  const date = new Date();

  const data = `<p>${info}</p>
  <p>${date.toString()}</p>
  `;

  response.send(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
