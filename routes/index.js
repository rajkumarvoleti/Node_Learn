const express = require("express");
const router = express.Router();
const StoreController = require("../controllers/StoreController");
const { catchErrors } = require("../handlers/errorHandlers");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
// Do work here
router.get("/", StoreController.getStore);
router.get("/stores", StoreController.getStore);
router.get("/stores/page/:page", StoreController.getStore);
router.get("/add", authController.isLoggedIn, StoreController.addStore);

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

router.get("/login", userController.loginForm);
router.post("/login", authController.login);

router.get("/register", userController.registerForm);

// 1.Validate the registration data
// 2. Register the user
// 3. We need to log them in
router.post("/register/otp", catchErrors(authController.sendOtp));
router.post(
  "/register",
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

//logout
router.get("/logout", authController.logout);

// account
router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));

// forgot
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:token", catchErrors(authController.reset));
router.post(
  "/account/reset/:token",
  authController.confirmPasswords,
  authController.update
);

//map
router.get("/map", StoreController.mapPage);

// heart
router.get(
  "/hearts",
  authController.isLoggedIn,
  catchErrors(StoreController.getHearts)
);

// review
router.post(
  "/reviews/:id",
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

// top
router.get("/top", catchErrors(StoreController.getTopStores));

// delete
router.post("/delete/:id/store", catchErrors(StoreController.deleteStore));
router.post("/delete/:id/review", catchErrors(reviewController.deleteReview));

// API
router.get("/api/search", catchErrors(StoreController.searchStores));
router.get("/api/stores/near", catchErrors(StoreController.mapStores));
router.post("/api/stores/:id/heart", catchErrors(StoreController.heartStore));

module.exports = router;
