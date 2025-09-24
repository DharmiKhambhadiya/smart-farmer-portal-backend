const Order = require("../model/order");
const User = require("../model/user");

//---exports.GetWeeklyReportof order------

exports.GetWeeklyReport = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $project: {
          day: { $dayOfMonth: "$createdAt" }, // extract day from date
        },
      },
      {
        $addFields: {
          range: {
            $switch: {
              branches: [
                { case: { $lte: ["$day", 5] }, then: "1-5" },
                {
                  case: {
                    $and: [{ $gte: ["$day", 6] }, { $lte: ["$day", 10] }],
                  },
                  then: "6-10",
                },
                {
                  case: {
                    $and: [{ $gte: ["$day", 11] }, { $lte: ["$day", 15] }],
                  },
                  then: "11-15",
                },
                {
                  case: {
                    $and: [{ $gte: ["$day", 16] }, { $lte: ["$day", 20] }],
                  },
                  then: "16-20",
                },
                {
                  case: {
                    $and: [{ $gte: ["$day", 21] }, { $lte: ["$day", 25] }],
                  },
                  then: "21-25",
                },
                { case: { $gte: ["$day", 26] }, then: "26-31" },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: {
          _id: "$range",
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort by range
    ]);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "server error" });
  }
};


