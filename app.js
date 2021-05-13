//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://qayjjj:Muthop221@cluster0.l4n4n.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemsSchema
);

const item1 = new Item ({
  name: "Buy Food"
});

const item2 = new Item ({
  name: "Eat Food"
});

const item3 = new Item ({
  name: "Wash Up"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully inserted items.");
        }
      });
      res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  });
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
        console.log("Succesfully removed item.");
      }
    });
  } else {
    List.findOneAndUpdate( // finding a list
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function(err, foundList){ //result is foundlist
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
  
})

app.get("/:listType", function(req, res) {
  const listType = _.capitalize(req.params.listType);

  List.findOne({name: listType}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: listType,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listType);
      } else {
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    } 
    }
  });
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});
