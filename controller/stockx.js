require("dotenv").config();
const cheerio = require("cheerio");
const axios = require("axios");

const sizeChat = require("../ProductsSizes/SizesChart");

//
const convertCurrency = (symbol, Amount) => {
  var exchangeRateEuroPrice = "0.90";
  var euroSymbol = "€";

  Amount = Amount.replace(",", "");
  console.log("Amount is usd", Number(Amount));
  if (symbol == "$") {
    const convertedAmount = Number(Amount) * Number(exchangeRateEuroPrice);
    return euroSymbol + convertedAmount;
  }
};

//  // // // // // // // // // // // // // // // // // // //
//
//
//
//
// function to Scrap the Product Details Like, Name, Description etc
//
//
//
// // // // // // // // // // // // // // // // // // // //
const getScrapData = async (productName) => {
  try {
    var url = `https://stockx.com/${productName}`;

    var retailPrice;
    var productName;
    var sizeData = [];
    var responseData;
    var CategoryName;
    axios
      .get(url, {
        headers: {
          Authorization: "stockx.com",
          "Content-Type": "application/json, text/plain ",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        },
      })
      .then(async (response) => {
        responseData = response.data;
      })
      .catch((err) => {
        console.log("this is erro", err.message);
      });

    await new Promise((resolve) => {
      return setTimeout(resolve, 5000);
    });

    let $ = cheerio.load(responseData);
    var findName = await $(".css-exht5z").text();
    productName = findName;
    var CategoryName = await $(
      ".chakra-breadcrumb ol li:nth-child(4) a"
    ).text();

    var elements;
    if ($(".css-1ufjsin").length) {
      elements = $(".css-1ufjsin");
    } else {
      elements = $(".css-101wtdy");
    }

    var lSale = "";
    elements.each((index, element) => {
      var innerText = $(element).text();
      // console.log("innerText", innerText);
      if (innerText.includes("Retail Price") == true) {
        lSale = innerText;
      }
    });

    lSale = lSale.split("$");
    lSale = lSale[1];
    console.log("lSale price", lSale);
    var price = convertCurrency("$", lSale);
    retailPrice = price;

    var exactSizesEU = [];
    var exactSizesUS = [];

    // getting sized of EU

    console.log("sizeData", sizeData);
    sizeData.forEach((item, inex) => {
      if (item.search("EU") != -1) {
        exactSizesEU.push(item);
      }
    });

    CategoryName = CategoryName.toLowerCase();
    console.log("exactSizesEU ", exactSizesEU);
    if (exactSizesEU.length == 0) {
      // var sizesArrayByCategory = sizeChat.CategoryName;
      var chartTableArry = sizeChat.sizechart;

      chartTableArry.forEach((item, index) => {
        if (item[0] == CategoryName) {
          item[1].forEach((item2, index) => {
            exactSizesEU.push(item2);
          });
        }
      });
    }

    return {
      success: true,
      Name: productName,
      retailPrice: retailPrice,
      sizeEU: exactSizesEU,
      sizeUS: exactSizesUS,
    };
  } catch (err) {
    console.log(err);
    return { success: false, msg: err.message };
  }
};

//  // // // // // // // // // // // // // // // // // // //
//
//
//
//
// function to search proudct by Name (Main API)
//
//
//
// // // // // // // // // // // // // // // // // // // //

const findProudctByName = async (req, res) => {
  try {
    var productName = req.body.productName;
    console.log(productName);
    productName = productName.replace(/\s+/g, "-").toLowerCase();
    productName = productName.replace(")", "");
    productName = productName.replace("(", "");
    // console.log(productName);
    var result = await getScrapData(productName);

    console.log("this is result", result);
    if (result.success == true) {
      res.status(200).json({
        success: true,
        ProductName: result.Name,
        RetailPrice: result.retailPrice,
        sizeEU: result.sizeEU,
        sizeUS: result.sizeUS,
      });
    } else {
      res.status(404).json({ success: false, msg: result.msg });
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ success: false, msg: "something went wrong  from server" });
  }
};

// exporting module
const object = { findProudctByName };
module.exports = object;
