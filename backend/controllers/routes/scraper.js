import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { authenticateUser } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(express.json());

// Funkce na extrakci OpenGraph metadat
function extractOpenGraph($) {
    const ogData = {};
    $("meta").each((_, el) => {
      const property = $(el).attr("property") || $(el).attr("name");
      const content = $(el).attr("content");
      if (property && content) {
        if (property.startsWith("og:")) {
          ogData[property.replace("og:", "")] = content;
        }
      }
    });
    return ogData;
}

// Funkce na extrakci JSON-LD strukturovaných dat
function extractJSONLD($) {
    let jsonldData = {};
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json["@type"] === "Product") {
          jsonldData = json;
        }
      } catch (err) {
        // ignore invalid json
      }
    });
    return jsonldData;
}

// Heuristické vyhledávání informací (fallback)
function heuristicExtraction($, url) {
    let title = "";
    let price = "";
    let image = "";
    let description = "";    

    /**
     * 
     * Customizace pro konkrétní weby
     * 
     */
    // Alza.cz
    if (url.includes("alza.cz")) {
        const alzaImage = $("img[alt*='Hlavní obrázek'], img[title*='Hlavní obrázek']").attr("src");
        if (alzaImage) {
            image = alzaImage.startsWith("http") ? alzaImage : "https://www.alza.cz" + alzaImage;
        }

        const alzaPrice = $(".price-box__primary-price__value.js-price-box__primary-price__value")
            .first()
            .text()
            .replace(/\s/g, "")  // odstraní &nbsp;
            .replace(/-$/, "")   // odstraní pomlčku na konci, např. "7 290,-" => "7290"
            .trim();
        if (alzaPrice) {
            price = alzaPrice;
        }
    }

    /**
     * 
     * Fallback pro ostatní weby
     * 
     */
    if(title === "") title = $('h1').first().text().trim() || $('title').text().trim();
    if(price === "") price = $("[class*='price'], [id*='price']").first().text().trim();
    if(image === "") image = $("img").first().attr("src");
    if(description === "") description = $("meta[name='description']").attr("content") || "";
  
    return { title, price, image, description };
}
// Pomocné funkce pro úpravu title, price a detekci měny
function trimTitleToThirdSpace(title) {
    const parts = title.split(' ');
    return parts.slice(0, 3).join(' ');
}
  
function extractNumericPrice(price) {
    if (typeof price !== 'string') price = price.toString();
    const match = price.match(/[0-9]+([.,][0-9]+)?/);
    return match ? match[0].replace(',', '.') : '';
}
  
function detectCurrency(price) {
    if (price.includes('€')) return 'EUR';
    if (price.includes('$')) return 'USD';
    if (price.includes('£')) return 'GBP';
    if (price.includes('Kč') || price.includes('CZK')) return 'CZK';
    return '';
}

// POST /api/scraper/wishlistItemData - vrátí údaje o položce wishlistu
router.post("/wishlistItemData", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
  
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    let { url } = req.body;
    
    if (!url) return res.status(400).json({ error: "Missing URL" });
  
    try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
        await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

        const html = await page.content();
        await browser.close();

        const $ = cheerio.load(html);
    
        const ogData = extractOpenGraph($);
        const jsonldData = extractJSONLD($);
        const fallbackData = heuristicExtraction($, url);

        const rawTitle = ogData.title || jsonldData.name || fallbackData.title || "";
        const rawPrice = (jsonldData.offers && jsonldData.offers.price) ||
            jsonldData.price ||
            fallbackData.price ||
            "";

        const productData = {
            title: trimTitleToThirdSpace(rawTitle),
            description:
                ogData.description || jsonldData.description || fallbackData.description || "",
            price: extractNumericPrice(rawPrice),
            currency:
                (jsonldData.offers && jsonldData.offers.priceCurrency) || detectCurrency(rawPrice),
            image: ogData.image || (jsonldData.image && jsonldData.image[0]) || fallbackData.image || "",
            url: url,
        };

        res.json(productData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch and parse data." });
    }
});

export default router;