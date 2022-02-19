const getBNBToken = require("../middleware/getTokenPrice");
const ash=require('express-async-handler')

const getTokenAvgPrice = ash(async(req, res) => {
  //const tokenAddress = req.params.tokenAddress;
  try {
    let avgPrice= await getBNBToken();
/*    if (tokenAddress==undefined) {
      return res.status(400).send({ message: "Please add a tokenAddress!" });
    }*/
    res.status(200).send(avgPrice);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: `Could not get the tokenPrice: ${err}`,
    });
  }
});

module.exports = {
  getTokenAvgPrice
};
