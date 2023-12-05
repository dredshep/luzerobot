import { load } from "cheerio";

// Define an interface for the data structure including color
interface HourlyPrice {
  date: string;
  hour: string;
  price: string;
  color: string;
}

// The main function now accepts a date parameter
export async function getLuz(requestedDate: string) {
  // try {
  const url = `https://tarifaluzhora.es/?date=${requestedDate}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Error fetching HTML: ${response.status}`);
    return;
  }

  const html = await response.text();
  const $ = load(html);
  const prices: HourlyPrice[] = [];
  const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;
  let date = "";
  const dateMatch = $("body").text().match(dateRegex);
  if (dateMatch) {
    date = dateMatch[0];
  }

  $(".template-tlh__colors--hours").each((index, element) => {
    const hour = $(element).find('span[itemprop="description"]').text().trim();
    const price = $(element).find('span[itemprop="price"]').text().trim();
    const colorCircle = $(element)
      .find(".template-tlh__colors--hours-circle")
      .attr("class");

    const colorMatch = colorCircle
      ? colorCircle.match(/template-tlh__background-color-(\w+)/)
      : null;
    const color = colorMatch ? colorMatch[1] : "unknown";

    if (hour && price) {
      prices.push({ date, hour, price, color });
    }
  });
  return prices;

  //   console.log(prices);
  // } catch (error) {
  //   console.error(`An error occurred: ${error}`);
  // }
}

// Call main function with a specific date
// getLuz("2023-12-06");
