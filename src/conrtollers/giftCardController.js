const giftCard = require("../models/giftCard.js");

function generateGiftCardCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 15) {
            code += "-";
        }
    }
    return code;
}

function addOneYear(date) {
    const d = new Date(date);
    d.setUTCFullYear(d.getUTCFullYear() + 1);
    return d;
}

exports.CreateGiftCard = async (req, res) => {

    try {
        const { price } = req.body;
        let code;
        let existingCode;
        do {
            code = generateGiftCardCode();
            existingCode = await giftCard.findOne({ code });
        } while (existingCode);

        const now = new Date();
        const expiresAt = addOneYear(now);
        const newGiftCard = new giftCard({
            price,
            code,
            expiresAt,
        });

        await newGiftCard.save();
        return res.status(201).json({ message: "Gift card created", giftCard: newGiftCard });
    } catch (error) {
        console.log("error : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

exports.UseGiftCardByCode = async (req, res) => {
  try {
    const codeParam = String(req.params.code || "").toUpperCase().trim();

    const card = await giftCard.findOne({ code: codeParam });
    if (!card) {
      return res.status(404).json({ message: "Gift card not found" });
    }

    const now = Date.now();
    const exp = new Date(card.expiresAt).getTime();

    if (exp <= now) {
      return res.status(410).json({
        message: "Gift card expired",
        code: card.code,
        expiredAt: card.expiresAt,
      });
    }

    if (card.redeemed) {
      return res.status(409).json({
        message: "Gift card already redeemed",
        code: card.code,
        redeemedAt: card.redeemedAt,
      });
    }

    card.redeemed = true;
    card.redeemedAt = new Date();
    await card.save();

    return res.status(200).json({
      message: "Gift card redeemed successfully",
      code: card.code,
      amount: card.price,
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllGiftCard = async (req, res) => {
    try {
        const cards = await giftCard.find()
        return res.status(200).json({ message: "card succefuly finded", cards })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.GetGiftCardByCode = async (req, res) => {
    try {
        const codeParam = String(req.params.code || "").toUpperCase().trim();

        const card = await giftCard.findOne({ code: codeParam });
        if (!card) {
            return res.status(404).json({ message: "Gift card not found" });
        }

        const now = Date.now();
        const exp = new Date(card.expiresAt).getTime();

        if (exp <= now) {
            return res.status(410).json({
                message: "Gift card expired",
                code: card.code,
                expiredAt: card.expiresAt
            });
        }

        if (card.redeemed) {
            return res.status(409).json({
                message: "Gift card already redeemed",
                code: card.code,
                redeemedAt: card.redeemed
            });
        }

        return res.status(200).json({
            code: card.code,
            price: card.price,
            expiresAt: card.expiresAt,
            redeemed: card.redeemed,
        });
    } catch (error) {
        console.error("error : ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.DeleteGiftCardByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const deletedGiftCard = await giftCard.findOneAndDelete({ code });

        if (!deletedGiftCard) {
            return res.status(404).json({ message: "Gift card not found" });
        }

        return res.status(200).json({ message: "Gift card deleted successfully" });
    } catch (error) {
        console.error("error : ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}