const express = require("express");
const router = express.Router();
const { ToyModel, validToy } = require("../models/toyModel");
const { auth } = require("../auth/authToken");

router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 10) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";

  let reverse = req.query.reverse == "yes" ? -1 : 1;
  try {
    let data = await ToyModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    console.log(000000000);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.get("/single/:id", (req, res) => {
  let id = req.params.id;
  let singleToy = ToyModel.findById(id);
  if (!singleToy) {
    return res.json({ msg: "toy not found" });
  }
  res.json(singleToy);
});

router.get("/search", (req, res) => {
  let searchQ = req.query.s.toLowerCase();
  let temp_ar = ToyModel.find({}).filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQ) ||
      item.info.toLowerCase().includes(searchQ)
    );
  });
  res.json(temp_ar);
});

router.get("/category/:catName", (req, res) => {
  let catName = req.params.catName;
  let temp_ar = ToyModel.find({}).filter((item) => item.cat == catName);
  res.json(temp_ar);
});

router.get("/prices/:min/:max", (req, res) => {
  let min = req.params.min;
  let max = req.params.max;
  let temp_ar = ToyModel.find({}).filter((item) => {
    return Number(item.price) > Number(min) && Number(item.price) < Number(max);
    //   item.price>min &&
  });
  res.json(temp_ar);
});

router.post("/", auth, async (req, res) => {
  let validBody = validToy(req.body);
  console.log(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let toy = new ToyModel(req.body);
    toy._id = req.dataToken._id;
    await toy.save();
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.delete("/:idDel", auth, async (req, res) => {
  try {
    let idDel = req.params.idDel;
    let data = await ToyModel.deleteOne({
      _id: idDel,
      user_id: req.dataToken._id,
    });
    res.json(data);
  } catch {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.put("/:idEdit", auth, async (req, res) => {
  let validBody = validToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data = await ToyModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
module.exports = router;
