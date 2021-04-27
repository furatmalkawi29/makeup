'use strict';

//app dep 
const express= require ('express');
const pg= require ('pg');
const superagent= require ('superagent');
const methodOverride= require ('method-override');
const cors = require ('cors');
const { renderFile } = require('ejs');

//env var
require('dotenv').config();

const PORT= process.env.PORT ;
const DATABASE_URL= process.env.DATABASE_URL;

//app setup
const server = express();
const client = new pg.Client(DATABASE_URL);

// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


//middleare 
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));

server.set('view engine', 'ejs');


// //routs
server.get('/',homeHandler);
server.post('/products',getProd);
server.get('/products/maybelline',getMaybe);
server.post('/product/my-products',addProd);
server.get('/product/my-products',displayProd);
server.get('/product/:product_id',prodDetails);
server.delete('/product/:product_id',prodDelete);
server.put('/product/:product_id',prodUpdate);





function homeHandler (req,res){
  res.render('index');
}



function getProd (req,res){
const {brand,price_up,price_down} = req.body;
const url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${price_up}&price_less_than=${price_down}`;

superagent.get(url).then(data=>{
res.render('Product-By-Price', {prod:data.body});
  }).catch(error=> console.log(error));
}


function getMaybe (req,res){
const url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
superagent.get(url).then(data=>{
let prodArr = data.body.map ( item => new Product(item));
res.render('Maybelline-Products', {prod:prodArr});

}).catch(error=> console.log(error));
  
}


function addProd (req,res){
  const {name,price,image,description} = req.body;
  let sql = `INSERT INTO products (name,price,image,description) VALUES ($1,$2,$3,$4) `;
  let safeValues = [name,price,image,description];

  client.query(sql,safeValues).then( ()=>{
    res.redirect('/product/my-products');
  }).catch(error=> console.log(error));
}


function displayProd (req,res){
  let sql = `SELECT * FROM products`;

  client.query(sql).then( data=>{
res.render('my-card',{prod:data.rows});
  }).catch(error=> console.log(error));
}


function prodDetails (req,res){
  let sql = `SELECT * FROM products WHERE id=$1`;
  let safeValues = [req.params.product_id];

  client.query(sql,safeValues).then( data=>{
res.render('product-details',{prod:data.rows});
  }).catch(error=> console.log(error));
}


function prodDelete (req,res){
  let sql = `DELETE FROM products WHERE id=$1`;
  let safeValues = [req.params.product_id];

  client.query(sql,safeValues).then( ()=>{
res.redirect('/product/my-products');
  }).catch(error=> console.log(error));
}


function prodUpdate (req,res){
  const {name,price,image,description} = req.body;
  let sql = `UPDATE products SET name=$1,price=$2,image=$3,description=$4  WHERE id=$5`;
  let safeValues = [name,price,image,description,req.params.product_id];


  client.query(sql,safeValues).then( ()=>{
res.redirect(`/product/${req.params.product_id}`);
  }).catch(error=> console.log(error));
}

//constructor

function Product (item){
  this.name = item.name;
  this.price = item.price;
  this.image = item.image_link;
  this.description = item.description;
}



//listen 
client.connect().then(()=> {
  server.listen(PORT,()=>console.log(`Listening on PORT ${PORT}`))
}).catch(error=> console.log(error));