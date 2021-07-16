import "../sass/style.scss";
import "regenerator-runtime/runtime";
import { $, $$ } from "./modules/bling";
import autocomplete from "./modules/autocomplete";
import typeAhead from "./modules/typeAhead";
import makeMap from "./modules/map";
import ajaxHeart from "./modules/heart";
import Popup from "./modules/popup";
import otpForm from "./modules/otp";

autocomplete($("#address"), $("#locations"), $("#lat"), $("#lng"));

typeAhead($(".search"));

makeMap($("#map"));

const heartForms = $$("form.heart");
heartForms.on("submit", ajaxHeart);

const crossMarks = document.querySelectorAll(".delete");
crossMarks.forEach((cross) => {
  cross.addEventListener("click", Popup);
});

otpForm();
