const express = require('express')
const morgan = require('morgan')
const { requestLogger } = require('./middleware/requestLogger')
const { unknownEndpoint } = require('./middleware/unknownEndpoint')

const app = express()

app.use(express.json())
app.use(requestLogger)

morgan.token('body', (req, res) => JSON.stringify(req.body))
morgan.token("custom", "Received method :method for :url. It took :total-time[2] ms to be resolved with status: :status. Request body: :body")
app.use(morgan('custom'))

let persons = [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
  ]

app.get('/', (request, response) => {
  response.send('<h1>Index</h1>')
})

app.get('/info', (request, response) => {
  let phonebookSize = persons.length
  let currentTime = new Date()
  response.send(`
    <p>Phonebook has info for ${phonebookSize} people</p>
    <p>${currentTime}</p>
  `)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  person ? response.json(person) : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'bad request, name is missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'bad request, number is missing'
    })
  }

  const checkDublicate = persons.filter(person => person.name === body.name)
  
  if (checkDublicate.length > 0) {
    return response.status(400).json({
      error: 'Person is aready in the phonebook'
    })
  } 

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 999)
  }
  persons = persons.concat(person)
  response.json(person)
})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

