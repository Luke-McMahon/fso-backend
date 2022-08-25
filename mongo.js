const mongoose = require("mongoose");

const peopleSchema = mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("person", peopleSchema);

const getPhonebook = () => {
  mongoose.connect(url).then((res) => {
    Person.find({}).then((result) => {
      let phonebook = "Phonebook:\n";
      result.forEach((p) => {
        phonebook += `${p.name} ${p.number}` + "\n";
      });

      console.log(phonebook);
      mongoose.connection.close();
    });
  });
};

if (process.argv.length === 3) {
  getPhonebook();
}

if (process.argv.length === 5) {
  mongoose
    .connect(url)
    .then((res) => {
      console.log("Connected");
    })
    .then(() => {
      const name = process.argv[3];
      const number = process.argv[4];
      const p = new Person({
        name,
        number,
      });
      console.log(`Added ${name} numbed ${number} to phonebook`);

      return p.save();
    })
    .then(() => {
      mongoose.connection.close();
    })
    .catch((err) => console.error(err));
}
