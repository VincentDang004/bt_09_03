var express = require('express');
let slugify = require('slugify');
var router = express.Router();
let modelProduct = require('../schemas/products');

// thêm dòng này
const { checkLogin, checkRole } = require('../utils/authHandler');


/* GET ALL - PUBLIC */
router.get('/', async function (req, res, next) {
  let data = await modelProduct.find({});
  let queries = req.query;

  let titleQ = queries.title ? queries.title.toLowerCase() : '';
  let maxPrice = queries.maxPrice ? queries.maxPrice : 1E4;
  let minPrice = queries.minPrice ? queries.minPrice : 0;
  let limit = queries.limit ? parseInt(queries.limit) : 5;
  let page = queries.page ? parseInt(queries.page) : 1;

  let result = data.filter(function (e) {
    return (!e.isDeleted) &&
      e.price >= minPrice &&
      e.price <= maxPrice &&
      e.title.toLowerCase().includes(titleQ);
  });

  result = result.splice(limit * (page - 1), limit);

  res.send(result);
});


/* GET BY ID - PUBLIC */
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findById(id);

    if (result && (!result.isDeleted)) {
      res.send(result);
    } else {
      res.status(404).send({ message: "ID not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID not found" });
  }
});


/* CREATE - mod + admin */
router.post('/',
  checkLogin,
  checkRole('mod', 'admin'),
  async function (req, res, next) {

    let newObj = new modelProduct({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-',
        locale: 'vi',
        trim: true
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      images: req.body.images
    });

    await newObj.save();
    res.send(newObj);
  }
);


/* UPDATE - mod + admin */
router.put('/:id',
  checkLogin,
  checkRole('mod', 'admin'),
  async function (req, res, next) {

    try {
      let id = req.params.id;

      let result = await modelProduct.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      res.send(result);
    } catch (error) {
      res.status(404).send({ message: "ID not found" });
    }
  }
);


/* DELETE - admin only */
router.delete('/:id',
  checkLogin,
  checkRole('admin'),
  async function (req, res, next) {

    try {
      let id = req.params.id;

      let result = await modelProduct.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      res.send(result);
    } catch (error) {
      res.status(404).send({ message: "ID not found" });
    }
  }
);


module.exports = router;