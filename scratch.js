const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

request(
  "https://bet.szerencsejatek.hu/cmsfiles/skandi.html",
  (error, resp, html) => {
    if (!error && resp.statusCode === 200) {
      const $ = cheerio.load(html);
      const $tbody = $("tbody");

      let data = [];
      Object.values($tbody.children("tr")).forEach((row, rowIndex) => {
        const weekData = {
          date: null,
          numbers_auto: [],
          numbers_manual: []
        };
        if (rowIndex >= 2) {
          Object.values($(row).children("td")).forEach((td, tdIndex) => {
            if (tdIndex === 2) {
              weekData.date = $(td)
                .text()
                .replace(/\./g, "/")
                .replace(/\/$/g, "");
            } else if (tdIndex >= 11 && tdIndex <= 17) {
              weekData.numbers_auto.push(Number($(td).text()));
            } else if (tdIndex >= 18 && tdIndex <= 24) {
              weekData.numbers_manual.push(Number($(td).text()));
            }
          });
          data.push(weekData);
        }
      });

      const stringified = JSON.stringify(data, null, 2);
      fs.writeFileSync("lotto.json", stringified);
    }
  }
);
