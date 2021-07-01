const express = require("express");
const router = express.Router();
const StoreController = require("../controllers/StoreController");
const { catchErrors } = require("../handlers/errorHandlers");
// Do work here
router.get("/", StoreController.getStore);
router.get("/stores", StoreController.getStore);
router.get("/add", StoreController.addStore);

router.post(
  "/add",
  StoreController.upload,
  catchErrors(StoreController.resize),
  catchErrors(StoreController.createStore)
);

router.post("/add/:id", catchErrors(StoreController.updateStore));

router.get(
  "/stores/:id/edit",
  StoreController.upload,
  catchErrors(StoreController.resize),
  catchErrors(StoreController.editStore)
);

router.get("/store/:slug", catchErrors(StoreController.getStoreBySlug));

router.get("/tags", catchErrors(StoreController.getStoreByTag));
router.get("/tags/:tag", catchErrors(StoreController.getStoreByTag));

module.exports = router;
